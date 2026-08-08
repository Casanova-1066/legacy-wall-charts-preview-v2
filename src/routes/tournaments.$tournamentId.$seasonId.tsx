import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompetition, useSeason } from "@/lib/hooks/useTournamentEngine";
import { buildWallChart } from "@/lib/wallchart/builder";
import { WallChartCanvas } from "@/components/wallchart/WallChartCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Bot, Printer, Wand2 } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCatalogCompetition, getCatalogSeasons, normalizeTournamentSlug } from "@/lib/catalog";
import { createBlankWallChart } from "@/lib/wallchart/blankTemplates";
import { buildArchiveWallChart, CHAMPIONS_LEAGUE_SLUG, fetchChampionsLeagueArchive, groupArchiveMatches } from "@/lib/championsLeagueArchive";

export const Route = createFileRoute("/tournaments/$tournamentId/$seasonId")({ component: SeasonDetail });

function SeasonDetail() {
  const { tournamentId, seasonId } = Route.useParams();
  const canonicalTournamentId = normalizeTournamentSlug(tournamentId);
  const catalogCompetition = getCatalogCompetition(canonicalTournamentId);
  const catalogSeason = getCatalogSeasons(canonicalTournamentId).find((season) => season.slug === seasonId);
  const competition = useCompetition(canonicalTournamentId);
  const season = useSeason(seasonId, { autoFillEnabled: false });
  const { data: archiveSeason, isLoading: archiveLoading, error: archiveError } = useQuery({
    queryKey: ["champions-league-archive-season", seasonId],
    queryFn: async () => {
      const archive = await fetchChampionsLeagueArchive();
      return archive.seasons.find((item) => item.season === seasonId) ?? null;
    },
    enabled: canonicalTournamentId === CHAMPIONS_LEAGUE_SLUG,
    staleTime: Infinity,
  });

  const tourneyName = competition?.name ?? catalogCompetition?.name ?? "Tournament";
  const seasonName = season?.name ?? catalogSeason?.name ?? seasonId;
  const templateSlug = catalogSeason?.templateSlug ?? catalogCompetition?.templateSlug ?? "generic-group-knockout";

  const vm = useMemo(() => {
    if (archiveSeason) return buildArchiveWallChart(archiveSeason);
    if (season) return buildWallChart(tourneyName, seasonName, season.rounds, season.teams);
    if (catalogSeason) return createBlankWallChart(templateSlug, tourneyName, `${seasonName} · historical template`);
    return null;
  }, [archiveSeason, season, catalogSeason, templateSlug, tourneyName, seasonName]);

  const archiveRounds = useMemo(() => archiveSeason ? groupArchiveMatches(archiveSeason) : [], [archiveSeason]);
  const loading = archiveLoading || (!season && !catalogSeason && !archiveSeason);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/tournaments/$tournamentId" params={{ tournamentId: canonicalTournamentId }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 print:hidden">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to {tourneyName}
      </Link>

      <Card className="glass-panel mb-6 border-gold/10 print:hidden">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/70"><BookOpen className="h-4 w-4" /> Historical information</p>
            <h1 className="text-2xl font-bold">{tourneyName} {seasonName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{archiveSeason?.format_name ?? catalogSeason?.formatSummary ?? "Season information and printable wall-chart preview. Official results do not auto-fill in the editor unless unlocked."}</p>
            {archiveSeason && <p className="mt-2 text-xs text-amber-300">Imported archive · {archiveSeason.matches.length} matches · source verification required before commercial publication</p>}
            {catalogSeason?.winner && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm"><span><span className="text-muted-foreground">Winner:</span> <strong>{catalogSeason.winner}</strong></span>{catalogSeason.runnerUp && <span><span className="text-muted-foreground">Runner-up:</span> {catalogSeason.runnerUp}</span>}{catalogSeason.finalScore && <span className="text-gold">Final: {catalogSeason.finalScore}</span>}{catalogSeason.verified && <span className="text-emerald-400">Verified · {catalogSeason.sourceLabel ?? "official history"}</span>}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.print()} variant="outline" className="border-gold/30 text-gold hover:bg-gold/10"><Printer className="mr-2 h-4 w-4" /> Print preview</Button>
            <Link to="/historical-builder">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10"><Bot className="mr-2 h-4 w-4" /> AI fill historical chart</Button>
            </Link>
            <Link to="/editor/new" search={{ tournament: canonicalTournamentId, season: seasonId, template: templateSlug }}>
              <Button className="bg-gold text-navy hover:bg-gold-light"><Wand2 className="mr-2 h-4 w-4" /> Create blank chart</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </div>
      ) : archiveError ? (
        <div className="glass-panel rounded-xl border border-red-400/20 p-10 text-center"><p className="font-semibold">The Champions League archive could not be loaded.</p><p className="mt-2 text-sm text-muted-foreground">Refresh the page and try this season again.</p></div>
      ) : vm ? (
        <>
          <WallChartCanvas vm={vm} tournamentId={canonicalTournamentId} seasonId={seasonId} />
          {archiveSeason && <section className="mt-8 print:hidden">
            <div className="mb-4"><h2 className="text-xl font-bold">Complete archived results</h2><p className="text-sm text-muted-foreground">Open any round to inspect every supplied fixture and score.</p></div>
            <div className="space-y-3">
              {archiveRounds.map((round) => <details key={round.name} className="glass-panel rounded-xl border border-gold/10">
                <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-gold">{round.name} <span className="ml-2 text-xs font-normal text-muted-foreground">{round.matches.length} matches</span></summary>
                <div className="grid gap-2 border-t border-gold/10 p-4 md:grid-cols-2">
                  {round.matches.map((match) => <div key={match.id} className="rounded-lg border border-white/10 bg-navy/45 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="truncate">{match.home}</span><strong className="shrink-0 text-gold">{match.hs ?? "–"} – {match.as_ ?? "–"}</strong><span className="truncate text-right">{match.away}</span></div>
                    <div className="mt-1 flex justify-between gap-3 text-[11px] text-muted-foreground"><span>{match.date}</span>{match.agg && <span>{match.agg}</span>}</div>
                  </div>)}
                </div>
              </details>)}
            </div>
          </section>}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-12">Season data not available.</p>
      )}
    </main>
  );
}
