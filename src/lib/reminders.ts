import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';
import { addDays } from 'date-fns';

const WINDOW_DAYS = 3;

export async function runReminders() {
  const now = new Date();
  const windowEnd = addDays(now, WINDOW_DAYS);
  const results = { doseReminders: 0, refillReminders: 0, skipped: 0, errors: 0 };

  // ── 1. Dose reminders ─────────────────────────────────────────────────────
  const dueDoseProtocols = await prisma.protocol.findMany({
    where: {
      status: 'ACTIVE',
      nextDoseDate: { lte: windowEnd },
    },
    include: {
      patient: {
        include: {
          reminderLogs: {
            where: {
              type: 'DOSE',
              sentAt: { gte: addDays(now, -1) }, // no repeat within 24h
            },
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  for (const protocol of dueDoseProtocols) {
    const { patient } = protocol;
    if (patient.reminderLogs.length > 0) {
      results.skipped++;
      continue;
    }

    const daysUntilDose = protocol.nextDoseDate
      ? Math.ceil((protocol.nextDoseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const urgency = daysUntilDose < 0
      ? `(OVERDUE by ${Math.abs(daysUntilDose)} day${Math.abs(daysUntilDose) !== 1 ? 's' : ''})`
      : daysUntilDose === 0
      ? '(due TODAY)'
      : `(due in ${daysUntilDose} day${daysUntilDose !== 1 ? 's' : ''})`;

    const message =
      `Hi ${patient.name.split(' ')[0]}, this is your TRT Clinic reminder: ` +
      `your ${protocol.compoundLabel} dose is ${urgency}. ` +
      `Questions? Call us at 1-800-TRT-CARE. Reply STOP to unsubscribe.`;

    try {
      await sendSMS({ to: patient.phone, body: message, patientId: patient.id, type: 'DOSE' });
      results.doseReminders++;
    } catch (err) {
      console.error(`[Reminders] Failed dose reminder for ${patient.name}:`, err);
      results.errors++;
    }
  }

  // ── 2. Refill reminders ───────────────────────────────────────────────────
  const dueRenewals = await prisma.rxRenewal.findMany({
    where: {
      status: 'PENDING',
      renewalDueDate: { lte: windowEnd },
    },
    include: {
      patient: {
        include: {
          reminderLogs: {
            where: {
              type: 'REFILL',
              sentAt: { gte: addDays(now, -1) },
            },
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  for (const renewal of dueRenewals) {
    const { patient } = renewal;
    if (patient.reminderLogs.length > 0) {
      results.skipped++;
      continue;
    }

    const daysUntilRenewal = Math.ceil(
      (renewal.renewalDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const urgency = daysUntilRenewal < 0
      ? `OVERDUE by ${Math.abs(daysUntilRenewal)} day${Math.abs(daysUntilRenewal) !== 1 ? 's' : ''}`
      : daysUntilRenewal === 0
      ? 'due TODAY'
      : `due in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}`;

    const message =
      `Hi ${patient.name.split(' ')[0]}, your ${renewal.compoundLabel} prescription renewal is ${urgency}. ` +
      `Please contact your prescriber, ${renewal.prescriber}, to process your refill. ` +
      `Reply STOP to unsubscribe.`;

    try {
      await sendSMS({ to: patient.phone, body: message, patientId: patient.id, type: 'REFILL' });
      results.refillReminders++;
    } catch (err) {
      console.error(`[Reminders] Failed refill reminder for ${patient.name}:`, err);
      results.errors++;
    }
  }

  console.log('[Reminders] Run complete:', results);
  return results;
}
