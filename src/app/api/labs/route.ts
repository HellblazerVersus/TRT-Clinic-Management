export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addLabSchema = z.object({
  patientId: z.string(),
  marker: z.string(),
  markerLabel: z.string(),
  value: z.number(),
  unit: z.string(),
  date: z.string(),
  referenceMin: z.number().optional(),
  referenceMax: z.number().optional(),
  labName: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = addLabSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const flagged =
    data.referenceMin !== undefined && data.referenceMax !== undefined
      ? data.value < data.referenceMin || data.value > data.referenceMax
      : false;

  const lab = await prisma.labResult.create({
    data: {
      patientId: data.patientId,
      marker: data.marker,
      markerLabel: data.markerLabel,
      value: data.value,
      unit: data.unit,
      date: new Date(data.date),
      flagged,
      referenceMin: data.referenceMin,
      referenceMax: data.referenceMax,
      labName: data.labName,
      notes: data.notes,
    },
  });

  return NextResponse.json(lab, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const marker = searchParams.get('marker');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId required' }, { status: 400 });
  }

  const labs = await prisma.labResult.findMany({
    where: {
      patientId,
      ...(marker ? { marker } : {}),
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(labs);
}
