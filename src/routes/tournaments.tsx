import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Globe, AlertCircle, Search, BookOpen, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { HISTORICAL_COMPETITIONS, normalizeTournamentSlug } from "@/lib/catalog";

export const Route = createFileRoute("/tournaments")({ component: Tournaments });

const TYPE_LABELS: Record<string, string> = {
  cup: "Cup",
  league: "League",
  international: "International",
  "Historical chart search": "Historical chart search",
};

function normalizeCompetition(c: any) {
  const canonicalSlug = normalizeTournamentSlug(c.slug) || c.slug;
  return {
    id: c.id,
    slug: canonicalSlug,
    name: c.name,
    type: c.type,
    region: c.region ?? c.country ?? "",
    description: c.description ?? "Historical information, seasons and printable wall-chart templates.",
    formatSummary: c.formatSummary ?? c.format_summary ?? "Open seasons, view the format and create a printable chart.",
    templateSlug: c.templateSlug ?? c.template_slug ?? null,
    is_active: Boolean(c.is_active ?? true),
    sort_order: c.sort_order ?? 999,
  };
}

function Tournaments() {
  const [query, setQuery] = useState("");
  const { data: dbCompetitions, isLoading, error, refetch } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data, error } = await db.from<any[]>("competitions").select("*").order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const competitions = useMemo(() => {
    const bySlug = new Map<string, any>();
    HISTORICAL_COMPETITIONS.map(normalizeCompetition).forEach((item) => bySlug.set(item.slug, item));
    (dbCompetitions ?? []).map(normalizeCompetition).forEach((item) => {
      const existing = bySlug.get(item.slug);
      if (existing) bySlug.set(item.slug, { ...existing, ...item, id: existing.id, name: existing.name, description: existing.description, formatSummary: existing.formatSummary, templateSlug: existing.templateSlug, sort_order: existing.sort_order });
      else bySlug.set(item.slug, item);
    });
    return Array.from(bySlug.values()).sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [dbCompetitions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return competitions;
    return competitions.filter((c) => [c.name, c.region, c.type, c.description, c.formatSummary].join(" ").toLowerCase().includes(q));
  }, [competitions, query]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/70"><BookOpen className="h-4 w-4" /> Historical Information</p>
        <h1 className="text-3xl font-bold tracking-tight">Historical Information & Chart Search</h1>
        <p className="mt-2 text-muted-foreground">Search football competitions and formats here. The editor is now only for simple blank chart templates; historic results can be added later.</p>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-gold/10 bg-navy/40 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Champions League, World Cup, FA Cup, 2023/24..." className="pl-9" />
        </div>
        <Link to="/editor/new">
          <Button className="bg-gold text-navy hover:bg-gold-light"><Wand2 className="mr-2 h-4 w-4" /> Create blank template</Button>
        </Link>
      </div>

      {isLoading && competitions.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : error && filtered.length === 0 ? (
        <div className="glass-panel rounded-xl border border-gold/10 p-12 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Couldn't load chart search</h2>
          <p className="mt-1 text-sm text-muted-foreground">The built-in historical catalog is still available, but the database list did not load.</p>
          <button type="button" onClick={() => refetch()} className="mt-4 rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10">Retry</button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <Card key={c.id} className="glass-panel h-full border-gold/10 transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                    <Trophy className="h-7 w-7 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> {c.region}</p>
                  </div>
                </div>
                <p className="min-h-12 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-3 text-xs text-gold/75">{c.formatSummary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{TYPE_LABELS[c.type] ?? c.type}</Badge>
                  {c.is_active && <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">Active</Badge>}
                </div>
                <div className="mt-6 flex gap-2">
                  <Link to="/tournaments/$tournamentId" params={{ tournamentId: c.slug }} className="flex-1">
                    <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10">Open history</Button>
                  </Link>
                  <Link to="/editor/new" search={{ tournament: c.slug }} className="flex-1">
                    <Button className="w-full bg-gold text-navy hover:bg-gold-light">Use template</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground col-span-full">No matching tournaments found.</p>}
        </div>
      )}
    </main>
  );
}
