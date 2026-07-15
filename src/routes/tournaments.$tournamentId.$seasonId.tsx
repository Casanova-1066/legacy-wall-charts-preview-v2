import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompetition, useSeason } from "@/lib/hooks/useTournamentEngine";
import { buildWallChart } from "@/lib/wallchart/builder";
import { WallChartCanvas } from "@/components/wallchart/WallChartCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Bot, Printer, Wand2 } from "lucide-react";
import { useMemo } from "react";
import { getCatalogCompetition, getCatalogSeasons, normalizeTournamentSlug } from "@/lib/catalog";
import { createBlankWallChart } from "@/lib/wallchart/blankTemplates";

export const Route = createFileRoute("/tournaments/$tournamentId/$seasonId")({ component: SeasonDetail });

function SeasonDetail() {
  const { tournamentId, seasonId } = Route.useParams();
  const canonicalTournamentId = normalizeTournamentSlug(tournamentId);
  const catalogCompetition = getCatalogCompetition(canonicalTournamentId);
  const catalogSeason = getCatalogSeasons(canonicalTournamentId).find((season) => season.slug === seasonId);
  const competition = useCompetition(canonicalTournamentId);
  const season = useSeason(seasonId, { autoFillEnabled: false });

  const tourneyName = competition?.name ?? catalogCompetition?.name ?? "Tournament";
  const seasonName = season?.name ?? catalogSeason?.name ?? seasonId;
  const templateSlug = catalogSeason?.templateSlug ?? catalogCompetition?.templateSlug ?? "generic-group-knockout";

  const vm = useMemo(() => {
    if (season) return buildWallChart(tourneyName, seasonName, season.rounds, season.teams);
    if (catalogSeason) return createBlankWallChart(templateSlug, tourneyName, `${seasonName} · historical template`);
    return null;
  }, [season, catalogSeason, templateSlug, tourneyName, seasonName]);

  const loading = !season && !catalogSeason;

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
            <p className="mt-1 text-sm text-muted-foreground">{catalogSeason?.formatSummary ?? "Season information and printable wall-chart preview. Official results do not auto-fill in the editor unless unlocked."}</p>
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
      ) : vm ? (
        <WallChartCanvas vm={vm} tournamentId={canonicalTournamentId} seasonId={seasonId} />
      ) : (
        <p className="text-muted-foreground text-center py-12">Season data not available.</p>
      )}
    </main>
  );
}
