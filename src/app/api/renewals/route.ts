export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { addDays } from 'date-fns';

// GET /api/renewals — renewal queue (due within N days, optionally filtered)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') ?? '30');
  const compound = searchParams.get('compound');
  const status = searchParams.get('status'); // PENDING | OVERDUE | DISPENSED

  const windowEnd = addDays(new Date(), days);

  const renewals = await prisma.rxRenewal.findMany({
    where: {
      ...(status
        ? { status: status as any }
        : { status: { in: ['PENDING', 'OVERDUE'] } }),
      ...(compound ? { compound } : {}),
      renewalDueDate: { lte: windowEnd },
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
          subscriptionStatus: true,
        },
      },
    },
    orderBy: { renewalDueDate: 'asc' },
  });

  return NextResponse.json(renewals);
}

// POST /api/renewals/dispense — log dispensed Rx + advance nextDoseDate
const dispenseSchema = z.object({
  renewalId: z.string(),
  deaLotNumber: z.string().min(1),
  pharmacyName: z.string().optional(),
  notes: z.string().optional(),
  nextRenewalDays: z.number().default(90), // days until next renewal
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = dispenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { renewalId, deaLotNumber, pharmacyName, notes, nextRenewalDays } = parsed.data;

  const renewal = await prisma.rxRenewal.findUnique({ where: { id: renewalId } });
  if (!renewal) {
    return NextResponse.json({ error: 'Renewal not found' }, { status: 404 });
  }

  // Update existing renewal to DISPENSED
  const updated = await prisma.rxRenewal.update({
    where: { id: renewalId },
    data: {
      status: 'DISPENSED',
      dispenseDate: new Date(),
      deaLotNumber,
      pharmacyName: pharmacyName ?? renewal.pharmacyName,
      notes,
    },
  });

  // Create next renewal record
  const nextRenewal = await prisma.rxRenewal.create({
    data: {
      patientId: renewal.patientId,
      compound: renewal.compound,
      compoundLabel: renewal.compoundLabel,
      quantity: renewal.quantity,
      prescriber: renewal.prescriber,
      scheduleClass: renewal.scheduleClass,
      pharmacyName: pharmacyName ?? renewal.pharmacyName,
      renewalDueDate: addDays(new Date(), nextRenewalDays),
      status: 'PENDING',
    },
  });

  // Advance the protocol's nextDoseDate if within 3 days
  const protocol = await prisma.protocol.findFirst({
    where: {
      patientId: renewal.patientId,
      compound: renewal.compound,
      status: 'ACTIVE',
    },
  });

  if (protocol && protocol.nextDoseDate) {
    const daysAway = Math.ceil(
      (protocol.nextDoseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysAway <= 3) {
      // Determine next dose based on frequency
      const freqMap: Record<string, number> = {
        twice_weekly: 3,
        weekly: 7,
        biweekly: 14,
        monthly: 30,
        nightly: 1,
        daily: 1,
        as_needed: 7,
      };
      const daysToAdd = freqMap[protocol.frequency] ?? 7;
      await prisma.protocol.update({
        where: { id: protocol.id },
        data: { nextDoseDate: addDays(new Date(), daysToAdd) },
      });
    }
  }

  return NextResponse.json({ dispensed: updated, nextRenewal });
}
