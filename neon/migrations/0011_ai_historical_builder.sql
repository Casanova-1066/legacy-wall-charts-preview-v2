-- AI Historical Builder audit trail. AI fill is available only to active Pro or Lifetime accounts.
CREATE TABLE IF NOT EXISTS public.ai_historical_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  competition_slug text NOT NULL,
  season_slug text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','prepared','review_required','approved','failed')),
  source_mode text NOT NULL DEFAULT 'verified_catalogue',
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

CREATE INDEX IF NOT EXISTS ai_historical_jobs_user_requested_idx
  ON public.ai_historical_jobs (user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS ai_historical_jobs_competition_season_idx
  ON public.ai_historical_jobs (competition_slug, season_slug);
