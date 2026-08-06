# Changelog

## v0.8.1 — Infrastructure recovery

- Adopted Cumulative Beta Build 5 Tournament Studio as the only master source.
- Connected and audited GitHub, Vercel, Neon and Stripe.
- Restored the built-in theme catalogue in production Neon.
- Restored AI historical job tracking in production Neon.
- Restored honorary subscription support in production Neon.
- Added migration `0013_schema_repair_checkpoint.sql` so repaired schema items are reproducible.

### Known work in progress

- Complete the missing core tournament schema audit (`teams`, `rounds`, `fixtures`, `official_results`, `wall_charts` and supporting tables).
- Reconcile Build 5 against the GitHub audit branch.
- Validate a clean Vercel preview deployment.
- Complete Tournament Studio interaction and template testing.
