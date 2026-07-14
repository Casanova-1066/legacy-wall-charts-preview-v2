import { db } from "@/integrations/neon/client";

export type PurchaseRecord = {
  id: string;
  product_id: string;
  resource_id: string | null;
  status: string;
  amount_total: number;
  currency: string;
  purchased_at: string;
};

export type SubscriptionRecord = {
  id: string;
  product_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export async function loadCommerceEntitlements() {
  const [purchases, subscriptions] = await Promise.all([
    db.from<PurchaseRecord[]>("purchases")
      .select("id,product_id,resource_id,status,amount_total,currency,purchased_at")
      .eq("status", "active")
      .order("purchased_at", { ascending: false }),
    db.from<SubscriptionRecord[]>("subscriptions")
      .select("id,product_id,status,current_period_end,cancel_at_period_end")
      .in("status", ["active", "trialing", "past_due"])
      .order("updated_at", { ascending: false }),
  ]);

  return {
    purchases: purchases.data ?? [],
    subscriptions: subscriptions.data ?? [],
    error: purchases.error?.message || subscriptions.error?.message || null,
  };
}
