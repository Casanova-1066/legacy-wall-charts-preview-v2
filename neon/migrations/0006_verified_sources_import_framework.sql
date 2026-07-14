-- Legacy Wall Charts fix v5 — verified source import framework.
-- This migration does NOT scrape or invent scores. It creates an auditable source
-- registry and import staging layer so official/verified data can be imported safely.

CREATE TABLE IF NOT EXISTS public.verified_data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text UNIQUE NOT NULL,
  competition_slug text NOT NULL,
  name text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL DEFAULT 'official', -- official, licensed-api, reputable-secondary
  trust_level integer NOT NULL DEFAULT 100,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verified_data_sources ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.verified_data_sources TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.verified_data_sources TO authenticated;
DROP POLICY IF EXISTS verified_sources_read ON public.verified_data_sources;
CREATE POLICY verified_sources_read ON public.verified_data_sources FOR SELECT USING (true);
DROP POLICY IF EXISTS verified_sources_admin_write ON public.verified_data_sources;
CREATE POLICY verified_sources_admin_write ON public.verified_data_sources FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.verified_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.verified_data_sources(id) ON DELETE SET NULL,
  competition_slug text NOT NULL,
  season_slug text,
  import_type text NOT NULL DEFAULT 'fixtures-results',
  status text NOT NULL DEFAULT 'pending', -- pending, imported, partial, failed, needs-review
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  imported_by text DEFAULT auth.user_id(),
  rows_seen integer NOT NULL DEFAULT 0,
  rows_imported integer NOT NULL DEFAULT 0,
  rows_failed integer NOT NULL DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.verified_import_batches ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.verified_import_batches TO authenticated;
DROP POLICY IF EXISTS verified_batches_admin ON public.verified_import_batches;
CREATE POLICY verified_batches_admin ON public.verified_import_batches FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.verified_match_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.verified_import_batches(id) ON DELETE CASCADE,
  competition_slug text NOT NULL,
  season_slug text NOT NULL,
  round_slug text NOT NULL,
  fixture_key text NOT NULL,
  home_team_code text,
  away_team_code text,
  home_team_name text,
  away_team_name text,
  scheduled_date date,
  kickoff_time text,
  venue text,
  home_score integer,
  away_score integer,
  status text NOT NULL DEFAULT 'scheduled',
  winner_team_code text,
  penalties_home integer,
  penalties_away integer,
  source_url text NOT NULL,
  source_name text NOT NULL,
  source_payload jsonb DEFAULT '{}'::jsonb,
  verification_status text NOT NULL DEFAULT 'needs-review',
  confidence numeric NOT NULL DEFAULT 0.9,
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(fixture_key)
);
ALTER TABLE public.verified_match_imports ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verified_match_imports TO authenticated;
DROP POLICY IF EXISTS verified_match_imports_admin ON public.verified_match_imports;
CREATE POLICY verified_match_imports_admin ON public.verified_match_imports FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS imported_batch_id uuid REFERENCES public.verified_import_batches(id) ON DELETE SET NULL;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS kickoff_time text;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS source_name text;

INSERT INTO public.verified_data_sources (source_key, competition_slug, name, source_url, source_type, trust_level, notes)
VALUES
  ('fifa-worldcup-2026', 'worldcup', 'FIFA World Cup 2026 official schedule, fixtures and results', 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums', 'official', 100, 'Primary source for World Cup 2026 fixtures, dates, venues and final results.'),
  ('fifa-worldcup-archive', 'worldcup', 'FIFA World Cup official archive', 'https://www.fifa.com/en/archive', 'official', 100, 'Primary FIFA archive for historical World Cup records.'),
  ('uefa-ucl-history', 'ucl', 'UEFA Champions League official history', 'https://www.uefa.com/uefachampionsleague/history/', 'official', 100, 'Primary UEFA source for Champions League season history and statistics.'),
  ('uefa-ucl-finals', 'ucl', 'UEFA Champions League official finals list', 'https://www.uefa.com/uefachampionsleague/history/winners/finals/', 'official', 100, 'Primary UEFA source for Champions League final winners and finalists.'),
  ('thefa-facup-results-archive', 'facup', 'The FA Cup official results archive', 'https://www.thefa.com/competitions/thefacup/results-archive', 'official', 100, 'Primary FA source for FA Cup results archive.'),
  ('efl-carabao-cup', 'carabao', 'EFL Carabao Cup official competition page', 'https://efl.com/competitions/carabao-cup', 'official', 95, 'Primary EFL source for Carabao Cup fixtures/results when available.'),
  ('uefa-euro-history', 'euros', 'UEFA EURO official history', 'https://www.uefa.com/uefaeuro/history/', 'official', 100, 'Primary UEFA source for European Championship history.'),
  ('uefa-euro-finals', 'euros', 'UEFA EURO official finals list', 'https://www.uefa.com/uefaeuro/history/winners/finals/', 'official', 100, 'Primary UEFA source for EURO final winners and finalists.')
ON CONFLICT (source_key) DO UPDATE SET
  name = EXCLUDED.name,
  source_url = EXCLUDED.source_url,
  source_type = EXCLUDED.source_type,
  trust_level = EXCLUDED.trust_level,
  notes = EXCLUDED.notes,
  is_active = true,
  updated_at = now();

-- Admin-only function: apply verified staged imports into fixtures + official_results.
-- This is used after data has been collected from licensed/official sources and reviewed.
CREATE OR REPLACE FUNCTION public.apply_verified_import_batch(p_batch_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  r record;
  v_fixture_id uuid;
  v_rows_seen integer := 0;
  v_rows_imported integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  UPDATE public.verified_import_batches
  SET status = 'importing', started_at = now()
  WHERE id = p_batch_id;

  FOR r IN SELECT * FROM public.verified_match_imports WHERE batch_id = p_batch_id ORDER BY scheduled_date NULLS LAST, fixture_key LOOP
    v_rows_seen := v_rows_seen + 1;

    INSERT INTO public.fixtures (
      key, season_slug, round_slug, competition_slug, home_team_code, away_team_code,
      scheduled_date, kickoff_time, venue, source_url, source_name, updated_at
    ) VALUES (
      r.fixture_key, r.season_slug, r.round_slug, r.competition_slug, r.home_team_code, r.away_team_code,
      r.scheduled_date, r.kickoff_time, r.venue, r.source_url, r.source_name, now()
    )
    ON CONFLICT (key) DO UPDATE SET
      season_slug = EXCLUDED.season_slug,
      round_slug = EXCLUDED.round_slug,
      competition_slug = EXCLUDED.competition_slug,
      home_team_code = EXCLUDED.home_team_code,
      away_team_code = EXCLUDED.away_team_code,
      scheduled_date = EXCLUDED.scheduled_date,
      kickoff_time = EXCLUDED.kickoff_time,
      venue = EXCLUDED.venue,
      source_url = EXCLUDED.source_url,
      source_name = EXCLUDED.source_name,
      updated_at = now()
    RETURNING id INTO v_fixture_id;

    INSERT INTO public.official_results (
      fixture_id, fixture_key, home_score, away_score, status, winner_team_code,
      penalties_home, penalties_away, source, source_name, source_url, verified,
      confidence, verification_status, imported_batch_id, updated_at
    ) VALUES (
      v_fixture_id, r.fixture_key, r.home_score, r.away_score, r.status, r.winner_team_code,
      r.penalties_home, r.penalties_away, 'verified-import', r.source_name, r.source_url,
      r.verification_status IN ('verified','official-confirmed'), r.confidence,
      r.verification_status, p_batch_id, now()
    )
    ON CONFLICT (fixture_key) DO UPDATE SET
      fixture_id = EXCLUDED.fixture_id,
      home_score = EXCLUDED.home_score,
      away_score = EXCLUDED.away_score,
      status = EXCLUDED.status,
      winner_team_code = EXCLUDED.winner_team_code,
      penalties_home = EXCLUDED.penalties_home,
      penalties_away = EXCLUDED.penalties_away,
      source = EXCLUDED.source,
      source_name = EXCLUDED.source_name,
      source_url = EXCLUDED.source_url,
      verified = EXCLUDED.verified,
      confidence = EXCLUDED.confidence,
      verification_status = EXCLUDED.verification_status,
      imported_batch_id = EXCLUDED.imported_batch_id,
      updated_at = now();

    v_rows_imported := v_rows_imported + 1;
  END LOOP;

  UPDATE public.verified_import_batches
  SET status = 'imported', completed_at = now(), rows_seen = v_rows_seen, rows_imported = v_rows_imported, rows_failed = 0,
      details = jsonb_build_object('message', 'Verified staged rows applied to fixtures and official_results')
  WHERE id = p_batch_id;

  INSERT INTO public.ai_update_logs (action, source_url, status, details)
  VALUES ('verified-import-applied', null, 'imported', jsonb_build_object('batch_id', p_batch_id, 'rows_imported', v_rows_imported));

  RETURN jsonb_build_object('rows_seen', v_rows_seen, 'rows_imported', v_rows_imported);
END
$fn$;

CREATE OR REPLACE VIEW public.verified_import_status AS
SELECT
  c.slug AS competition_slug,
  c.name AS competition_name,
  s.slug AS season_slug,
  s.name AS season_name,
  COUNT(f.id) AS fixture_count,
  COUNT(o.id) FILTER (WHERE o.verified = true) AS verified_result_count,
  COUNT(o.id) FILTER (WHERE COALESCE(o.verification_status,'') IN ('needs-import','fixture-shell-only','needs-review')) AS needs_import_count,
  MAX(o.updated_at) AS last_result_update
FROM public.competitions c
LEFT JOIN public.seasons s ON s.competition_slug = c.slug
LEFT JOIN public.fixtures f ON f.season_slug = s.slug
LEFT JOIN public.official_results o ON o.fixture_key = f.key
GROUP BY c.slug, c.name, s.slug, s.name;
GRANT SELECT ON public.verified_import_status TO anonymous, authenticated;

INSERT INTO public.ai_update_logs (action, source_url, status, details)
VALUES ('verified-source-registry-created', null, 'ready', jsonb_build_object('message', 'Verified official source registry and staged import framework installed. Full data imports require licensed/API or manually reviewed source files.'));
