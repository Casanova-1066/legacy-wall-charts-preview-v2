import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { PRODUCTS, formatGbp, productById } from "@/lib/commerce/products";
import { createCheckoutSession } from "@/lib/commerce/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const search = useSearch({ strict: false }) as { product?: string; resourceId?: string };
  const product = productById(search.product);
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function beginCheckout() {
    if (!user) {
      window.location.href = `/login?returnTo=${encodeURIComponent(`/checkout?product=${product.id}${search.resourceId ? `&resourceId=${search.resourceId}` : ""}`)}`;
      return;
    }
    setSubmitting(true);
    try {
      const { url } = await createCheckoutSession(product.id, search.resourceId);
      window.location.assign(url);
    } catch (error: any) {
      toast.error(error?.message || "Checkout could not be started.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/pricing" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to pricing
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Secure checkout</h1>
      <p className="mb-8 text-muted-foreground">Payment is processed by Stripe. Ownership is added to your account after Stripe confirms payment.</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Selected product</h2>
            <div className="rounded-xl border border-gold/10 bg-navy/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-semibold">{product.name}</p><p className="mt-1 text-sm text-muted-foreground">{product.description}</p></div>
                <span className="text-xl font-bold text-gold">{formatGbp(product.priceGbp)}</span>
              </div>
              <ul className="mt-5 space-y-2">{product.features.map((feature) => <li key={feature} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 text-gold" />{feature}</li>)}</ul>
            </div>

            {!loading && !user && <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">You will be asked to sign in before checkout so the purchase can be permanently linked to your account.</div>}

            <Button onClick={beginCheckout} disabled={submitting || loading} className="mt-6 w-full gold-glow bg-gold text-navy font-semibold hover:bg-gold-light">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {user ? `Continue to Stripe — ${formatGbp(product.priceGbp)}` : "Sign in to continue"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-gold/10"><CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>{product.name}</span><span>{formatGbp(product.priceGbp)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>VAT/tax</span><span>Calculated by Stripe</span></div>
            <hr className="border-glass-border my-3" />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-gold">{formatGbp(product.priceGbp)}</span></div>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">Available products: {PRODUCTS.map((item) => item.name).join(", ")}.</div>
        </CardContent></Card>
      </div>
    </main>
  );
}
