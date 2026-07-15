# AI Historical Chart Builder

## Beta scope

The AI Historical Chart Builder is a subscription feature for active Pro Monthly, Pro Yearly and Lifetime accounts.

It uses a verified-data-first workflow:

1. Select a competition and season.
2. The server verifies the signed-in user's plan.
3. A job is recorded in `ai_historical_jobs`.
4. Legacy maps curated catalogue data into an editable draft.
5. Missing match-by-match data remains clearly marked for human review.

The beta does not invent missing official results. Complete historical products should only be published after an administrator verifies the draft.

## Required migration

Run `neon/migrations/0011_ai_historical_builder.sql` before testing.

## Route

`/historical-builder`

## API

`POST /api/ai/historical-fill`
