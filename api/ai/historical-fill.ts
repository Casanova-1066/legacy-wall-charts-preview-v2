import { requireIdentity, sendError, sql } from '../_lib/runtime.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const identity = await requireIdentity(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const competition = String(body.competition || '');
    const season = String(body.season || '');
    if (!competition || !season) return res.status(400).json({ error: 'Competition and season are required.' });

    const [subscriptions, lifetime] = await Promise.all([
      sql`SELECT product_key, status, current_period_end
          FROM public.commerce_subscriptions
          WHERE user_id = ${identity.id}
            AND status IN ('active', 'trialing')
          ORDER BY updated_at DESC`,
      sql`SELECT id FROM public.commerce_purchases
          WHERE user_id = ${identity.id}
            AND product_key = 'lifetime'
            AND status = 'active'
          LIMIT 1`,
    ]);

    const activePlan = subscriptions.find((row: any) =>
      ['pro-monthly', 'pro-yearly'].includes(String(row.product_key)) &&
      (!row.current_period_end || new Date(row.current_period_end).getTime() > Date.now())
    );
    if (!activePlan && lifetime.length === 0) {
      return res.status(403).json({
        error: 'AI Historical Fill is included with Pro Monthly, Pro Yearly and Lifetime.',
        upgradeRequired: true,
      });
    }

    const rows = await sql`INSERT INTO public.ai_historical_jobs
      (user_id, competition_slug, season_slug, status, requested_at)
      VALUES (${identity.id}, ${competition}, ${season}, 'prepared', now())
      RETURNING id, status, requested_at`;

    return res.status(200).json({
      authorized: true,
      job: rows[0],
      mode: 'verified-data-assisted',
      message: 'AI Historical Fill is ready to map verified catalogue data into an editable draft.',
    });
  } catch (error) {
    sendError(res, error);
  }
}
