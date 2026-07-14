import { requireIdentity, sendError, sql, stripe } from '../_lib/runtime.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const identity = await requireIdentity(req);
    const sessionId = String(req.query?.session_id || '');
    if (!sessionId) throw Object.assign(new Error('Missing checkout session.'), { statusCode: 400 });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== identity.id && session.metadata?.user_id !== identity.id) {
      throw Object.assign(new Error('This checkout belongs to another account.'), { statusCode: 403 });
    }
    const purchases = await sql`SELECT product_key, resource_id, status FROM public.commerce_purchases WHERE stripe_checkout_session_id = ${sessionId} LIMIT 1`;
    return res.status(200).json({
      paymentStatus: session.payment_status,
      checkoutStatus: session.status,
      fulfilled: purchases.length > 0 && purchases[0].status === 'active',
      product: session.metadata?.product_key || null,
      resourceId: session.metadata?.resource_id || null,
    });
  } catch (error) {
    sendError(res, error);
  }
}
