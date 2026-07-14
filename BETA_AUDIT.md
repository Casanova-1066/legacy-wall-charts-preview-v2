# Legacy Wall Charts Platform v2 — Beta Audit

This build was audited as a single cumulative project.

## Integrated in this audited master
- World Cup 2026 builder and front/back layout workflow
- Local drafts and signed-in cloud project storage
- Autosave and local fallback when cloud save fails
- Forgot-password and reset-password routes
- Print preview route for real project content
- Stripe Checkout, webhook verification, Customer Portal, and session-status API routes
- Permanent purchase and subscription records in Neon
- My Library and checkout success/cancelled routes
- Vercel SPA rewrite

## Database migrations required
Run migrations in numeric order. For an existing database that already has 0001–0006 and 0008 applied, run only 0009.

- `0001_init.sql`
- `0002_backfill_fks.sql`
- `0003_watermark_entitlements.sql`
- `0004_seed_core_tournaments.sql`
- `0005_autofill_controls_worldcup_2026.sql`
- `0006_verified_sources_import_framework.sql`
- `0008_builder_projects.sql`
- `0009_rc1_commerce.sql`

Migration 0007 is intentionally absent because its commerce tables are superseded by 0009.

## Vercel environment variables
- `VITE_NEON_DATA_API_URL`
- `VITE_NEON_AUTH_URL`
- `NEON_AUTH_URL`
- `DATABASE_URL`
- `PUBLIC_SITE_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BLANK_TEMPLATE`
- `STRIPE_PRICE_HISTORICAL_CHART`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_LIFETIME`

## Beta test order
1. Deploy to Vercel Preview using Stripe test keys.
2. Add the Preview webhook destination `/api/stripe/webhook` in Stripe.
3. Add `STRIPE_WEBHOOK_SECRET` and redeploy.
4. Test sign-up, sign-in, password reset, cloud save, checkout, My Library, Customer Portal, and print preview.
5. Promote to production only after the complete checklist passes.
