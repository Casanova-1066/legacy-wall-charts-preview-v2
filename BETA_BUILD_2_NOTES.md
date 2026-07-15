# Cumulative Beta Build 2

This complete master continues from the previous cumulative beta build.

## Added

- Server-side `/api/health` readiness check for Neon, Stripe, database and webhook configuration.
- Account diagnostics now show each backend readiness item separately.
- Terms of Use and Privacy Policy pages.
- Registration terms checkbox now links to the correct legal pages.
- Verified recent-season summaries in the Historical Library for:
  - Premier League
  - FA Cup
  - League Cup / Carabao Cup
  - UEFA Champions League
  - FIFA World Cup
  - UEFA European Championship
- Season cards display winner, runner-up, final score and verification source where available.
- Season detail pages display the same historical summary above the chart preview.

## Deployment checks

1. Upload the complete contents of `Dev2 Master` to the preview repository.
2. Keep Vercel install command on the public npm registry.
3. Add the exact Vercel preview domain to Neon Auth trusted domains.
4. Add `STRIPE_WEBHOOK_SECRET` after creating the Stripe event destination.
5. Open Account > Auth Diagnostics and run the combined readiness check.
