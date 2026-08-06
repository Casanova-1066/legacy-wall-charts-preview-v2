-- Historical import staging and verification pipeline.
-- Raw or user-supplied data must pass through these tables before publication.

CREATE TABLE IF NOT EXISTS public.data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text NOT NULL DEFAULT 'website',
  url text,
  publisher text,
  reliability_tier text NOT NULL DEFAULT 'unrated',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.historical_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  sport_slug text,
  competition_slug text,
  submitted_by text,
  source_id uuid REFERENCES public.data_sources(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'staged' CHECK (status IN ('staged','validating','review_required','approved','rejected','published')),
  total_records integer NOT NULL DEFAULT 0,
  accepted_records integer NOT NULL DEFAULT 0,
  rejected_records integer NOT NULL DEFAULT 0,
  warnings integer NOT NULL DEFAULT 0,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.historical_import_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.historical_import_batches(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  external_key text,
  sport_slug text,
  competition_slug text,
  season_slug text,
  raw_record jsonb NOT NULL,
  normalized_record jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','warning','rejected','published')),
  confidence numeric NOT NULL DEFAULT 0,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verification_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.historical_import_batches(id) ON DELETE CASCADE,
  record_id uuid REFERENCES public.historical_import_records(id) ON DELETE CASCADE,
  issue_code text NOT NULL,
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','error','blocker')),
  field_path text,
  message text NOT NULL,
  proposed_value jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  source_id uuid REFERENCES public.data_sources(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(normalized_alias)
);

CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  display_name text NOT NULL,
  country text,
  birth_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.player_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  source_id uuid REFERENCES public.data_sources(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(normalized_alias)
);

CREATE TABLE IF NOT EXISTS public.season_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  competition_slug text NOT NULL,
  season_slug text NOT NULL,
  winner_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  runner_up_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  winner_name_raw text,
  runner_up_name_raw text,
  final_score_text text,
  final_home_score integer,
  final_away_score integer,
  decided_after_extra_time boolean NOT NULL DEFAULT false,
  decided_on_penalties boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'needs-review',
  source_id uuid REFERENCES public.data_sources(id) ON DELETE SET NULL,
  import_record_id uuid REFERENCES public.historical_import_records(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_slug, season_slug)
);

CREATE TABLE IF NOT EXISTS public.season_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  competition_slug text NOT NULL,
  season_slug text NOT NULL,
  award_type text NOT NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  player_name_raw text,
  team_name_raw text,
  numeric_value numeric,
  unit text,
  verification_status text NOT NULL DEFAULT 'needs-review',
  source_id uuid REFERENCES public.data_sources(id) ON DELETE SET NULL,
  import_record_id uuid REFERENCES public.historical_import_records(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_slug, season_slug, award_type)
);

CREATE INDEX IF NOT EXISTS idx_import_batches_status ON public.historical_import_batches(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_records_batch ON public.historical_import_records(batch_id, status);
CREATE INDEX IF NOT EXISTS idx_import_records_competition_season ON public.historical_import_records(competition_slug, season_slug);
CREATE INDEX IF NOT EXISTS idx_verification_issues_open ON public.verification_issues(resolved, severity);
CREATE INDEX IF NOT EXISTS idx_season_outcomes_lookup ON public.season_outcomes(competition_slug, season_slug);
CREATE INDEX IF NOT EXISTS idx_season_awards_lookup ON public.season_awards(competition_slug, season_slug, award_type);

ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_import_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_awards ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.players, public.team_aliases, public.player_aliases, public.season_outcomes, public.season_awards TO anonymous, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_sources, public.historical_import_batches, public.historical_import_records, public.verification_issues, public.team_aliases, public.players, public.player_aliases, public.season_outcomes, public.season_awards TO authenticated;

DROP POLICY IF EXISTS historical_public_players ON public.players;
CREATE POLICY historical_public_players ON public.players FOR SELECT USING (true);
DROP POLICY IF EXISTS historical_public_team_aliases ON public.team_aliases;
CREATE POLICY historical_public_team_aliases ON public.team_aliases FOR SELECT USING (true);
DROP POLICY IF EXISTS historical_public_player_aliases ON public.player_aliases;
CREATE POLICY historical_public_player_aliases ON public.player_aliases FOR SELECT USING (true);
DROP POLICY IF EXISTS historical_public_outcomes ON public.season_outcomes;
CREATE POLICY historical_public_outcomes ON public.season_outcomes FOR SELECT USING (published = true OR public.is_admin());
DROP POLICY IF EXISTS historical_public_awards ON public.season_awards;
CREATE POLICY historical_public_awards ON public.season_awards FOR SELECT USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS historical_admin_sources ON public.data_sources;
CREATE POLICY historical_admin_sources ON public.data_sources FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_batches ON public.historical_import_batches;
CREATE POLICY historical_admin_batches ON public.historical_import_batches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_records ON public.historical_import_records;
CREATE POLICY historical_admin_records ON public.historical_import_records FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_issues ON public.verification_issues;
CREATE POLICY historical_admin_issues ON public.verification_issues FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_team_aliases ON public.team_aliases;
CREATE POLICY historical_admin_team_aliases ON public.team_aliases FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_players ON public.players;
CREATE POLICY historical_admin_players ON public.players FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_player_aliases ON public.player_aliases;
CREATE POLICY historical_admin_player_aliases ON public.player_aliases FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_outcomes ON public.season_outcomes;
CREATE POLICY historical_admin_outcomes ON public.season_outcomes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS historical_admin_awards ON public.season_awards;
CREATE POLICY historical_admin_awards ON public.season_awards FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
