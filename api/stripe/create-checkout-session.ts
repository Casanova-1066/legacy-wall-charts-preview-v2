import { priceForProduct, requireIdentity, sendError, siteUrl, sql, stripe } from '../_lib/runtime.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const identity = await requireIdentity(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const product = String(body.product || '');
    const resourceId = body.resourceId ? String(body.resourceId) : null;
    if (resourceId && (resourceId.length > 200 || !/^[a-zA-Z0-9._:/-]+$/.test(resourceId))) {
      throw Object.assign(new Error('Invalid chart reference.'), { statusCode: 400 });
    }
    const price = priceForProduct(product);
    const origin = siteUrl(req);
    const isSubscription = product === 'pro-monthly' || product === 'pro-yearly';

    if (isSubscription) {
      const active = await sql`SELECT product_key FROM public.commerce_subscriptions
        WHERE user_id = ${identity.id} AND status IN ('active', 'trialing', 'past_due')
        LIMIT 1`;
      if (active.length) {
        throw Object.assign(new Error('You already have a subscription. Use Manage billing to change or cancel it.'), { statusCode: 409 });
      }
    }

    const customers = await sql`SELECT stripe_customer_id FROM public.commerce_customers
      WHERE user_id = ${identity.id} LIMIT 1`;
    const customerId = customers[0]?.stripe_customer_id as string | undefined;

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelled?product=${encodeURIComponent(product)}`,
      customer: customerId,
      customer_email: customerId ? undefined : identity.email,
      client_reference_id: identity.id,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: customerId ? { address: 'auto', name: 'auto' } : undefined,
      metadata: {
        user_id: identity.id,
        product_key: product,
        resource_id: resourceId || '',
      },
      subscription_data: isSubscription ? {
        metadata: { user_id: identity.id, product_key: product },
      } : undefined,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    sendError(res, error);
  }
}
