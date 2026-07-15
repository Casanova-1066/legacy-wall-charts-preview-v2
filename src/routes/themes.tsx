import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Lock, Check } from "lucide-react";

export const Route = createFileRoute("/themes")({ component: Themes });

type Theme = { id: string; slug: string; name: string; description: string; preview_path: string | null; is_premium: boolean; css_properties: any };

function Themes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await db.from<Theme[]>("themes").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Theme Gallery</h1>
        <p className="mt-2 text-muted-foreground">Premium themes to make your wall chart stand out</p>
      </div>
      {isLoading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>}
      {error && <p className="text-destructive">Could not load themes.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((t) => (
          <Card key={t.id} className="glass-panel overflow-hidden border-gold/10">
            <div className="aspect-[16/10] bg-navy-light flex items-center justify-center relative">
              <span className="text-lg font-bold text-muted-foreground">{t.name}</span>
              {t.is_premium && <Lock className="absolute top-3 right-3 h-4 w-4 text-gold/60" />}
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                {t.is_premium ? (
                  <Badge variant="outline" className="border-gold/30 text-gold text-[10px]"><Lock className="mr-1 h-3 w-3" /> Premium</Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px]"><Check className="mr-1 h-3 w-3" /> Free</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full border-gold/30 text-gold hover:bg-gold/10 text-xs">Apply Theme</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
