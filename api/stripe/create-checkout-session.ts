import { priceForProduct, requireIdentity, sendError, siteUrl, stripe } from '../_lib/runtime.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const identity = await requireIdentity(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const product = String(body.product || '');
    const resourceId = body.resourceId ? String(body.resourceId) : null;
    const price = priceForProduct(product);
    const origin = siteUrl(req);
    const isSubscription = product === 'pro-monthly' || product === 'pro-yearly';

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelled?product=${encodeURIComponent(product)}`,
      customer_email: identity.email,
      client_reference_id: identity.id,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
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
