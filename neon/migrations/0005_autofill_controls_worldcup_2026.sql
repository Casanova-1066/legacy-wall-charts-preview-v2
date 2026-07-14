-- Legacy Wall Charts fix v4 — auto-fill controls + World Cup 2026 schedule shell.
-- This migration does not invent results. It marks unverified placeholder slots clearly,
-- stores source metadata, and gives the app a working official-data shell for 2026.

ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS confidence numeric DEFAULT 0;
ALTER TABLE public.official_results ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'needs-import';
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.wall_charts ADD COLUMN IF NOT EXISTS auto_fill_enabled boolean NOT NULL DEFAULT false;

INSERT INTO public.admin_settings (key, value)
VALUES
  ('automatic_result_filling', true),
  ('ai_historical_imports', false),
  ('live_result_updates', false)
ON CONFLICT (key) DO NOTHING;

-- Public tournament key dates from FIFA/livescore schedules: group stage 11-27 Jun,
-- R32 28 Jun-3 Jul, R16 4-7 Jul, QF 9-11 Jul, SF 14-15 Jul,
-- third place 18 Jul, final 19 Jul. Match-specific teams/results still need data import.
UPDATE public.fixtures
SET source_url = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums',
    scheduled_date = CASE
      WHEN round_slug = 'group-stage' AND matchday <= 1 THEN DATE '2026-06-11'
      WHEN round_slug = 'group-stage' AND matchday = 2 THEN DATE '2026-06-18'
      WHEN round_slug = 'group-stage' AND matchday >= 3 THEN DATE '2026-06-24'
      WHEN round_slug = 'round-of-32' THEN DATE '2026-06-28'
      WHEN round_slug = 'round-of-16' THEN DATE '2026-07-04'
      WHEN round_slug = 'quarter-finals' THEN DATE '2026-07-09'
      WHEN round_slug = 'semi-finals' THEN DATE '2026-07-14'
      WHEN round_slug = 'third-place' THEN DATE '2026-07-18'
      WHEN round_slug = 'final' THEN DATE '2026-07-19'
      ELSE scheduled_date
    END,
    updated_at = now()
WHERE season_slug = 'worldcup-2026';

UPDATE public.official_results
SET source = 'fifa-official-schedule-shell',
    source_url = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums',
    verified = false,
    confidence = 0.5,
    verification_status = 'fixture-shell-only',
    notes = 'World Cup 2026 chart slot is active. Match-specific team/result data still needs verified import.',
    updated_at = now()
WHERE fixture_key LIKE 'worldcup-2026|%'
  AND (source IS NULL OR source = 'data-import-pending' OR source = 'fifa-official-schedule-shell');


-- Auto-fill is a paid entitlement. Existing free charts should remain manual by default.
UPDATE public.wall_charts
SET auto_fill_enabled = false
WHERE auto_fill_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.owner_id = wall_charts.owner_id
      AND s.plan_type = pro
      AND s.status = active
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.owner_id = wall_charts.owner_id
      AND p.chart_id = wall_charts.id
      AND p.status = succeeded
      AND p.payment_type = pdf
  );
