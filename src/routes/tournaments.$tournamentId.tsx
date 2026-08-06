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

const TEMPLATE_STYLES = [
  { id: "modern", name: "Official-style modern", note: "Clean broadcast-inspired layout" },
  { id: "classic", name: "Classic wall chart", note: "Traditional poster layout" },
  { id: "minimal", name: "Minimal print", note: "Ink-friendly and highly readable" },
  { id: "stadium", name: "Stadium atmosphere", note: "Sport-specific photographic background" },
  { id: "newspaper", name: "Newspaper", note: "Editorial results-board styling" },
  { id: "retro", name: "Retro era", note: "Period-inspired type and framing" },
  { id: "dark", name: "Dark premium", note: "Midnight and gold collector style" },
  { id: "collector", name: "Collector edition", note: "Expanded honours and notes areas" },
];

type Season = { id: string; slug: string; name: string; is_current: boolean; sort_order?: number; templateSlug?: string; formatSummary?: string; winner?: string; runnerUp?: string; finalScore?: string; verified?: boolean; sourceLabel?: string };

function TournamentDetail() {
  const { tournamentId } = Route.useParams();
  const [query, setQuery] = useState("");
  const canonicalTournamentId = normalizeTournamentSlug(tournamentId);
  const builtInCompetition = getCatalogCompetition(canonicalTournamentId);
  const catalogSeasons = getCatalogSeasons(canonicalTournamentId);

  const { data: profileCompetition } = useQuery({
    queryKey: ["competition-profile", canonicalTournamentId],
    queryFn: async () => {
      const response = await fetch("/competition-catalogue.json");
      if (!response.ok) return null;
      const profiles = await response.json() as any[];
      return profiles.find((profile) => profile.slug === canonicalTournamentId) ?? null;
    },
    retry: false,
  });

  const catalogCompetition = builtInCompetition ?? (profileCompetition ? {
    id: profileCompetition.id,
    slug: profileCompetition.slug,
    name: profileCompetition.name,
    region: profileCompetition.region,
    type: profileCompetition.layoutEngine,
    formatSummary: profileCompetition.formatSummary,
    templateSlug: profileCompetition.layoutEngine === "league" ? "round-robin-board" : profileCompetition.layoutEngine === "league-playoffs" ? "five-a-side-league" : profileCompetition.layoutEngine === "knockout" ? "school-knockout-16" : "generic-group-knockout-v2",
  } : null);

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
      <Link to="/tournaments" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Historical Search</Link>

      {competition && (
        <div className="mb-8"><div className="flex items-start gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gold/10"><Trophy className="h-8 w-8 text-gold" /></div><div className="max-w-3xl"><p className="text-xs uppercase tracking-[0.25em] text-gold/70">Historical Information</p><h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1><p className="text-muted-foreground">{competition.region ?? ""} &middot; {competition.type}</p>{competition.formatSummary && <p className="mt-3 text-sm text-gold/75">{competition.formatSummary}</p>}</div></div></div>
      )}

      {competition && <section className="mb-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-gold/70">Choose a starting design</p><h2 className="text-2xl font-bold">8 editable template styles</h2></div><Badge variant="outline" className="border-gold/30 text-gold">Keep standard or customise</Badge></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TEMPLATE_STYLES.map((style) => <Link key={style.id} to="/editor/new" search={{ tournament: canonicalTournamentId, name: competition.name, template: `${catalogCompetition?.templateSlug ?? "generic-group-knockout-v2"}-${style.id}` }}><Card className="group h-full border-gold/10 bg-navy/50 transition hover:-translate-y-0.5 hover:border-gold/40"><CardContent className="p-4"><div className="mb-3 aspect-[16/9] rounded-lg border border-gold/15 bg-[radial-gradient(circle_at_top,rgba(212,168,67,.18),transparent_55%),linear-gradient(135deg,#11233d,#08111f)] p-3"><div className="grid h-full grid-cols-3 gap-1">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="rounded border border-white/10 bg-black/20" />)}</div></div><h3 className="font-semibold group-hover:text-gold">{style.name}</h3><p className="mt-1 text-xs text-muted-foreground">{style.note}</p></CardContent></Card></Link>)}</div></section>}

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gold/10 bg-navy/40 p-4 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search seasons, 2023/24, 2026, classic..." className="pl-9" /></div><Link to="/editor/new" search={{ tournament: canonicalTournamentId, name: competition?.name, template: catalogCompetition?.templateSlug ?? "generic-group-knockout-v2" }}><Button className="bg-gold text-navy hover:bg-gold-light"><Wand2 className="mr-2 h-4 w-4" /> Blank template</Button></Link></div>

      {isLoading && seasons.length === 0 ? (
        <><h2 className="mb-4 text-xl font-semibold">Seasons</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div></>
      ) : error && filteredSeasons.length === 0 ? (
        <div className="glass-panel mx-auto max-w-md rounded-xl border border-gold/10 p-12 text-center"><AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" /><h2 className="text-xl font-semibold">No verified seasons loaded yet</h2><p className="mt-1 text-sm text-muted-foreground">The competition profile and blank templates are available. Historical seasons will appear after verification.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10">Retry database</button></div>
      ) : filteredSeasons.length === 0 ? (
        <div className="glass-panel mx-auto max-w-md rounded-xl border border-gold/10 p-12 text-center"><FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" /><h2 className="text-xl font-semibold">No verified seasons published yet</h2><p className="mt-1 text-sm text-muted-foreground">Choose one of the editable templates above, fill it manually, or use verified/AI-assisted filling when that season becomes available.</p></div>
      ) : (
        <><h2 className="mb-4 text-xl font-semibold">Seasons & chart templates</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{filteredSeasons.map((s: any) => <Card key={s.id} className="glass-panel border-gold/10"><CardContent className="p-5"><div className="mb-2 flex items-center justify-between"><Calendar className="h-5 w-5 text-gold/60" />{s.is_current && <Badge className="bg-gold/20 text-gold text-[10px]">Current</Badge>}</div><h3 className="text-lg font-bold">{s.name}</h3><p className="mt-2 min-h-10 text-xs text-muted-foreground">{s.formatSummary ?? "Open a printable wall-chart template for this season."}</p>{s.winner && <div className="mt-3 rounded-lg border border-gold/10 bg-navy/50 p-3 text-xs"><p><span className="text-muted-foreground">Winner:</span> <span className="font-semibold text-foreground">{s.winner}</span></p>{s.runnerUp && <p className="mt-1"><span className="text-muted-foreground">Runner-up:</span> {s.runnerUp}</p>}{s.finalScore && <p className="mt-1 text-gold">Final: {s.finalScore}</p>}{s.verified && <p className="mt-2 text-[10px] uppercase tracking-wider text-emerald-400">Verified · {s.sourceLabel ?? "official history"}</p>}</div>}<div className="mt-3 flex flex-col gap-2"><Link to="/tournaments/$tournamentId/$seasonId" params={{ tournamentId: canonicalTournamentId, seasonId: s.slug }}><Button variant="outline" size="sm" className="w-full border-gold/30 text-gold hover:bg-gold/10">Historical info</Button></Link><Link to="/editor/new" search={{ tournament: canonicalTournamentId, season: s.slug, name: competition?.name, template: s.templateSlug ?? catalogCompetition?.templateSlug ?? "generic-group-knockout-v2" }}><Button size="sm" className="w-full bg-gold text-navy hover:bg-gold-light">Create printable chart</Button></Link></div></CardContent></Card>)}</div></>
      )}
    </main>
  );
}
