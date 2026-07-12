import { NextResponse } from 'next/server';
import { stripe, createCheckoutSession } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { patientId } = await request.json();

  if (!patientId) {
    return NextResponse.json({ error: 'patientId required' }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const session = await createCheckoutSession(patientId, patient.email ?? '');
  return NextResponse.json({ url: session.url });
}
