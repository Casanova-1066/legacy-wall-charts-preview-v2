import type { WallChartViewModel } from "@/lib/wallchart/types";
import { GroupStageView } from "./GroupStageView";
import { LeagueTableView } from "./LeagueTableView";
import { KnockoutBracket } from "./KnockoutBracket";
import { Button } from "@/components/ui/button";
import { Printer, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ChampionsLeagueClassicTemplate, WorldCup2026Template } from "./TemplateWallCharts";

export function WallChartCanvas({
  vm, tournamentId, seasonId, backgroundConfig,
}: {
  vm: WallChartViewModel;
  tournamentId: string;
  seasonId: string;
  backgroundConfig?: { url?: string; opacity?: number; scale?: number; blur?: number } | null;
}) {
  const hasContent = vm.groupTables.length > 0 || vm.leagueTable || vm.bracketColumns.length > 0;
  const key = `${tournamentId} ${vm.competitionName} ${seasonId}`.toLowerCase();
  const isChampionsLeagueClassic = (key.includes("ucl") || key.includes("champions")) && !key.includes("2024") && !key.includes("24-25") && !key.includes("2025");
  const isWorldCup = key.includes("worldcup") || key.includes("world-cup") || key.includes("world cup");

  if (hasContent && isChampionsLeagueClassic) {
    return <ChampionsLeagueClassicTemplate vm={vm} background={backgroundConfig} />;
  }

  if (hasContent && isWorldCup) {
    return <WorldCup2026Template vm={vm} background={backgroundConfig} />;
  }

  return (
    <div className="wallchart-canvas space-y-8">
      {/* Poster header */}
      <div className="text-center border-b border-gold/20 pb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-2">Blood Oath Legacy</p>
        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">
          {vm.competitionName}
        </h1>
        <p className="font-display text-xl text-muted-foreground mt-1">{vm.seasonName}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center print:hidden">
        <Button onClick={() => window.print()} variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
          <Printer className="mr-2 h-4 w-4" /> Print / Export PDF
        </Button>
        <Link to="/editor/new" search={{ tournament: tournamentId, season: seasonId }}>
          <Button size="sm" className="gold-glow bg-gold text-navy font-semibold hover:bg-gold-light">
            <Trophy className="mr-2 h-4 w-4" /> Create Wall Chart
          </Button>
        </Link>
      </div>

      {/* Group stage sections */}
      {vm.groupTables.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-gold mb-4 border-b border-gold/20 pb-1">
            Group Stage
          </h2>
          <GroupStageView groups={vm.groupTables} />
        </section>
      )}

      {/* League table */}
      {vm.leagueTable && (
        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-gold mb-4 border-b border-gold/20 pb-1">
            League Table
          </h2>
          <LeagueTableView rows={vm.leagueTable} />
        </section>
      )}

      {/* Knockout bracket */}
      {vm.bracketColumns.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-gold mb-4 border-b border-gold/20 pb-1">
            Knockout Stage
          </h2>
          <KnockoutBracket columns={vm.bracketColumns} />
        </section>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="glass-panel rounded-xl border border-gold/10 p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Fixtures to be announced</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Match data for this season is being verified. You can still create a custom wall chart.
          </p>
        </div>
      )}
    </div>
  );
}
