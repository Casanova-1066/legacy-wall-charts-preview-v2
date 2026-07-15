# Cumulative Beta Build 3

This build removes browser-only demo credit displays from Account and replaces them with a secure, signed-in account summary endpoint.

## Added

- `api/account/summary.ts` — verifies the Neon JWT server-side and returns the user's verified Stripe purchases, subscriptions, plan and monthly credit usage.
- `src/lib/account-summary.ts` — authenticated frontend client and credit formatting.
- `neon/migrations/0010_beta_account_credits.sql` — server-owned monthly credit usage ledger.
- Account → Billing now shows verified Neon/Stripe state instead of localStorage demo unlocks.

## Database step

Run `neon/migrations/0010_beta_account_credits.sql` after `0009_rc1_commerce.sql`.

## Beta test

1. Sign in.
2. Open Account → Billing & Credits.
3. Confirm Free is shown before purchase.
4. Complete a Stripe test purchase/subscription.
5. Confirm the product appears in Account and My Library after the webhook succeeds.
6. Confirm no `demo credits` wording remains on the Account page.

## Next build priorities

- Consume PDF/historical credits on server-side export/download endpoints.
- Complete end-to-end Neon sign-up and password-reset tests on the Vercel preview origin.
- Add an admin publishing workflow for historical products.
