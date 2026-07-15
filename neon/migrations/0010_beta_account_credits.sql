-- Beta account summary and monthly credit usage.
-- Run after 0009_rc1_commerce.sql.

CREATE TABLE IF NOT EXISTS public.commerce_credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  credit_type text NOT NULL CHECK (credit_type IN ('pdf_export','historical_download')),
  resource_id text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  usage_month date NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS commerce_credit_usage_user_month_idx
  ON public.commerce_credit_usage(user_id, usage_month, credit_type);

ALTER TABLE public.commerce_credit_usage ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.commerce_credit_usage TO authenticated;

DROP POLICY IF EXISTS commerce_credit_usage_owner_select ON public.commerce_credit_usage;
CREATE POLICY commerce_credit_usage_owner_select ON public.commerce_credit_usage
  FOR SELECT TO authenticated USING (user_id = auth.user_id());

-- Browser clients can read their usage, but only trusted server endpoints may add usage.
REVOKE INSERT, UPDATE, DELETE ON public.commerce_credit_usage FROM anonymous, authenticated;
