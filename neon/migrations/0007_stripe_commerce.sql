-- Legacy Wall Charts Platform v2 — Stripe commerce, permanent ownership and subscriptions.
-- Run after 0001-0006. Stripe webhooks write through DATABASE_URL; signed-in users read
-- their own records through Neon Data API / RLS.

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  owner_id text PRIMARY KEY,
  email text,
  stripe_customer_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL,
  stripe_customer_id text,
  stripe_checkout_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  product_id text NOT NULL,
  resource_id text,
  amount_total integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'gbp',
  status text NOT NULL DEFAULT 'active',
  purchased_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, product_id, resource_id)
);
CREATE INDEX IF NOT EXISTS purchases_owner_idx ON public.purchases(owner_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS purchases_payment_intent_idx ON public.purchases(stripe_payment_intent_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE NOT NULL,
  product_id text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_owner_idx ON public.subscriptions(owner_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  livemode boolean NOT NULL DEFAULT false,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.stripe_customers, public.purchases, public.subscriptions TO authenticated;

DROP POLICY IF EXISTS stripe_customers_owner_read ON public.stripe_customers;
CREATE POLICY stripe_customers_owner_read ON public.stripe_customers
FOR SELECT TO authenticated USING (owner_id = auth.user_id());

DROP POLICY IF EXISTS purchases_owner_read ON public.purchases;
CREATE POLICY purchases_owner_read ON public.purchases
FOR SELECT TO authenticated USING (owner_id = auth.user_id());

DROP POLICY IF EXISTS subscriptions_owner_read ON public.subscriptions;
CREATE POLICY subscriptions_owner_read ON public.subscriptions
FOR SELECT TO authenticated USING (owner_id = auth.user_id());

-- Browser clients must never grant themselves purchases or subscriptions.
REVOKE INSERT, UPDATE, DELETE ON public.stripe_customers, public.purchases, public.subscriptions, public.stripe_webhook_events FROM anonymous, authenticated;

CREATE OR REPLACE FUNCTION public.has_product_entitlement(p_product_id text, p_resource_id text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.purchases
    WHERE owner_id = auth.user_id()
      AND product_id = p_product_id
      AND status = 'active'
      AND (p_resource_id IS NULL OR resource_id = p_resource_id)
  ) OR EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE owner_id = auth.user_id()
      AND status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_product_entitlement(text, text) TO authenticated;
