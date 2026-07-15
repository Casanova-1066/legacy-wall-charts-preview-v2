import { requireIdentity, sendError, sql } from '../_lib/runtime.js';

const PLAN_ALLOWANCES: Record<string, { pdf: number | null; historical: number | null; label: string }> = {
  'pro-monthly': { pdf: 10, historical: 5, label: 'Pro Monthly' },
  'pro-yearly': { pdf: 10, historical: 5, label: 'Pro Yearly' },
  lifetime: { pdf: null, historical: null, label: 'Lifetime' },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const identity = await requireIdentity(req);
    const [purchases, subscriptions, usage] = await Promise.all([
      sql`SELECT id, product_key, resource_id, status, amount_total, currency, created_at
          FROM public.commerce_purchases
          WHERE user_id = ${identity.id} AND status = 'active'
          ORDER BY created_at DESC`,
      sql`SELECT id, product_key, status, current_period_end, cancel_at_period_end, updated_at
          FROM public.commerce_subscriptions
          WHERE user_id = ${identity.id}
          ORDER BY updated_at DESC`,
      sql`SELECT credit_type, COALESCE(SUM(quantity), 0)::int AS used
          FROM public.commerce_credit_usage
          WHERE user_id = ${identity.id}
            AND usage_month = date_trunc('month', now())::date
          GROUP BY credit_type`,
    ]);

    const activeSubscription = subscriptions.find((sub: any) =>
      ['active', 'trialing'].includes(String(sub.status)) &&
      (!sub.current_period_end || new Date(sub.current_period_end).getTime() > Date.now())
    ) as any | undefined;
    const lifetimePurchase = purchases.find((purchase: any) => purchase.product_key === 'lifetime');
    const effectivePlanKey = lifetimePurchase ? 'lifetime' : activeSubscription?.product_key ?? null;
    const plan = effectivePlanKey ? PLAN_ALLOWANCES[effectivePlanKey] : null;
    const usedByType = Object.fromEntries(usage.map((row: any) => [String(row.credit_type), Number(row.used)]));

    res.status(200).json({
      user: identity,
      plan: effectivePlanKey ? {
        key: effectivePlanKey,
        label: plan?.label ?? effectivePlanKey,
        status: lifetimePurchase ? 'active' : activeSubscription?.status ?? 'inactive',
        currentPeriodEnd: lifetimePurchase ? null : activeSubscription?.current_period_end ?? null,
        cancelAtPeriodEnd: lifetimePurchase ? false : !!activeSubscription?.cancel_at_period_end,
      } : null,
      credits: {
        pdf: { allowance: plan?.pdf ?? 0, used: usedByType.pdf_export ?? 0 },
        historical: { allowance: plan?.historical ?? 0, used: usedByType.historical_download ?? 0 },
      },
      purchases,
      subscriptions,
    });
  } catch (error) {
    sendError(res, error);
  }
}
