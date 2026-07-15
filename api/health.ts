import { neon } from '@neondatabase/serverless';

function present(name: string) {
  return Boolean(process.env[name]);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const checks: Record<string, { ok: boolean; detail?: string }> = {
    database: { ok: present('DATABASE_URL') },
    neonAuth: { ok: present('NEON_AUTH_URL') },
    publicSiteUrl: { ok: present('PUBLIC_SITE_URL') },
    stripeSecret: { ok: present('STRIPE_SECRET_KEY') },
    stripeWebhook: { ok: present('STRIPE_WEBHOOK_SECRET') },
    stripePrices: {
      ok: [
        'STRIPE_PRICE_BLANK_TEMPLATE',
        'STRIPE_PRICE_HISTORICAL_CHART',
        'STRIPE_PRICE_PRO_MONTHLY',
        'STRIPE_PRICE_PRO_YEARLY',
        'STRIPE_PRICE_LIFETIME',
      ].every(present),
    },
  };

  if (checks.database.ok) {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`SELECT 1 AS ok`;
      checks.database.detail = 'Connection succeeded';
    } catch (error: any) {
      checks.database.ok = false;
      checks.database.detail = error?.message || 'Connection failed';
    }
  }

  const ready = Object.values(checks).every((check) => check.ok);
  return res.status(ready ? 200 : 503).json({
    ready,
    checkedAt: new Date().toISOString(),
    checks,
  });
}
