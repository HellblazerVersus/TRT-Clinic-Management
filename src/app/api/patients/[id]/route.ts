import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patients/[id] — full patient detail
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      protocols: { orderBy: { startDate: 'desc' } },
      labResults: { orderBy: { date: 'asc' } },
      rxRenewals: { orderBy: { renewalDueDate: 'desc' } },
      reminderLogs: { orderBy: { sentAt: 'desc' }, take: 20 },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  return NextResponse.json(patient);
}

// PATCH /api/patients/[id] — update patient fields
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const updated = await prisma.patient.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.phone && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.consentSigned !== undefined && {
        consentSigned: body.consentSigned,
        consentSignedAt: body.consentSigned ? new Date() : undefined,
      }),
    },
  });

  return NextResponse.json(updated);
}
