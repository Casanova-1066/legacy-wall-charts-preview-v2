import type { WallChartViewModel, GroupTable, StandingsRow, BracketColumn } from "@/lib/wallchart/types";

export const CHAMPIONS_LEAGUE_SLUG = "uefa-champions-league";
export const CHAMPIONS_LEAGUE_ARCHIVE_URL = "/data/champions-league-1955-2026.json";

export type ArchiveMatch = {
  id: string;
  stage: string;
  round: string;
  group: string | null;
  date: string | null;
  home: string;
  away: string;
  hs: number | null;
  as_: number | null;
  agg: string | null;
};

export type ArchiveTable = {
  name: string;
  rows: Array<{ team: string; p: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number }>;
};

export type ChampionsLeagueArchiveSeason = {
  season: string;
  name: string;
  format: string;
  format_name: string;
  matches: ArchiveMatch[];
  tables: ArchiveTable[];
};

export type ChampionsLeagueArchive = {
  dataset: string;
  coverage: [string, string];
  sources: string[];
  seasons: ChampionsLeagueArchiveSeason[];
};

let archivePromise: Promise<ChampionsLeagueArchive> | null = null;

export function fetchChampionsLeagueArchive() {
  if (!archivePromise) {
    archivePromise = fetch(CHAMPIONS_LEAGUE_ARCHIVE_URL).then(async (response) => {
      if (!response.ok) throw new Error(`Champions League archive failed to load (${response.status})`);
      return response.json() as Promise<ChampionsLeagueArchive>;
    });
  }
  return archivePromise;
}

export function archiveSeasonSummary(season: ChampionsLeagueArchiveSeason, index: number) {
  const final = [...season.matches].reverse().find((match) => /(^|,|\|)\s*final$/i.test(match.round));
  const winner = final && final.hs != null && final.as_ != null
    ? final.hs > final.as_ ? final.home : final.as_ > final.hs ? final.away : undefined
    : undefined;
  const runnerUp = winner && final ? winner === final.home ? final.away : final.home : undefined;
  return {
    id: `archive-ucl-${season.season}`,
    slug: season.season,
    name: season.season.replace("-", "/"),
    competition_slug: CHAMPIONS_LEAGUE_SLUG,
    is_current: index === 0,
    sort_order: index + 1,
    templateSlug: season.format === "league-phase" ? "champions-league-league-phase" : season.format === "eight-groups" ? "champions-league-classic" : "generic-group-knockout-v2",
    formatSummary: season.format_name,
    winner,
    runnerUp,
    finalScore: final?.hs != null && final?.as_ != null ? `${final.hs}–${final.as_}` : undefined,
    verified: false,
    sourceLabel: "Imported archive",
    matchCount: season.matches.length,
  };
}

function standingsRow(row: ArchiveTable["rows"][number]): StandingsRow {
  return {
    teamCode: row.team,
    teamName: row.team,
    shortName: null,
    flag: null,
    badgeUrl: null,
    primaryColor: null,
    played: row.p,
    won: row.w,
    drawn: row.d,
    lost: row.l,
    goalsFor: row.gf,
    goalsAgainst: row.ga,
    goalDifference: row.gd,
    points: row.pts,
  };
}

function normalizedRoundName(round: string) {
  return round.replace(/^Finals,\s*/i, "").replace(/\s*\|\s*Leg\s*\d+$/i, "").trim();
}

export function buildArchiveWallChart(season: ChampionsLeagueArchiveSeason): WallChartViewModel {
  const groupTables: GroupTable[] = season.tables.map((table) => ({
    groupName: table.name.replace(/^Group\s*·\s*/i, ""),
    standings: table.rows.map(standingsRow),
    matchdays: [],
  }));

  const knockoutMatches = season.matches.filter((match) => !/^Group[,\s]/i.test(match.round));
  const rounds = new Map<string, ArchiveMatch[]>();
  knockoutMatches.forEach((match) => {
    const name = normalizedRoundName(match.round);
    if (!rounds.has(name)) rounds.set(name, []);
    rounds.get(name)!.push(match);
  });
  const bracketColumns: BracketColumn[] = Array.from(rounds.entries()).map(([name, matches], roundIndex) => ({
    roundName: name,
    roundSlug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    roundOrder: roundIndex + 1,
    cells: matches.map((match, matchIndex) => ({
      bracketPosition: matchIndex + 1,
      homeCode: match.home,
      awayCode: match.away,
      homeName: match.home,
      awayName: match.away,
      homeScore: match.hs,
      awayScore: match.as_,
      penaltiesHome: null,
      penaltiesAway: null,
      aggHome: null,
      aggAway: null,
      winnerCode: match.hs != null && match.as_ != null && match.hs !== match.as_ ? (match.hs > match.as_ ? match.home : match.away) : null,
      resultSource: "Imported archive",
      verified: false,
      resultMode: "pending",
      date: match.date,
      venue: null,
      leg: /Leg 2/i.test(match.round) ? 2 : 1,
    })),
  }));

  return {
    competitionName: season.name,
    seasonName: season.season.replace("-", "/"),
    groupTables,
    leagueTable: season.format === "league-phase" && season.tables[0] ? season.tables[0].rows.map(standingsRow) : null,
    bracketColumns,
  };
}

export function groupArchiveMatches(season: ChampionsLeagueArchiveSeason) {
  const groups = new Map<string, ArchiveMatch[]>();
  season.matches.forEach((match) => {
    const name = normalizedRoundName(match.round);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(match);
  });
  return Array.from(groups.entries()).map(([name, matches]) => ({ name, matches }));
}
