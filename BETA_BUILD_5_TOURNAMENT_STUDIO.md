# Beta Build 5 — Tournament Studio, themes and honorary access

## Included
- Fresh template workshop for school knockouts, 5-a-side leagues, round-robin leagues and group-to-knockout tournaments.
- Independent `match-card` blocks: move, resize, duplicate and delete each fixture separately.
- Editable teams, scores, round labels, date/venue, extra-time and penalty boxes.
- Tournament-specific template links from the Historical Library.
- Theme Studio always loads built-in Blood Oath Legacy themes, even if the database is unavailable.
- Honorary subscription administration with user email search, plan selection, optional expiry and revoke controls.
- Honorary plans unlock account benefits and AI Historical Fill.

## Database
Run `neon/migrations/0012_honorary_access_and_theme_seed.sql` once.

## Verification
- `npm run typecheck`
- `npm run build`
- `npx tsc -p tsconfig.api.json`
