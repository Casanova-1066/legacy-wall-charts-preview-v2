import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Trophy, FolderOpen, AlertCircle, Search, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getCatalogCompetition, getCatalogSeasons, normalizeTournamentSlug } from "@/lib/catalog";

export const Route = createFileRoute("/tournaments/$tournamentId")({ component: TournamentDetail });

type Season = { id: string; slug: string; name: string; is_current: boolean; sort_order?: number; templateSlug?: string; formatSummary?: string; winner?: string; runnerUp?: string; finalScore?: string; verified?: boolean; sourceLabel?: string };

function TournamentDetail() {
  const { tournamentId } = Route.useParams();
  const [query, setQuery] = useState("");
  const canonicalTournamentId = normalizeTournamentSlug(tournamentId);
  const catalogCompetition = getCatalogCompetition(canonicalTournamentId);
  const catalogSeasons = getCatalogSeasons(canonicalTournamentId);

  const { data: dbCompetition } = useQuery({
    queryKey: ["competition", canonicalTournamentId],
    queryFn: async () => {
      const { data, error } = await db.from<any>("competitions").select("*").eq("slug", canonicalTournamentId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    retry: false,
  });

  const { data: dbSeasons, isLoading, error, refetch } = useQuery({
    queryKey: ["seasons", canonicalTournamentId],
    queryFn: async () => {
      const { data, error } = await db.from<Season[]>("seasons").select("*").eq("competition_slug", canonicalTournamentId).order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    retry: false,
  });

  const competition = dbCompetition ?? catalogCompetition;
  const seasons = useMemo(() => {
    const bySlug = new Map<string, any>();
    catalogSeasons.forEach((season) => bySlug.set(season.slug, season));
    (dbSeasons ?? []).forEach((season: any) => bySlug.set(season.slug, { ...bySlug.get(season.slug), ...season }));
    return Array.from(bySlug.values()).sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [catalogSeasons, dbSeasons]);

  const filteredSeasons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seasons;
    return seasons.filter((season: any) => [season.name, season.slug, season.formatSummary, season.templateSlug].join(" ").toLowerCase().includes(q));
  }, [seasons, query]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/tournaments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Historical Search
      </Link>

      {competition && (
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gold/10">
              <Trophy className="h-8 w-8 text-gold" />
            </div>
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Historical Information</p>
              <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
              <p className="text-muted-foreground">{competition.region ?? ""} &middot; {competition.type}</p>
              {competition.formatSummary && <p className="mt-3 text-sm text-gold/75">{competition.formatSummary}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gold/10 bg-navy/40 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search seasons, 2023/24, 2026, classic..." className="pl-9" />
        </div>
        <Link to="/editor/new" search={{ tournament: canonicalTournamentId }}>
          <Button className="bg-gold text-navy hover:bg-gold-light"><Wand2 className="mr-2 h-4 w-4" /> Blank template</Button>
        </Link>
      </div>

      {isLoading && seasons.length === 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Seasons</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </>
      ) : error && filteredSeasons.length === 0 ? (
        <div className="glass-panel rounded-xl border border-gold/10 p-12 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Couldn't load seasons</h2>
          <p className="mt-1 text-sm text-muted-foreground">The database seasons did not load. Try again or use a blank template.</p>
          <button type="button" onClick={() => refetch()} className="mt-4 rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10">Retry</button>
        </div>
      ) : filteredSeasons.length === 0 ? (
        <div className="glass-panel rounded-xl border border-gold/10 p-12 text-center max-w-md mx-auto">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No seasons found</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try another search term or create a blank printable chart.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Seasons & chart templates</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredSeasons.map((s: any) => (
              <Card key={s.id} className="glass-panel border-gold/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-5 w-5 text-gold/60" />
                    {s.is_current && <Badge className="bg-gold/20 text-gold text-[10px]">Current</Badge>}
                  </div>
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="mt-2 min-h-10 text-xs text-muted-foreground">{s.formatSummary ?? "Open a printable wall-chart template for this season."}</p>
                  {s.winner && <div className="mt-3 rounded-lg border border-gold/10 bg-navy/50 p-3 text-xs"><p><span className="text-muted-foreground">Winner:</span> <span className="font-semibold text-foreground">{s.winner}</span></p>{s.runnerUp && <p className="mt-1"><span className="text-muted-foreground">Runner-up:</span> {s.runnerUp}</p>}{s.finalScore && <p className="mt-1 text-gold">Final: {s.finalScore}</p>}{s.verified && <p className="mt-2 text-[10px] uppercase tracking-wider text-emerald-400">Verified · {s.sourceLabel ?? "official history"}</p>}</div>}
                  <div className="mt-3 flex flex-col gap-2">
                    <Link to="/tournaments/$tournamentId/$seasonId" params={{ tournamentId: canonicalTournamentId, seasonId: s.slug }}>
                      <Button variant="outline" size="sm" className="w-full border-gold/30 text-gold hover:bg-gold/10">Historical info</Button>
                    </Link>
                    <Link to="/editor/new" search={{ tournament: canonicalTournamentId, season: s.slug }}>
                      <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold-light">Create printable chart</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
