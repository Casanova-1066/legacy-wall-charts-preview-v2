# Legacy Wall Charts Fix v5

## Built
- Added verified source registry migration.
- Added verified import batch/staging tables.
- Added admin-only `apply_verified_import_batch(batch_id)` database function.
- Added source metadata fields to fixtures/results.
- Added `verified_import_status` view.
- Added verified source cards to the Admin AI Logs page.
- Added import guide.

## What this does
This gives the app a safe, auditable way to import real documented results without letting AI invent scores.

## What it does not do yet
It does not magically scrape every historical match. Full season imports still need official/licensed data files or API keys.
