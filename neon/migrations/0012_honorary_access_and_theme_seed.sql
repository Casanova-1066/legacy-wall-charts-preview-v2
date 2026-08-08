-- Beta Build 5: honorary subscriptions and built-in theme catalogue.
CREATE TABLE IF NOT EXISTS public.honorary_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  email text NOT NULL,
  plan_key text NOT NULL CHECK (plan_key IN ('pro-monthly','pro-yearly','lifetime')),
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  note text,
  granted_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS honorary_subscriptions_email_idx ON public.honorary_subscriptions(lower(email));
ALTER TABLE public.honorary_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.honorary_subscriptions FROM anonymous, authenticated;
GRANT SELECT ON public.honorary_subscriptions TO authenticated;
DROP POLICY IF EXISTS honorary_owner_read ON public.honorary_subscriptions;
CREATE POLICY honorary_owner_read ON public.honorary_subscriptions FOR SELECT TO authenticated USING (auth.user_id() = user_id OR public.is_admin());

INSERT INTO public.themes (slug, name, description, preview_path, is_premium, css_properties)
VALUES
 ('midnight','Blood Oath Midnight','Deep navy and metallic gold flagship theme',NULL,false,'{}'::jsonb),
 ('gold','Legacy Gold','Black and antique gold collector theme',NULL,true,'{}'::jsonb),
 ('light','Minimal Print','Clean ink-friendly print theme',NULL,false,'{}'::jsonb),
 ('retro','Retro Newspaper','Warm classic newspaper sports theme',NULL,true,'{}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, is_premium=EXCLUDED.is_premium;
