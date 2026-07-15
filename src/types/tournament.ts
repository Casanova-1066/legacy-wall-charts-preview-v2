export interface Competition {
  id: string;
  slug: string;
  name: string;
  type: "league" | "cup" | "international";
  country: string;
  logoUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Season {
  id: string;
  competitionId: string;
  slug: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  format: "league" | "knockout" | "group_knockout";
  createdAt?: string;
}

export interface Round {
  id: string;
  seasonId: string;
  roundNumber: number;
  name: string;
  type: "group" | "knockout" | "final";
  displayOrder: number;
}

export interface Fixture {
  id: string;
  roundId: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeScore: number | null;
  awayScore: number | null;
  extraTimeHome: number | null;
  extraTimeAway: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  date: string | null;
  venue: string | null;
  status: "scheduled" | "live" | "finished" | "postponed";
  matchday: number;
  notes: string | null;
  resultSource?: string | null;
  verified?: boolean;
  resultMode?: "official" | "manual" | "pending" | "needs-data";
  fixtureKey?: string | null;
}

export interface Result {
  fixtureId: string;
  homeScore: number;
  awayScore: number;
  extraTimeHome: number | null;
  extraTimeAway: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  notes: string | null;
  resultSource?: string | null;
  verified?: boolean;
  resultMode?: "official" | "manual" | "pending" | "needs-data";
  fixtureKey?: string | null;
}

export interface Team {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  country: string;
}

export interface WallChartTemplate {
  id: string;
  name: string;
  layout: "league" | "knockout" | "group_knockout";
  columns: number;
  styleDefaults: Record<string, unknown>;
}

export interface WallChart {
  id: string;
  userId: string;
  seasonId: string;
  templateId: string | null;
  theme: string;
  customizations: Record<string, unknown>;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Standing {
  position: number;
  teamId: string;
  teamCode: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface KnockoutMatch {
  id: string;
  round: string;
  roundNumber: number;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string | null;
  venue: string | null;
  status: string;
  winner: string | null;
}

export interface KnockoutBracket {
  rounds: {
    name: string;
    roundNumber: number;
    matches: KnockoutMatch[];
  }[];
}

export interface WallChartData {
  competitionName: string;
  seasonName: string;
  type: "league" | "cup" | "international";
  standings?: Standing[];
  knockoutBracket?: KnockoutBracket;
  rounds: {
    name: string;
    roundNumber: number;
    fixtures: Fixture[];
  }[];
  teams: Team[];
}

export interface CompetitionFilters {
  type?: Competition["type"];
  country?: string;
  isActive?: boolean;
  search?: string;
}

export interface StandingsOptions {
  sortByGoalsFor?: boolean;
  sortByGoalDifference?: boolean;
}

export interface WallChartOptions {
  layout?: "league" | "knockout" | "group_knockout";
  columns?: number;
  groupByMatchday?: boolean;
  teamDisplay?: "name" | "crest" | "both";
}
