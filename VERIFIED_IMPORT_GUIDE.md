# Legacy Wall Charts — Verified Data Import Guide

Fix v5 adds the verified-source import framework. It is deliberately designed **not to invent football scores**.

## Trusted source registry installed

- FIFA World Cup 2026 official schedule/results
- FIFA official archive
- UEFA Champions League official history
- UEFA Champions League official finals list
- The FA Cup official results archive
- EFL Carabao Cup official competition page
- UEFA EURO official history
- UEFA EURO official finals list

## How data should be imported

1. Collect fixtures/results from an official or licensed source.
2. Convert each match into rows for `verified_match_imports`.
3. Attach each row to a `verified_import_batches` record.
4. Admin reviews the batch.
5. Run `apply_verified_import_batch(batch_id)`.
6. The app writes into `fixtures` and `official_results` with source, confidence, and verification status.

## Important

The app now has the safe import pipeline, but it still needs complete data feeds/files for each season.
For commercial launch, use official APIs/licensed providers where possible instead of scraping.

Recommended providers:
- football-data.org
- API-Football
- Sportmonks
- official FIFA/UEFA/FA/EFL archives where permitted

## Why this matters

This keeps Legacy Wall Charts honest and protects the product from fake or AI-invented results.
