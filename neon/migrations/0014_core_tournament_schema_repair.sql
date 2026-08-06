-- v0.8.2 repair: create the core tournament tables that 0001 assumed already existed.
-- Idempotent and safe for both fresh and partially migrated Neon projects.

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  code text,
  country text,
  logo_url text,
  primary_color text,
  secondary_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wall_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL DEFAULT auth.user_id(),
  competition_slug text,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL,
  season_slug text,
  chart_type text NOT NULL DEFAULT 'bracket',
  title text,
  layout_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_config jsonb,
  is_published boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  share_slug text,
  auto_fill_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  season_slug text,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  competition_slug text,
  name text NOT NULL,
  slug text NOT NULL,
  round_type text NOT NULL DEFAULT 'knockout',
  sort_order integer NOT NULL DEFAULT 0,
  num_teams integer,
  round_config jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE,
  round_id uuid REFERENCES public.rounds(id) ON DELETE CASCADE,
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  season_slug text,
  round_slug text,
  competition_slug text,
  home_team_id uuid REFERENCES public.teams(id),
  away_team_id uuid REFERENCES public.teams(id),
  home_team_code text,
  away_team_code text,
  bracket_position integer,
  group_name text,
  matchday integer,
  leg integer NOT NULL DEFAULT 1,
  scheduled_date date,
  kickoff_time text,
  venue text,
  source_url text,
  source_name text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.official_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id uuid REFERENCES public.fixtures(id) ON DELETE CASCADE,
  fixture_key text,
  home_score integer,
  away_score integer,
  status text NOT NULL DEFAULT 'scheduled',
  winner_team_id uuid REFERENCES public.teams(id),
  winner_team_code text,
  is_extra_time boolean NOT NULL DEFAULT false,
  is_penalties boolean NOT NULL DEFAULT false,
  penalties_home integer,
  penalties_away integer,
  agg_home_score integer,
  agg_away_score integer,
  notes text,
  source text,
  source_url text,
  source_name text,
  confidence numeric DEFAULT 0,
  verification_status text DEFAULT 'needs-import',
  verified boolean NOT NULL DEFAULT true,
  imported_batch_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id uuid REFERENCES public.fixtures(id) ON DELETE CASCADE,
  fixture_key text,
  user_id text NOT NULL DEFAULT auth.user_id(),
  chart_id uuid REFERENCES public.wall_charts(id) ON DELETE CASCADE,
  home_score integer,
  away_score integer,
  winner_team_id uuid REFERENCES public.teams(id),
  winner_team_code text,
  notes text,
  group_override jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wall_charts_share ON public.wall_charts(share_slug) WHERE share_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wall_charts_owner ON public.wall_charts(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_rounds_season_slug ON public.rounds(season_slug);
CREATE INDEX IF NOT EXISTS idx_fixtures_season_slug ON public.fixtures(season_slug);
CREATE INDEX IF NOT EXISTS idx_fixtures_round_slug ON public.fixtures(round_slug);
CREATE INDEX IF NOT EXISTS idx_official_fixture_key ON public.official_results(fixture_key);
CREATE INDEX IF NOT EXISTS idx_overrides_user ON public.user_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_overrides_fixture_key ON public.user_overrides(fixture_key);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_overrides ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.teams, public.rounds, public.fixtures, public.official_results TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.teams, public.rounds, public.fixtures, public.official_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wall_charts, public.user_overrides TO authenticated;

DROP POLICY IF EXISTS teams_read ON public.teams;
CREATE POLICY teams_read ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS teams_admin_write ON public.teams;
CREATE POLICY teams_admin_write ON public.teams FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS wall_charts_owner ON public.wall_charts;
CREATE POLICY wall_charts_owner ON public.wall_charts FOR SELECT TO authenticated USING (auth.user_id() = owner_id OR is_public = true);
DROP POLICY IF EXISTS wall_charts_owner_write ON public.wall_charts;
CREATE POLICY wall_charts_owner_write ON public.wall_charts FOR INSERT TO authenticated WITH CHECK (auth.user_id() = owner_id);
DROP POLICY IF EXISTS wall_charts_owner_upd ON public.wall_charts;
CREATE POLICY wall_charts_owner_upd ON public.wall_charts FOR UPDATE TO authenticated USING (auth.user_id() = owner_id) WITH CHECK (auth.user_id() = owner_id);
DROP POLICY IF EXISTS wall_charts_owner_del ON public.wall_charts;
CREATE POLICY wall_charts_owner_del ON public.wall_charts FOR DELETE TO authenticated USING (auth.user_id() = owner_id);

DROP POLICY IF EXISTS rounds_read ON public.rounds;
CREATE POLICY rounds_read ON public.rounds FOR SELECT USING (true);
DROP POLICY IF EXISTS rounds_admin_write ON public.rounds;
CREATE POLICY rounds_admin_write ON public.rounds FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS fixtures_read ON public.fixtures;
CREATE POLICY fixtures_read ON public.fixtures FOR SELECT USING (true);
DROP POLICY IF EXISTS fixtures_admin_write ON public.fixtures;
CREATE POLICY fixtures_admin_write ON public.fixtures FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS official_results_read ON public.official_results;
CREATE POLICY official_results_read ON public.official_results FOR SELECT USING (true);
DROP POLICY IF EXISTS official_results_admin_write ON public.official_results;
CREATE POLICY official_results_admin_write ON public.official_results FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS user_overrides_owner ON public.user_overrides;
CREATE POLICY user_overrides_owner ON public.user_overrides FOR ALL TO authenticated USING (auth.user_id() = user_id) WITH CHECK (auth.user_id() = user_id);
