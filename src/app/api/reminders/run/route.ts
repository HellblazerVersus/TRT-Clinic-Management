export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { runReminders } from '@/lib/reminders';

// GET /api/reminders/run — trigger reminder job
// Secured by x-cron-secret header
export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await runReminders();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[Reminders API] Error:', err);
    return NextResponse.json({ error: 'Reminder job failed' }, { status: 500 });
  }
}

// POST also supported for Vercel Cron (which uses POST)
export async function POST(request: Request) {
  return GET(request);
}
