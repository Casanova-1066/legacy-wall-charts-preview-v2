import { requireAdmin, sendError, sql } from '../_lib/runtime.js';

export default async function handler(req: any, res: any) {
  try {
    const admin = await requireAdmin(req);
    if (req.method === 'GET') {
      const query = String(req.query?.q || '').trim().toLowerCase();
      if (query.length < 2) return res.status(200).json({ users: [] });
      let users: any[] = [];
      try {
        users = await sql`SELECT id, email, name, role
          FROM neon_auth.user
          WHERE lower(email) LIKE ${`%${query}%`}
          ORDER BY email ASC LIMIT 30` as any[];
      } catch {
        users = await sql`SELECT DISTINCT user_id AS id, COALESCE(customer_email, '') AS email, '' AS name, 'user' AS role
          FROM public.commerce_purchases
          WHERE lower(COALESCE(customer_email, '')) LIKE ${`%${query}%`}
          LIMIT 30` as any[];
      }
      const grants = await sql`SELECT user_id, email, plan_key, active, expires_at, note, updated_at
        FROM public.honorary_subscriptions
        WHERE lower(email) LIKE ${`%${query}%`} OR user_id = ANY(${users.map((u:any) => String(u.id))}::text[])` as any[];
      const byId = new Map(grants.map((g:any) => [String(g.user_id), g]));
      return res.status(200).json({ users: users.map((user:any) => ({ ...user, honorary: byId.get(String(user.id)) || null })) });
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const action = String(body.action || 'grant');
      const userId = String(body.userId || '');
      const email = String(body.email || '').trim().toLowerCase();
      if (!userId || !email) return res.status(400).json({ error: 'User and email are required.' });
      if (action === 'revoke') {
        await sql`UPDATE public.honorary_subscriptions SET active = false, updated_at = now(), granted_by = ${admin.id} WHERE user_id = ${userId}`;
      } else {
        const planKey = ['pro-monthly','pro-yearly','lifetime'].includes(String(body.planKey)) ? String(body.planKey) : 'pro-monthly';
        const expiresAt = body.expiresAt ? new Date(String(body.expiresAt)).toISOString() : null;
        await sql`INSERT INTO public.honorary_subscriptions (user_id, email, plan_key, active, expires_at, note, granted_by)
          VALUES (${userId}, ${email}, ${planKey}, true, ${expiresAt}, ${String(body.note || '')}, ${admin.id})
          ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, plan_key = EXCLUDED.plan_key, active = true, expires_at = EXCLUDED.expires_at, note = EXCLUDED.note, granted_by = EXCLUDED.granted_by, updated_at = now()`;
      }
      await sql`INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (${admin.id}, ${action === 'revoke' ? 'honorary_subscription_revoked' : 'honorary_subscription_granted'}, 'honorary_subscription', ${userId}, ${JSON.stringify({ email, planKey: body.planKey || null })}::jsonb)`;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) { sendError(res, error); }
}
