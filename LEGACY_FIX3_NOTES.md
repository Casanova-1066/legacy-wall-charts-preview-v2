# Legacy Wall Charts fix v3

This build extends the tournament database seed so the named competitions open season selectors and render a real wall-chart structure instead of dead/empty pages.

## Added / fixed

- UEFA Champions League seasons 1998/99 through 2025/26.
- FA Cup seasons 2010/11 through 2025/26.
- League Cup / Carabao Cup seasons 2010/11 through 2025/26.
- FIFA World Cup tournaments 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026.
- UEFA European Championship tournaments 2000, 2004, 2008, 2012, 2016, 2020, 2024.
- Each added season has rounds and placeholder fixture slots so the season page and chart canvas render.
- Placeholder scores are marked with `source = data-import-pending` and `verified = false` so they are not treated as official documented results.
- Added idempotent migration: `neon/migrations/0004_seed_core_tournaments.sql`.
- Regenerated `neon/seed.json` with the full tournament shell data.
- TypeScript check passes.
- Production build passes.

## Important

This does not claim to have imported every real historical fixture/result yet. It fixes the app structure so all named tournaments can be browsed and opened. The next step is importing verified official fixtures/results season-by-season.

## Database step

When deploying to a fresh Neon database, apply all migrations including:

- `0001_init.sql`
- `0002_backfill_fks.sql`
- `0003_watermark_entitlements.sql`
- `0004_seed_core_tournaments.sql`

If your current Neon database already exists, run `0004_seed_core_tournaments.sql` against it once. It is idempotent and can be re-run.
