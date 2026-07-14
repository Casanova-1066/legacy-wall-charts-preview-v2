import type { Fixture, Round, Team } from "@/types/tournament";

export interface StandingsRow {
  teamCode: string;
  teamName: string;
  shortName: string | null;
  flag: string | null;
  badgeUrl: string | null;
  primaryColor: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface FixtureRow {
  id: string;
  homeCode: string | null;
  awayCode: string | null;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  status: string;
  resultSource: string | null;
  verified: boolean;
  resultMode: "official" | "manual" | "pending" | "needs-data";
  date: string | null;
  venue: string | null;
  leg: number;
  aggHome: number | null;
  aggAway: number | null;
  bracketPosition: number | null;
  winnerCode: string | null;
}

export interface GroupTable {
  groupName: string;
  standings: StandingsRow[];
  matchdays: { matchday: number; fixtures: FixtureRow[] }[];
}

export interface BracketCell {
  bracketPosition: number | null;
  homeCode: string | null;
  awayCode: string | null;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  aggHome: number | null;
  aggAway: number | null;
  winnerCode: string | null;
  resultSource: string | null;
  verified: boolean;
  resultMode: "official" | "manual" | "pending" | "needs-data";
  date: string | null;
  venue: string | null;
  leg: number;
}

export interface BracketColumn {
  roundName: string;
  roundSlug: string;
  roundOrder: number;
  cells: BracketCell[];
}

export interface WallChartViewModel {
  competitionName: string;
  seasonName: string;
  groupTables: GroupTable[];
  leagueTable: StandingsRow[] | null;
  bracketColumns: BracketColumn[];
}
