-- Legacy Wall Charts — Rebuilt normalized football database
-- is_admin() MUST be first — policies below reference it.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $fn$
DECLARE ok boolean;
BEGIN
  EXECUTE 'SELECT EXISTS (SELECT 1 FROM neon_auth."user" u
    WHERE u.id::text = auth.user_id() AND u.role = ''admin''
    AND coalesce(u.banned, false) = false)' INTO ok;
  RETURN COALESCE(ok, false);
EXCEPTION WHEN undefined_table OR undefined_function THEN
  RETURN false;
END $fn$;

-- Drop old empty tables (0 rows) to rebuild cleanly. user_overrides first (FK to matches).
DROP TABLE IF EXISTS public.user_overrides CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;

-- ─── competitions (replaces tournaments) ───
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'cup',
  region text,
  logo_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  featured_order integer DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.competitions TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.competitions TO authenticated;
DROP POLICY IF EXISTS competitions_read ON public.competitions;
CREATE POLICY competitions_read ON public.competitions FOR SELECT USING (true);
DROP POLICY IF EXISTS competitions_admin_ins ON public.competitions;
CREATE POLICY competitions_admin_ins ON public.competitions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS competitions_admin_upd ON public.competitions;
CREATE POLICY competitions_admin_upd ON public.competitions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS competitions_admin_del ON public.competitions;
CREATE POLICY competitions_admin_del ON public.competitions FOR DELETE TO authenticated USING (public.is_admin());

-- ─── seasons ───
CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  competition_slug text,
  name text NOT NULL,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  is_complete boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS competition_slug text;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS is_complete boolean NOT NULL DEFAULT false;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seasons ALTER COLUMN tournament_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seasons_comp_slug ON public.seasons(competition_slug);
GRANT SELECT ON public.seasons TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seasons TO authenticated;
DROP POLICY IF EXISTS seasons_read ON public.seasons;
CREATE POLICY seasons_read ON public.seasons FOR SELECT USING (true);
DROP POLICY IF EXISTS seasons_admin_ins ON public.seasons;
CREATE POLICY seasons_admin_ins ON public.seasons FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS seasons_admin_upd ON public.seasons;
CREATE POLICY seasons_admin_upd ON public.seasons FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS seasons_admin_del ON public.seasons;
CREATE POLICY seasons_admin_del ON public.seasons FOR DELETE TO authenticated USING (public.is_admin());

-- ─── rounds ───
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
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS season_slug text;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS competition_slug text;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS num_teams integer;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS round_config jsonb;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.rounds ALTER COLUMN season_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rounds_season_slug ON public.rounds(season_slug);
GRANT SELECT ON public.rounds TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rounds TO authenticated;
DROP POLICY IF EXISTS rounds_read ON public.rounds;
CREATE POLICY rounds_read ON public.rounds FOR SELECT USING (true);
DROP POLICY IF EXISTS rounds_admin_ins ON public.rounds;
CREATE POLICY rounds_admin_ins ON public.rounds FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS rounds_admin_upd ON public.rounds;
CREATE POLICY rounds_admin_upd ON public.rounds FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS rounds_admin_del ON public.rounds;
CREATE POLICY rounds_admin_del ON public.rounds FOR DELETE TO authenticated USING (public.is_admin());

-- ─── teams (enhanced) ───
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS primary_color text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS secondary_color text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug) WHERE slug IS NOT NULL;

-- ─── fixtures (replaces matches) ───
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
  venue text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS key text;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS competition_slug text;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS bracket_position integer;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS group_name text;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS matchday integer;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS leg integer NOT NULL DEFAULT 1;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_fixtures_season_slug ON public.fixtures(season_slug);
CREATE INDEX IF NOT EXISTS idx_fixtures_round_slug ON public.fixtures(round_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fixtures_key ON public.fixtures(key) WHERE key IS NOT NULL;
GRANT SELECT ON public.fixtures TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.fixtures TO authenticated;
DROP POLICY IF EXISTS fixtures_read ON public.fixtures;
CREATE POLICY fixtures_read ON public.fixtures FOR SELECT USING (true);
DROP POLICY IF EXISTS fixtures_admin_ins ON public.fixtures;
CREATE POLICY fixtures_admin_ins ON public.fixtures FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS fixtures_admin_upd ON public.fixtures;
CREATE POLICY fixtures_admin_upd ON public.fixtures FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS fixtures_admin_del ON public.fixtures;
CREATE POLICY fixtures_admin_del ON public.fixtures FOR DELETE TO authenticated USING (public.is_admin());

-- ─── official_results (data separation: official scores live here) ───
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
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.official_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS fixture_key text;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS winner_team_code text;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS agg_home_score integer;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS agg_away_score integer;
CREATE INDEX IF NOT EXISTS idx_official_fixture_key ON public.official_results(fixture_key);
GRANT SELECT ON public.official_results TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.official_results TO authenticated;
DROP POLICY IF EXISTS official_results_read ON public.official_results;
CREATE POLICY official_results_read ON public.official_results FOR SELECT USING (true);
DROP POLICY IF EXISTS official_results_admin_ins ON public.official_results;
CREATE POLICY official_results_admin_ins ON public.official_results FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS official_results_admin_upd ON public.official_results;
CREATE POLICY official_results_admin_upd ON public.official_results FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS official_results_admin_del ON public.official_results;
CREATE POLICY official_results_admin_del ON public.official_results FOR DELETE TO authenticated USING (public.is_admin());

-- ─── user_overrides (rebuilt: typed columns, owner-scoped) ───
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
ALTER TABLE public.user_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_overrides ADD COLUMN IF NOT EXISTS fixture_key text;
ALTER TABLE public.user_overrides ADD COLUMN IF NOT EXISTS winner_team_code text;
ALTER TABLE public.user_overrides ADD COLUMN IF NOT EXISTS group_override jsonb;
CREATE INDEX IF NOT EXISTS idx_overrides_user ON public.user_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_overrides_fixture_key ON public.user_overrides(fixture_key);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_overrides TO authenticated;
DROP POLICY IF EXISTS user_overrides_owner ON public.user_overrides;
CREATE POLICY user_overrides_owner ON public.user_overrides FOR ALL TO authenticated
  USING (auth.user_id() = user_id) WITH CHECK (auth.user_id() = user_id);

-- ─── wall_charts (enhanced) ───
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS competition_slug text;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS season_slug text;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS chart_type text NOT NULL DEFAULT 'bracket';
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS share_slug text;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS pdf_config jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wall_charts_share ON public.wall_charts(share_slug) WHERE share_slug IS NOT NULL;
DROP POLICY IF EXISTS wall_charts_owner ON public.wall_charts;
CREATE POLICY wall_charts_owner ON public.wall_charts FOR SELECT TO authenticated
  USING (auth.user_id() = owner_id OR is_public = true);
DROP POLICY IF EXISTS wall_charts_owner_write ON public.wall_charts;
CREATE POLICY wall_charts_owner_write ON public.wall_charts FOR INSERT TO authenticated
  WITH CHECK (auth.user_id() = owner_id);
DROP POLICY IF EXISTS wall_charts_owner_upd ON public.wall_charts;
CREATE POLICY wall_charts_owner_upd ON public.wall_charts FOR UPDATE TO authenticated
  USING (auth.user_id() = owner_id) WITH CHECK (auth.user_id() = owner_id);
DROP POLICY IF EXISTS wall_charts_owner_del ON public.wall_charts;
CREATE POLICY wall_charts_owner_del ON public.wall_charts FOR DELETE TO authenticated
  USING (auth.user_id() = owner_id);

-- ─── themes (preserved) ───
CREATE TABLE IF NOT EXISTS public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  preview_path text,
  is_premium boolean NOT NULL DEFAULT false,
  css_properties jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.themes TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.themes TO authenticated;
DROP POLICY IF EXISTS themes_read ON public.themes;
CREATE POLICY themes_read ON public.themes FOR SELECT USING (true);
DROP POLICY IF EXISTS themes_admin_ins ON public.themes;
CREATE POLICY themes_admin_ins ON public.themes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS themes_admin_upd ON public.themes;
CREATE POLICY themes_admin_upd ON public.themes FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS themes_admin_del ON public.themes;
CREATE POLICY themes_admin_del ON public.themes FOR DELETE TO authenticated USING (public.is_admin());

-- ─── uploaded_backgrounds (preserved) ───
CREATE TABLE IF NOT EXISTS public.uploaded_backgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL DEFAULT auth.user_id(),
  chart_id uuid REFERENCES public.wall_charts(id) ON DELETE CASCADE,
  file_path text NOT NULL, file_name text NOT NULL, file_size bigint,
  mime_type text, crop_settings jsonb, uploaded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.uploaded_backgrounds ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploaded_backgrounds TO authenticated;
DROP POLICY IF EXISTS uploaded_backgrounds_owner ON public.uploaded_backgrounds;
CREATE POLICY uploaded_backgrounds_owner ON public.uploaded_backgrounds FOR ALL TO authenticated
  USING (auth.user_id() = owner_id) WITH CHECK (auth.user_id() = owner_id);

-- ─── subscriptions (preserved) ───
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL DEFAULT auth.user_id(),
  plan_type text NOT NULL DEFAULT 'free', status text NOT NULL DEFAULT 'active',
  stripe_subscription_id text, current_period_start timestamptz, current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
DROP POLICY IF EXISTS subscriptions_owner ON public.subscriptions;
CREATE POLICY subscriptions_owner ON public.subscriptions FOR SELECT TO authenticated USING (auth.user_id() = owner_id);
DROP POLICY IF EXISTS subscriptions_admin_ins ON public.subscriptions;
CREATE POLICY subscriptions_admin_ins ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS subscriptions_admin_upd ON public.subscriptions;
CREATE POLICY subscriptions_admin_upd ON public.subscriptions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── payments (preserved) ───
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL DEFAULT auth.user_id(),
  amount numeric(10,2) NOT NULL, currency text NOT NULL DEFAULT 'GBP',
  payment_type text NOT NULL DEFAULT 'subscription', stripe_payment_id text,
  chart_id uuid REFERENCES public.wall_charts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.payments TO authenticated;
GRANT INSERT ON public.payments TO authenticated;
DROP POLICY IF EXISTS payments_owner ON public.payments;
CREATE POLICY payments_owner ON public.payments FOR SELECT TO authenticated USING (auth.user_id() = owner_id);
DROP POLICY IF EXISTS payments_owner_ins ON public.payments;
CREATE POLICY payments_owner_ins ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.user_id() = owner_id);

-- ─── admin_settings (preserved) ───
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text UNIQUE NOT NULL,
  value boolean NOT NULL DEFAULT true, updated_by text, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.admin_settings TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;
DROP POLICY IF EXISTS admin_settings_read ON public.admin_settings;
CREATE POLICY admin_settings_read ON public.admin_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS admin_settings_write ON public.admin_settings;
CREATE POLICY admin_settings_write ON public.admin_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── audit_logs (preserved) ───
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text, action text NOT NULL,
  resource_type text, resource_id text, details jsonb, ip_address text, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
DROP POLICY IF EXISTS audit_logs_read ON public.audit_logs;
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ─── ai_update_logs (preserved, FK updated to competitions) ───
CREATE TABLE IF NOT EXISTS public.ai_update_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL,
  season_id uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
  action text NOT NULL, source_url text, status text NOT NULL DEFAULT 'pending',
  details jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_update_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.ai_update_logs TO authenticated;
DROP POLICY IF EXISTS ai_update_logs_read ON public.ai_update_logs;
CREATE POLICY ai_update_logs_read ON public.ai_update_logs FOR SELECT TO authenticated USING (public.is_admin());

-- ─── print_settings (preserved) ───
CREATE TABLE IF NOT EXISTS public.print_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_id uuid NOT NULL REFERENCES public.wall_charts(id) ON DELETE CASCADE,
  owner_id text NOT NULL DEFAULT auth.user_id(),
  paper_size text NOT NULL DEFAULT 'A4', orientation text NOT NULL DEFAULT 'landscape',
  color_mode text NOT NULL DEFAULT 'color', crop_marks boolean NOT NULL DEFAULT false,
  bleed boolean NOT NULL DEFAULT false, resolution integer NOT NULL DEFAULT 300
);
ALTER TABLE public.print_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.print_settings TO authenticated;
DROP POLICY IF EXISTS print_settings_owner ON public.print_settings;
CREATE POLICY print_settings_owner ON public.print_settings FOR ALL TO authenticated
  USING (auth.user_id() = owner_id) WITH CHECK (auth.user_id() = owner_id);

-- Grant sequence usage to prevent INSERT permission errors
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anonymous;
