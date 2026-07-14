-- Backfill nullable uuid FKs from slug columns (idempotent — safe on every publish).
-- The live DB populates only the text slug columns; these UPDATEs derive the
-- uuid FKs from them so UUID-based Data API queries return rows.

UPDATE seasons s
   SET competition_id = c.id,
       tournament_id  = c.id
  FROM competitions c
 WHERE s.competition_slug = c.slug
   AND s.competition_id IS NULL;

UPDATE rounds r
   SET competition_id = c.id,
       season_id      = s.id
  FROM competitions c, seasons s
 WHERE r.competition_slug = c.slug
   AND r.season_slug = s.slug
   AND r.competition_id IS NULL;

UPDATE fixtures f
   SET season_id      = s.id,
       competition_id = c.id
  FROM seasons s, competitions c
 WHERE f.season_slug = s.slug
   AND f.competition_slug = c.slug
   AND f.season_id IS NULL;

UPDATE fixtures f
   SET round_id = r.id
  FROM rounds r
 WHERE f.round_slug = r.slug
   AND f.season_slug = r.season_slug
   AND f.round_id IS NULL;

UPDATE fixtures f
   SET home_team_id = t.id
  FROM teams t
 WHERE f.home_team_code = t.code
   AND f.home_team_id IS NULL;

UPDATE fixtures f
   SET away_team_id = t.id
  FROM teams t
 WHERE f.away_team_code = t.code
   AND f.away_team_id IS NULL;

UPDATE official_results res
   SET fixture_id = f.id
  FROM fixtures f
 WHERE res.fixture_key = f.key
   AND res.fixture_id IS NULL;

UPDATE official_results res
   SET winner_team_id = t.id
  FROM teams t
 WHERE res.winner_team_code = t.code
   AND res.winner_team_id IS NULL;