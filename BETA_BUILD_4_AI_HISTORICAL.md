# Beta Build 4 — AI Historical Chart Builder

## Added

- `/historical-builder` subscription-gated workflow.
- `POST /api/ai/historical-fill` server endpoint.
- Pro Monthly, Pro Yearly and Lifetime entitlement checks.
- Verified-data-first editable historical draft generation.
- AI job audit table migration: `0011_ai_historical_builder.sql`.
- Workshop and historical season links to AI Fill.
- AI Historical Fill included in subscription pricing features.

## Important beta behaviour

The builder does not invent official match results. It maps available curated catalogue information into an editable draft and marks the project as requiring verification where full match data is not yet present.

## Before deployment testing

1. Run `neon/migrations/0011_ai_historical_builder.sql` in Neon.
2. Deploy the complete master to Vercel Preview.
3. Sign in with an active Pro Monthly, Pro Yearly or Lifetime account.
4. Open `/historical-builder` and generate a draft.
5. Confirm the draft appears under My Charts and opens in the editor.
