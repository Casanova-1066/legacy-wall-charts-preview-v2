import type { GroupTable } from "@/lib/wallchart/types";
import { StandingsTeam } from "./TeamBadge";

function StandingsTable({ group }: { group: GroupTable }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gold/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold/10 bg-navy/50">
            <th className="px-2 py-1.5 text-left w-8 text-muted-foreground">#</th>
            <th className="px-2 py-1.5 text-left">Team</th>
            <th className="px-1 py-1.5 text-center w-7 text-muted-foreground">P</th>
            <th className="px-1 py-1.5 text-center w-7 text-muted-foreground">W</th>
            <th className="px-1 py-1.5 text-center w-7 text-muted-foreground">D</th>
            <th className="px-1 py-1.5 text-center w-7 text-muted-foreground">L</th>
            <th className="px-1 py-1.5 text-center w-8 text-muted-foreground">GF</th>
            <th className="px-1 py-1.5 text-center w-8 text-muted-foreground">GA</th>
            <th className="px-1 py-1.5 text-center w-8 text-muted-foreground">GD</th>
            <th className="px-2 py-1.5 text-center w-9 font-bold text-gold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map((s, i) => (
            <tr key={s.teamCode} className={`border-b border-gold/5 ${i < 2 ? "bg-gold/5" : ""}`}>
              <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
              <td className="px-2 py-1.5"><StandingsTeam row={s} /></td>
              <td className="px-1 py-1.5 text-center text-muted-foreground">{s.played}</td>
              <td className="px-1 py-1.5 text-center">{s.won}</td>
              <td className="px-1 py-1.5 text-center">{s.drawn}</td>
              <td className="px-1 py-1.5 text-center">{s.lost}</td>
              <td className="px-1 py-1.5 text-center">{s.goalsFor}</td>
              <td className="px-1 py-1.5 text-center">{s.goalsAgainst}</td>
              <td className="px-1 py-1.5 text-center">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
              <td className="px-2 py-1.5 text-center font-bold text-gold">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultStatusBadge({ mode }: { mode: GroupTable["matchdays"][number]["fixtures"][number]["resultMode"] }) {
  const label = mode === "official" ? "Official" : mode === "manual" ? "Manual" : mode === "needs-data" ? "Needs data" : "Pending";
  const tone = mode === "official" ? "text-emerald-300" : mode === "manual" ? "text-sky-300" : mode === "needs-data" ? "text-amber-300" : "text-muted-foreground";
  return <span className={`ml-2 text-[9px] uppercase tracking-wide ${tone}`}>{label}</span>;
}

function MatchdayFixtures({ group }: { group: GroupTable }) {
  if (group.matchdays.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {group.matchdays.map((md) => (
        <div key={md.matchday}>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Matchday {md.matchday}</p>
          <div className="space-y-1">
            {md.fixtures.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-xs glass-panel rounded px-2 py-1 border border-gold/5">
                <span className="flex-1 text-right font-medium">{f.homeName}</span>
                <span className="px-2 font-bold text-gold">
                  {f.homeScore != null ? `${f.homeScore} - ${f.awayScore}` : "vs"}
                </span>
                <span className="flex-1 font-medium">{f.awayName}</span>
                <ResultStatusBadge mode={f.resultMode} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupStageView({ groups }: { groups: GroupTable[] }) {
  if (groups.length === 0) return null;
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.groupName}>
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-gold mb-2 border-b border-gold/20 pb-1">
            {g.groupName}
          </h3>
          <StandingsTable group={g} />
          <MatchdayFixtures group={g} />
        </div>
      ))}
    </div>
  );
}
