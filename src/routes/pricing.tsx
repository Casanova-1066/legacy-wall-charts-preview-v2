import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, formatGbp } from "@/lib/commerce/products";
import { Check, Crown, FileText, History, Star, Zap } from "lucide-react";

export const Route = createFileRoute("/pricing")({ component: Pricing });

const iconMap: Record<string, any> = {
  "blank-template": FileText,
  "historical-chart": History,
  "pro-monthly": Star,
  "pro-yearly": Zap,
  lifetime: Crown,
};

function Pricing() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 text-center">
        <Badge className="mb-4 bg-gold/10 text-gold border-gold/20">Platform v2 pricing</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Build, print and collect legacy wall charts</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Start free with watermarked previews. Unlock individual templates, buy completed historical charts, or subscribe for regular PDF and historical download credits.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {PRODUCTS.map((product) => {
          const Icon = iconMap[product.id] ?? Check;
          const popular = product.id === "pro-monthly";
          return (
            <Card key={product.id} className={`glass-panel relative border-gold/10 ${popular ? "gold-glow border-gold/30" : ""}`}>
              {popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy font-semibold">Best value</Badge>}
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-lg font-bold">{product.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">{formatGbp(product.priceGbp)}</span>
                  {product.interval && <span className="text-xs text-muted-foreground">/{product.interval}</span>}
                </div>
                <p className="mt-2 min-h-12 text-sm text-muted-foreground">{product.description}</p>
                <ul className="mt-5 flex-1 space-y-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/checkout" search={{ product: product.id } as any} className="mt-6 block">
                  <Button className={`w-full ${popular ? "gold-glow bg-gold text-navy font-semibold hover:bg-gold-light" : ""}`} variant={popular ? "default" : "outline"}>
                    {product.kind === "subscription" ? "Subscribe" : "Unlock"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="glass-panel border-gold/10"><CardContent className="p-6"><h2 className="font-semibold">Free access</h2><p className="mt-2 text-sm text-muted-foreground">Create and preview charts with watermarking before purchase. Guest drafts remain local to the browser.</p></CardContent></Card>
        <Card className="glass-panel border-gold/10"><CardContent className="p-6"><h2 className="font-semibold">Monthly credits</h2><p className="mt-2 text-sm text-muted-foreground">Pro Monthly includes 10 clean PDF exports and 5 historical chart downloads each month.</p></CardContent></Card>
        <Card className="glass-panel border-gold/10"><CardContent className="p-6"><h2 className="font-semibold">One-time purchases</h2><p className="mt-2 text-sm text-muted-foreground">Blank templates and historical filled charts can also be bought individually and kept forever.</p></CardContent></Card>
      </div>
    </main>
  );
}
