import type { BracketCell, BracketColumn, GroupTable, StandingsRow, WallChartViewModel } from "./types";

function blankStanding(index: number): StandingsRow {
  return { teamCode: `blank-${index}`, teamName: "", shortName: null, flag: null, badgeUrl: null, primaryColor: null, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
}

function blankFixture(id: string, leg = 1) {
  return { id, homeCode: null, awayCode: null, homeName: "", awayName: "", homeScore: null, awayScore: null, penaltiesHome: null, penaltiesAway: null, status: "scheduled", resultSource: null, verified: false, resultMode: "pending" as const, date: null, venue: null, leg, aggHome: null, aggAway: null, bracketPosition: null, winnerCode: null };
}

function blankGroup(name: string, fixtures = 6): GroupTable {
  return { groupName: name, standings: Array.from({ length: 4 }, (_, i) => blankStanding(i)), matchdays: [{ matchday: 1, fixtures: Array.from({ length: fixtures }, (_, i) => blankFixture(`${name}-${i + 1}`)) }] };
}

function blankCell(round: string, index: number, leg = 1): BracketCell {
  return { ...blankFixture(`${round}-${index + 1}`, leg), bracketPosition: index + 1 };
}

function blankColumn(roundName: string, count: number, order: number, leg = 1): BracketColumn {
  return { roundName, roundSlug: roundName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), roundOrder: order, cells: Array.from({ length: count }, (_, i) => blankCell(roundName, i, leg)) };
}

function groupNames(count: number) {
  return Array.from({ length: count }, (_, i) => `Group ${String.fromCharCode(65 + i)}`);
}

export const BLANK_TEMPLATE_OPTIONS = [
  { slug: "champions-league-classic", name: "Champions League classic", description: "Bespoke: 8 groups of 4, round of 16, quarters, semis and final." },
  { slug: "world-cup-2026", name: "World Cup 2026", description: "Bespoke: 12 groups of 4 plus round of 32 knockout path." },
  { slug: "world-cup-32-team", name: "World Cup classic 32-team", description: "Bespoke: 8 groups of 4 plus round of 16 knockout path." },
  { slug: "euro-24-team", name: "European Championship 24-team", description: "Bespoke: 6 groups of 4, third-place tracker and knockout path." },
  { slug: "fa-cup-proper", name: "FA Cup from Round 1", description: "Bespoke: FA Cup proper knockout from Round 1 through final." },
  { slug: "league-cup", name: "League Cup / Carabao Cup", description: "Bespoke: League Cup knockout from Round 1, with semi-final legs and final." },
  { slug: "laliga-league", name: "LaLiga league table", description: "Bespoke: 20-team league table with season notes panels." },
  { slug: "generic-group-knockout", name: "Custom group + knockout", description: "Reusable blank tournament template." },
  { slug: "generic-knockout", name: "Custom knockout bracket", description: "Simple blank cup bracket." },
  { slug: "league-table", name: "Custom league table", description: "Simple blank league-season chart." },
];

export function createBlankWallChart(templateSlug: string, title: string, subtitle = "Blank manual template"): WallChartViewModel {
  if (templateSlug === "world-cup-2026") return { competitionName: title || "FIFA World Cup", seasonName: subtitle, groupTables: groupNames(12).map((name) => blankGroup(name, 3)), leagueTable: null, bracketColumns: [blankColumn("Best third-place tracker", 8, 1), blankColumn("Round of 32", 16, 2), blankColumn("Round of 16", 8, 3), blankColumn("Quarter-finals", 4, 4), blankColumn("Semi-finals", 2, 5), blankColumn("Final", 1, 6)] };
  if (templateSlug === "world-cup-32-team") return { competitionName: title || "FIFA World Cup", seasonName: subtitle, groupTables: groupNames(8).map((name) => blankGroup(name, 6)), leagueTable: null, bracketColumns: [blankColumn("Round of 16", 8, 1), blankColumn("Quarter-finals", 4, 2), blankColumn("Semi-finals", 2, 3), blankColumn("Third place", 1, 4), blankColumn("Final", 1, 5)] };
  if (templateSlug === "champions-league-classic") return { competitionName: title || "UEFA Champions League", seasonName: subtitle, groupTables: groupNames(8).map((name) => blankGroup(name, 6)), leagueTable: null, bracketColumns: [blankColumn("Round of 16 - 1st leg", 8, 1, 1), blankColumn("Round of 16 - 2nd leg", 8, 2, 2), blankColumn("Quarter-finals", 4, 3), blankColumn("Semi-finals", 2, 4), blankColumn("Final", 1, 5)] };
  if (templateSlug === "euro-24-team") return { competitionName: title || "UEFA European Championship", seasonName: subtitle, groupTables: groupNames(6).map((name) => blankGroup(name, 6)), leagueTable: null, bracketColumns: [blankColumn("Best third-place teams", 4, 1), blankColumn("Round of 16", 8, 2), blankColumn("Quarter-finals", 4, 3), blankColumn("Semi-finals", 2, 4), blankColumn("Final", 1, 5)] };
  if (templateSlug === "fa-cup-proper") return { competitionName: title || "FA Cup", seasonName: subtitle, groupTables: [], leagueTable: null, bracketColumns: [blankColumn("Round 1", 40, 1), blankColumn("Round 2", 20, 2), blankColumn("Round 3", 32, 3), blankColumn("Round 4", 16, 4), blankColumn("Round 5", 8, 5), blankColumn("Quarter-finals", 4, 6), blankColumn("Semi-finals", 2, 7), blankColumn("Final", 1, 8)] };
  if (templateSlug === "league-cup") return { competitionName: title || "League Cup / Carabao Cup", seasonName: subtitle, groupTables: [], leagueTable: null, bracketColumns: [blankColumn("Round 1", 35, 1), blankColumn("Round 2", 25, 2), blankColumn("Round 3", 16, 3), blankColumn("Round 4", 8, 4), blankColumn("Quarter-finals", 4, 5), blankColumn("Semi-finals - 1st leg", 2, 6, 1), blankColumn("Semi-finals - 2nd leg", 2, 7, 2), blankColumn("Final", 1, 8)] };
  if (templateSlug === "laliga-league" || templateSlug === "league-table") return { competitionName: title || "League Table", seasonName: subtitle, groupTables: [], leagueTable: Array.from({ length: 20 }, (_, i) => blankStanding(i)), bracketColumns: [] };
  if (templateSlug === "generic-knockout") return { competitionName: title || "Knockout Bracket", seasonName: subtitle, groupTables: [], leagueTable: null, bracketColumns: [blankColumn("Round 1", 16, 1), blankColumn("Round 2", 8, 2), blankColumn("Quarter-finals", 4, 3), blankColumn("Semi-finals", 2, 4), blankColumn("Final", 1, 5)] };
  return { competitionName: title || "Tournament Wall Chart", seasonName: subtitle, groupTables: groupNames(4).map((name) => blankGroup(name, 6)), leagueTable: null, bracketColumns: [blankColumn("Quarter-finals", 4, 1), blankColumn("Semi-finals", 2, 2), blankColumn("Final", 1, 3)] };
}
