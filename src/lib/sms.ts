import { prisma } from '@/lib/prisma';

interface SMSPayload {
  to: string;
  body: string;
  patientId: string;
  type: 'DOSE' | 'REFILL' | 'LAB' | 'BILLING';
}

export async function sendSMS({ to, body, patientId, type }: SMSPayload) {
  const isMock =
    process.env.TWILIO_MOCK === 'true' || process.env.NODE_ENV !== 'production';

  if (isMock) {
    // Dev mode: log to console instead of sending
    console.log('\n📱 [TWILIO MOCK SMS]');
    console.log(`  To:      ${to}`);
    console.log(`  Message: ${body}`);
    console.log(`  Type:    ${type}`);
    console.log(`  Patient: ${patientId}\n`);

    await prisma.reminderLog.create({
      data: { patientId, type, channel: 'sms', message: body, status: 'mocked' },
    });
    return { success: true, mocked: true };
  }

  // Production: real Twilio call
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });

    await prisma.reminderLog.create({
      data: { patientId, type, channel: 'sms', message: body, status: 'sent' },
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Twilio Error]', errMsg);

    await prisma.reminderLog.create({
      data: { patientId, type, channel: 'sms', message: body, status: 'failed', error: errMsg },
    });

    return { success: false, error: errMsg };
  }
}
