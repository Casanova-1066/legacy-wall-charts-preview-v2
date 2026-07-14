import type { Fixture, Round, Team } from "@/types/tournament";
import type {
  StandingsRow, FixtureRow, GroupTable, BracketCell, BracketColumn, WallChartViewModel,
} from "./types";

function teamName(code: string | null, teams: Team[]): string {
  if (!code) return "TBD";
  const t = teams.find((tm) => tm.code === code);
  return t?.name ?? code;
}

function hasOfficialScore(f: Fixture): boolean {
  return f.homeScore != null && f.awayScore != null;
}

function fixtureToRow(f: Fixture, teams: Team[]): FixtureRow {
  const home = f.homeTeamCode ? teams.find((t) => t.code === f.homeTeamCode) : null;
  const away = f.awayTeamCode ? teams.find((t) => t.code === f.awayTeamCode) : null;
  let winnerCode: string | null = null;
  if (f.homeScore != null && f.awayScore != null) {
    if (f.homeScore > f.awayScore) winnerCode = f.homeTeamCode;
    else if (f.awayScore > f.homeScore) winnerCode = f.awayTeamCode;
    else if (f.penaltiesHome != null && f.penaltiesAway != null) {
      winnerCode = f.penaltiesHome > f.penaltiesAway ? f.homeTeamCode : f.awayTeamCode;
    }
  }
  return {
    id: f.id, homeCode: f.homeTeamCode, awayCode: f.awayTeamCode,
    homeName: home?.name ?? f.homeTeamCode ?? "TBD",
    awayName: away?.name ?? f.awayTeamCode ?? "TBD",
    homeScore: f.homeScore, awayScore: f.awayScore,
    penaltiesHome: f.penaltiesHome, penaltiesAway: f.penaltiesAway,
    status: f.status,
    resultSource: f.resultSource ?? null,
    verified: f.verified ?? false,
    resultMode: f.resultMode ?? (f.resultSource === "data-import-pending" ? "needs-data" : hasOfficialScore(f) ? "official" : "pending"),
    date: f.date, venue: f.venue, leg: 1,
    aggHome: null, aggAway: null, bracketPosition: null, winnerCode,
  };
}

export function buildStandings(fixtures: Fixture[], teams: Team[]): StandingsRow[] {
  const rows = new Map<string, StandingsRow>();
  for (const f of fixtures) {
    if (f.homeScore == null || f.awayScore == null) continue;
    for (const [code, isHome] of [[f.homeTeamCode, true], [f.awayTeamCode, false]] as [string | null, boolean][]) {
      if (!code) continue;
      if (!rows.has(code)) {
        const t = teams.find((tm) => tm.code === code);
        rows.set(code, {
          teamCode: code, teamName: t?.name ?? code, shortName: t?.shortName ?? null,
          flag: (t as any)?.country ?? null, badgeUrl: (t as any)?.logoUrl ?? null,
          primaryColor: (t as any)?.primaryColor ?? null,
          played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        });
      }
      const r = rows.get(code)!;
      r.played++;
      const gf = isHome ? f.homeScore : f.awayScore;
      const ga = isHome ? f.awayScore : f.homeScore;
      r.goalsFor += gf; r.goalsAgainst += ga;
      if (gf > ga) { r.won++; r.points += 3; }
      else if (gf === ga) { r.drawn++; r.points += 1; }
      else { r.lost++; }
    }
  }
  const arr = Array.from(rows.values());
  arr.forEach((r) => { r.goalDifference = r.goalsFor - r.goalsAgainst; });
  arr.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));
  arr.forEach((r, i) => { (r as any).position = i + 1; });
  return arr;
}

export function buildGroupTables(rounds: Round[], teams: Team[]): GroupTable[] {
  const groupRounds = rounds.filter((r) => r.type === "group");
  if (groupRounds.length === 0) return [];
  const allFixtures = groupRounds.flatMap((r) => (r as any).fixtures ?? []);
  const groupNames = [...new Set(allFixtures.map((f: Fixture) => (f as any).group_name ?? (f as any).groupName ?? "Group A").filter(Boolean))] as string[];
  if (groupNames.length === 0) return [];
  return groupNames.map((gn) => {
    const groupFixtures = allFixtures.filter((f: Fixture) => ((f as any).group_name ?? (f as any).groupName ?? "Group A") === gn);
    const standings = buildStandings(groupFixtures, teams);
    const matchdayMap = new Map<number, FixtureRow[]>();
    for (const f of groupFixtures) {
      const md = f.matchday || 1;
      if (!matchdayMap.has(md)) matchdayMap.set(md, []);
      matchdayMap.get(md)!.push(fixtureToRow(f, teams));
    }
    const matchdays = Array.from(matchdayMap.entries()).map(([matchday, fixtures]) => ({ matchday, fixtures }));
    return { groupName: gn, standings, matchdays };
  });
}

export function buildBracketColumns(rounds: Round[], teams: Team[]): BracketColumn[] {
  const koRounds = rounds.filter((r) => r.type === "knockout" || r.type === "final");
  if (koRounds.length === 0) return [];
  return koRounds.map((r) => {
    const fixtures: Fixture[] = (r as any).fixtures ?? [];
    const cells: BracketCell[] = fixtures.map((f) => {
      const row = fixtureToRow(f, teams);
      return {
        bracketPosition: (f as any).bracket_position ?? (f as any).bracketPosition ?? null,
        homeCode: row.homeCode, awayCode: row.awayCode,
        homeName: row.homeName, awayName: row.awayName,
        homeScore: row.homeScore, awayScore: row.awayScore,
        penaltiesHome: row.penaltiesHome, penaltiesAway: row.penaltiesAway,
        aggHome: row.aggHome, aggAway: row.aggAway,
        winnerCode: row.winnerCode,
        resultSource: row.resultSource,
        verified: row.verified,
        resultMode: row.resultMode,
        date: row.date, venue: row.venue, leg: row.leg,
      };
    });
    cells.sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0));
    return {
      roundName: r.name, roundSlug: (r as any).slug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
      roundOrder: r.displayOrder, cells,
    };
  });
}

export function buildWallChart(
  competitionName: string, seasonName: string,
  rounds: Round[], teams: Team[],
): WallChartViewModel {
  const groupTables = buildGroupTables(rounds, teams);
  const bracketColumns = buildBracketColumns(rounds, teams);
  const leagueRounds = rounds.filter((r) => r.type === "group" && (r as any).fixtures?.some((f: Fixture) => !(f as any).group_name));
  const leagueTable = leagueRounds.length > 0 && groupTables.length === 0
    ? buildStandings(leagueRounds.flatMap((r) => (r as any).fixtures ?? []), teams)
    : null;
  return { competitionName, seasonName, groupTables, leagueTable, bracketColumns };
}
