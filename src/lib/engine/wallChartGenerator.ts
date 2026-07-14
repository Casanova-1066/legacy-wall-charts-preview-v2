import type {
  WallChartData,
  WallChartOptions,
  Standing,
  KnockoutBracket,
  KnockoutMatch,
  Fixture,
  Team,
} from "@/types/tournament";

export interface LeagueGridColumn {
  position: number;
  teamName: string;
  teamCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueGrid {
  layout: "league";
  competitionName: string;
  seasonName: string;
  columns: {
    key: string;
    label: string;
    width: number;
  }[];
  rows: LeagueGridColumn[];
}

export interface KnockoutNode {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCode: string | null;
  awayCode: string | null;
  homeScore: number | null;
  awayScore: number | null;
  date: string | null;
  venue: string | null;
  winner: string | null;
  round: string;
  nextMatchIndex: number | null;
}

export interface KnockoutGrid {
  layout: "knockout";
  competitionName: string;
  seasonName: string;
  rounds: {
    name: string;
    roundNumber: number;
    nodes: KnockoutNode[];
  }[];
}

export interface GroupKnockoutGrid {
  layout: "group_knockout";
  competitionName: string;
  seasonName: string;
  groups: {
    name: string;
    standings: LeagueGridColumn[];
  }[];
  knockout: {
    rounds: {
      name: string;
      roundNumber: number;
      nodes: KnockoutNode[];
    }[];
  };
}

export type RenderableWallChart = LeagueGrid | KnockoutGrid | GroupKnockoutGrid;

export function generateRenderableChart(
  data: WallChartData,
  options?: WallChartOptions,
): RenderableWallChart {
  const layout = options?.layout ?? (data.type === "league" ? "league" : data.type === "cup" ? "knockout" : "group_knockout");

  switch (layout) {
    case "league":
      return generateLeagueGrid(data, options);
    case "knockout":
      return generateKnockoutGrid(data, options);
    case "group_knockout":
      return generateGroupKnockoutGrid(data, options);
  }
}

function generateLeagueGrid(data: WallChartData, options?: WallChartOptions): LeagueGrid {
  const defaultColumns = [
    { key: "position", label: "#", width: 40 },
    { key: "teamName", label: "Team", width: 180 },
    { key: "played", label: "P", width: 36 },
    { key: "won", label: "W", width: 36 },
    { key: "drawn", label: "D", width: 36 },
    { key: "lost", label: "L", width: 36 },
    { key: "goalsFor", label: "GF", width: 36 },
    { key: "goalsAgainst", label: "GA", width: 36 },
    { key: "goalDifference", label: "GD", width: 40 },
    { key: "points", label: "Pts", width: 44 },
  ];

  const standings = data.standings ?? [];
  const rows: LeagueGridColumn[] = standings.map((s) => ({
    position: s.position,
    teamName: s.teamName,
    teamCode: s.teamCode,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalDifference,
    points: s.points,
  }));

  return {
    layout: "league",
    competitionName: data.competitionName,
    seasonName: data.seasonName,
    columns: defaultColumns,
    rows,
  };
}

function generateKnockoutGrid(data: WallChartData, options?: WallChartOptions): KnockoutGrid {
  const bracket = data.knockoutBracket;
  const nodes: KnockoutNode[] = [];

  if (bracket) {
    const allMatches: KnockoutMatch[] = [];
    for (const round of bracket.rounds) {
      for (const match of round.matches) {
        allMatches.push(match);
      }
    }

    for (let i = 0; i < allMatches.length; i++) {
      const m = allMatches[i];
      const nextIndex = i < allMatches.length - 1 ? i + 1 : null;

      nodes.push({
        id: m.id,
        homeTeam: m.homeTeamName,
        awayTeam: m.awayTeamName,
        homeCode: m.homeTeamCode,
        awayCode: m.awayTeamCode,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        date: m.date,
        venue: m.venue,
        winner: m.winner,
        round: m.round,
        nextMatchIndex: nextIndex,
      });
    }
  }

  const rounds = bracket
    ? bracket.rounds.map((r) => ({
        name: r.name,
        roundNumber: r.roundNumber,
        nodes: nodes.filter((n) => n.round === r.name),
      }))
    : [];

  return {
    layout: "knockout",
    competitionName: data.competitionName,
    seasonName: data.seasonName,
    rounds,
  };
}

function generateGroupKnockoutGrid(data: WallChartData, options?: WallChartOptions): GroupKnockoutGrid {
  const leagueGrid = generateLeagueGrid(data, options);
  const knockoutGrid = generateKnockoutGrid(data, options);

  return {
    layout: "group_knockout",
    competitionName: data.competitionName,
    seasonName: data.seasonName,
    groups: [
      {
        name: data.rounds[0]?.name ?? "Group Stage",
        standings: leagueGrid.rows,
      },
    ],
    knockout: {
      rounds: knockoutGrid.rounds,
    },
  };
}

export function compileMatchdayData(
  fixtures: Fixture[],
  teams: Team[],
): {
  matchday: number;
  fixtures: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeCode: string | null;
    awayCode: string | null;
    homeScore: number | null;
    awayScore: number | null;
    date: string | null;
    venue: string | null;
    status: string;
  }[];
}[] {
  const byMatchday = new Map<number, Fixture[]>();
  for (const f of fixtures) {
    const md = f.matchday || 0;
    if (!byMatchday.has(md)) byMatchday.set(md, []);
    byMatchday.get(md)!.push(f);
  }

  return [...byMatchday.entries()]
    .sort(([a], [b]) => a - b)
    .map(([matchday, fxs]) => ({
      matchday,
      fixtures: fxs.map((f) => {
        const homeT = teams.find((t) => t.id === f.homeTeamId || t.code === f.homeTeamCode);
        const awayT = teams.find((t) => t.id === f.awayTeamId || t.code === f.awayTeamCode);
        return {
          id: f.id,
          homeTeam: homeT?.shortName ?? homeT?.name ?? f.homeTeamCode ?? "TBD",
          awayTeam: awayT?.shortName ?? awayT?.name ?? f.awayTeamCode ?? "TBD",
          homeCode: f.homeTeamCode,
          awayCode: f.awayTeamCode,
          homeScore: f.homeScore,
          awayScore: f.awayScore,
          date: f.date,
          venue: f.venue,
          status: f.status,
        };
      }),
    }));
}
