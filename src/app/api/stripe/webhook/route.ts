export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    trialing: 'TRIALING',
    unpaid: 'UNPAID',
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const patientId = session.metadata?.patientId;
      if (patientId && session.subscription) {
        await prisma.patient.update({
          where: { id: patientId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: 'ACTIVE',
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const patient = await prisma.patient.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (patient) {
        const newStatus = statusMap[sub.status] ?? 'NONE';
        await prisma.patient.update({
          where: { id: patient.id },
          data: {
            subscriptionStatus: newStatus as any,
            nextBillingDate: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
