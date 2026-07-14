import Stripe from 'stripe';
import { readRawBody, sendError, sql, stripe } from '../_lib/runtime.js';

async function rememberCustomer(userId: string, customerId: string) {
  await sql`INSERT INTO public.commerce_customers (user_id, stripe_customer_id)
    VALUES (${userId}, ${customerId})
    ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id, updated_at = now()`;
}

async function fulfillCheckout(session: Stripe.Checkout.Session) {
  const userId = String(session.metadata?.user_id || session.client_reference_id || '');
  const product = String(session.metadata?.product_key || '');
  const resourceId = session.metadata?.resource_id || null;
  if (!userId || !product) return;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (customerId) await rememberCustomer(userId, customerId);

  await sql`INSERT INTO public.commerce_purchases
    (user_id, product_key, resource_id, stripe_checkout_session_id, stripe_payment_intent_id, amount_total, currency, status)
    VALUES (${userId}, ${product}, ${resourceId}, ${session.id}, ${typeof session.payment_intent === 'string' ? session.payment_intent : null}, ${session.amount_total || 0}, ${session.currency || 'gbp'}, 'active')
    ON CONFLICT (stripe_checkout_session_id) DO UPDATE SET status = 'active', updated_at = now()`;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const periodEnd = Number((subscription as any).current_period_end || (subscription as any).items?.data?.[0]?.current_period_end || 0);
  const userId = String(subscription.metadata?.user_id || '');
  const product = String(subscription.metadata?.product_key || 'subscription');
  if (!userId) return;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  if (customerId) await rememberCustomer(userId, customerId);
  await sql`INSERT INTO public.commerce_subscriptions
    (user_id, product_key, stripe_subscription_id, stripe_customer_id, status, current_period_end, cancel_at_period_end)
    VALUES (${userId}, ${product}, ${subscription.id}, ${customerId}, ${subscription.status}, ${periodEnd ? new Date(periodEnd * 1000).toISOString() : null}, ${subscription.cancel_at_period_end})
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET status = EXCLUDED.status, current_period_end = EXCLUDED.current_period_end, cancel_at_period_end = EXCLUDED.cancel_at_period_end, updated_at = now()`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const raw = await readRawBody(req);
    const signature = String(req.headers['stripe-signature'] || '');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    const event = stripe.webhooks.constructEvent(raw, signature, secret);

    const existing = await sql`SELECT id FROM public.stripe_webhook_events WHERE id = ${event.id} LIMIT 1`;
    if (existing.length) return res.status(200).json({ received: true, duplicate: true });

    if (event.type === 'checkout.session.completed') await fulfillCheckout(event.data.object as Stripe.Checkout.Session);
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      if (paymentIntent) await sql`UPDATE public.commerce_purchases SET status = 'refunded', updated_at = now() WHERE stripe_payment_intent_id = ${paymentIntent}`;
    }

    await sql`INSERT INTO public.stripe_webhook_events (id, event_type) VALUES (${event.id}, ${event.type})`;
    return res.status(200).json({ received: true });
  } catch (error) {
    sendError(res, error);
  }
}
