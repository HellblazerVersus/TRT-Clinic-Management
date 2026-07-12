import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { addDays } from 'date-fns';

// GET /api/patients — list all patients with alert metadata
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';

  const patients = await prisma.patient.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    include: {
      protocols: {
        where: { status: 'ACTIVE' },
        orderBy: { nextDoseDate: 'asc' },
        take: 1,
      },
      rxRenewals: {
        where: { status: { in: ['PENDING', 'OVERDUE'] } },
        orderBy: { renewalDueDate: 'asc' },
        take: 1,
      },
      labResults: {
        where: { flagged: true },
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  });

  const now = new Date();
  const enriched = patients.map((p) => {
    const nextDoseDate = p.protocols[0]?.nextDoseDate ?? null;
    const renewalDueDate = p.rxRenewals[0]?.renewalDueDate ?? null;
    const hasFlaggedLab = p.labResults.length > 0;

    const doseDaysAway = nextDoseDate
      ? Math.ceil((nextDoseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const renewalDaysAway = renewalDueDate
      ? Math.ceil((renewalDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      intakeDate: p.intakeDate,
      consentSigned: p.consentSigned,
      subscriptionStatus: p.subscriptionStatus,
      nextBillingDate: p.nextBillingDate,
      labDueDate: p.labDueDate,

      // Alert fields
      nextDoseDate,
      doseDaysAway,
      renewalDueDate,
      renewalDaysAway,
      hasFlaggedLab,

      // Computed alert level
      doseAlert: doseDaysAway !== null ? (doseDaysAway < 0 ? 'overdue' : doseDaysAway <= 3 ? 'warning' : 'ok') : 'none',
      renewalAlert: renewalDaysAway !== null ? (renewalDaysAway < 0 ? 'overdue' : renewalDaysAway <= 3 ? 'warning' : 'ok') : 'none',
    };
  });

  return NextResponse.json(enriched);
}

// POST /api/patients — create patient + initial protocol + lab entries
const createPatientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  dateOfBirth: z.string().optional(),
  consentSigned: z.boolean().default(false),
  notes: z.string().optional(),

  // Initial protocol (optional)
  protocol: z
    .object({
      compound: z.string(),
      compoundLabel: z.string(),
      dose: z.string(),
      frequency: z.string(),
      route: z.string().optional(),
      prescriber: z.string().optional(),
      startDate: z.string(),
      nextDoseDate: z.string().optional(),
    })
    .optional(),

  // Initial lab results
  labs: z
    .array(
      z.object({
        marker: z.string(),
        markerLabel: z.string(),
        value: z.number(),
        unit: z.string(),
        referenceMin: z.number().optional(),
        referenceMax: z.number().optional(),
        labName: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createPatientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { protocol, labs, ...patientData } = parsed.data;

  const patient = await prisma.$transaction(async (tx) => {
    const newPatient = await tx.patient.create({
      data: {
        name: patientData.name,
        phone: patientData.phone,
        email: patientData.email,
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined,
        consentSigned: patientData.consentSigned,
        consentSignedAt: patientData.consentSigned ? new Date() : undefined,
        notes: patientData.notes,
        labDueDate: addDays(new Date(), 90),
        baselineLabs: {},
      },
    });

    if (protocol) {
      await tx.protocol.create({
        data: {
          patientId: newPatient.id,
          compound: protocol.compound,
          compoundLabel: protocol.compoundLabel,
          dose: protocol.dose,
          frequency: protocol.frequency,
          route: protocol.route,
          prescriber: protocol.prescriber,
          startDate: new Date(protocol.startDate),
          nextDoseDate: protocol.nextDoseDate ? new Date(protocol.nextDoseDate) : undefined,
        },
      });
    }

    if (labs && labs.length > 0) {
      const now = new Date();
      await tx.labResult.createMany({
        data: labs.map((lab) => ({
          patientId: newPatient.id,
          marker: lab.marker,
          markerLabel: lab.markerLabel,
          value: lab.value,
          unit: lab.unit,
          date: now,
          referenceMin: lab.referenceMin,
          referenceMax: lab.referenceMax,
          labName: lab.labName,
          flagged:
            lab.referenceMin !== undefined && lab.referenceMax !== undefined
              ? lab.value < lab.referenceMin || lab.value > lab.referenceMax
              : false,
        })),
      });
    }

    return newPatient;
  });

  return NextResponse.json(patient, { status: 201 });
}
