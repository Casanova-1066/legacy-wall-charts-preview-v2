import { requireIdentity, sendError, siteUrl, sql, stripe } from '../_lib/runtime.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const identity = await requireIdentity(req);
    const rows = await sql`SELECT stripe_customer_id FROM public.commerce_customers WHERE user_id = ${identity.id} LIMIT 1`;
    const customerId = rows[0]?.stripe_customer_id as string | undefined;
    if (!customerId) throw Object.assign(new Error('No Stripe billing account was found.'), { statusCode: 404 });
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${siteUrl(req)}/account` });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    sendError(res, error);
  }
}
