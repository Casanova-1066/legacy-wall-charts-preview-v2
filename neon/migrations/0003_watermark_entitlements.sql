-- Watermark entitlement RPC: server-side check via SECURITY DEFINER function.
-- Called via PostgREST RPC: POST /rpc/check_watermark_entitlement { "p_chart_id": "<uuid>" }
-- Returns the ONLY authority for whether a user may disable the watermark.

CREATE OR REPLACE FUNCTION public.check_watermark_entitlement(p_chart_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id text := auth.user_id();
  v_has_sub boolean := false;
  v_has_pdf boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', NULL,
      'has_active_subscription', false,
      'has_purchased_pdf', false,
      'watermark_unlocked', false,
      'can_remove_watermark', false
    );
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE owner_id = v_user_id
      AND plan_type = 'pro'
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  ) INTO v_has_sub;

  IF p_chart_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.payments
      WHERE owner_id = v_user_id
        AND chart_id = p_chart_id
        AND status = 'succeeded'
        AND payment_type = 'pdf'
    ) INTO v_has_pdf;
  END IF;

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'has_active_subscription', v_has_sub,
    'has_purchased_pdf', v_has_pdf,
    'watermark_unlocked', (v_has_sub OR v_has_pdf),
    'can_remove_watermark', (v_has_sub OR v_has_pdf)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_watermark_entitlement(uuid) TO authenticated, anon;