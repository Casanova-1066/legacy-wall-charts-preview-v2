-- Platform v2 cloud project storage.
-- Run after 0007_stripe_commerce.sql.

CREATE TABLE IF NOT EXISTS public.builder_projects (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled wall chart',
  template_slug text NOT NULL DEFAULT 'custom',
  project_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_projects_owner_updated
  ON public.builder_projects(owner_id, updated_at DESC);

ALTER TABLE public.builder_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS builder_projects_owner_select ON public.builder_projects;
CREATE POLICY builder_projects_owner_select ON public.builder_projects
  FOR SELECT TO authenticated
  USING (owner_id = auth.user_id());

DROP POLICY IF EXISTS builder_projects_owner_insert ON public.builder_projects;
CREATE POLICY builder_projects_owner_insert ON public.builder_projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.user_id());

DROP POLICY IF EXISTS builder_projects_owner_update ON public.builder_projects;
CREATE POLICY builder_projects_owner_update ON public.builder_projects
  FOR UPDATE TO authenticated
  USING (owner_id = auth.user_id())
  WITH CHECK (owner_id = auth.user_id());

DROP POLICY IF EXISTS builder_projects_owner_delete ON public.builder_projects;
CREATE POLICY builder_projects_owner_delete ON public.builder_projects
  FOR DELETE TO authenticated
  USING (owner_id = auth.user_id());
