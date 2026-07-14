import type { StandingsRow } from "@/lib/wallchart/types";
import { StandingsTeam } from "./TeamBadge";

export function LeagueTableView({ rows }: { rows: StandingsRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-gold/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold/10 bg-navy/50">
            <th className="px-2 py-1.5 text-left w-8 text-muted-foreground">Pos</th>
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
          {rows.map((s, i) => (
            <tr key={s.teamCode} className={`border-b border-gold/5 ${i < 2 ? "bg-gold/5" : ""}`}>
              <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
              <td className="px-2 py-1.5"><StandingsTeam row={s} size="md" /></td>
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
