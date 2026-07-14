-- RC1 Stripe commerce and permanent entitlements
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.commerce_customers (
  user_id text PRIMARY KEY,
  stripe_customer_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commerce_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  product_key text NOT NULL,
  resource_id text,
  stripe_checkout_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  amount_total integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'gbp',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','refunded','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS commerce_purchases_user_idx ON public.commerce_purchases(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.commerce_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  product_key text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS commerce_subscriptions_user_idx ON public.commerce_subscriptions(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commerce_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS commerce_customers_owner_select ON public.commerce_customers;
CREATE POLICY commerce_customers_owner_select ON public.commerce_customers
  FOR SELECT TO authenticated USING (user_id = auth.user_id());

DROP POLICY IF EXISTS commerce_purchases_owner_select ON public.commerce_purchases;
CREATE POLICY commerce_purchases_owner_select ON public.commerce_purchases
  FOR SELECT TO authenticated USING (user_id = auth.user_id());

DROP POLICY IF EXISTS commerce_subscriptions_owner_select ON public.commerce_subscriptions;
CREATE POLICY commerce_subscriptions_owner_select ON public.commerce_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.user_id());

-- No browser INSERT/UPDATE/DELETE policies: only the server webhook writes commerce state.
