export type CatalogCompetition = {
  id: string;
  slug: string;
  aliases?: string[];
  name: string;
  type: string;
  region: string;
  description: string;
  formatSummary: string;
  templateSlug: string;
  is_active: boolean;
  sort_order: number;
};

export type CatalogSeason = {
  id: string;
  slug: string;
  name: string;
  competition_slug: string;
  is_current: boolean;
  sort_order: number;
  templateSlug: string;
  formatSummary: string;
  winner?: string;
  runnerUp?: string;
  finalScore?: string;
  verified?: boolean;
  sourceLabel?: string;
};

export const HISTORICAL_COMPETITIONS: CatalogCompetition[] = [
  {
    id: "catalog-ucl",
    slug: "uefa-champions-league",
    aliases: ["ucl", "champions-league", "championsleague"],
    name: "UEFA Champions League",
    type: "Historical chart search",
    region: "Europe",
    description: "Historical format information and blank classic Champions League wall-chart workshop.",
    formatSummary: "Bespoke template: 8 groups of 4, top 2 qualify, round of 16, quarter-finals, semi-finals and final.",
    templateSlug: "champions-league-classic",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "catalog-world-cup",
    slug: "fifa-world-cup",
    aliases: ["world-cup", "worldcup", "fifa-worldcup"],
    name: "FIFA World Cup",
    type: "Historical chart search",
    region: "Global",
    description: "World Cup format information and bespoke printable tournament chart workshop.",
    formatSummary: "Bespoke templates: 2026 has 12 groups of 4 plus round of 32; classic editions use 8 groups plus knockout.",
    templateSlug: "world-cup-2026",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "catalog-euros",
    slug: "uefa-european-championship",
    aliases: ["euros", "euro", "uefa-euro", "european-championship"],
    name: "UEFA European Championship",
    type: "Historical chart search",
    region: "Europe",
    description: "European Championship format information and printable group-stage wall-chart workshop.",
    formatSummary: "Bespoke modern Euro template: 6 groups of 4, third-place tracker, round of 16 to final.",
    templateSlug: "euro-24-team",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "catalog-fa-cup",
    slug: "fa-cup",
    aliases: ["facup", "emirates-fa-cup"],
    name: "FA Cup",
    type: "Historical chart search",
    region: "England",
    description: "FA Cup round-by-round knockout information and printable blank wall-chart workshop.",
    formatSummary: "Bespoke FA Cup proper template from Round 1 through Round 2, Round 3, Round 4, Round 5, quarter-finals, semi-finals and final.",
    templateSlug: "fa-cup-proper",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "catalog-league-cup",
    slug: "efl-cup",
    aliases: ["league-cup", "carabao-cup", "efl-league-cup"],
    name: "League Cup / Carabao Cup",
    type: "Historical chart search",
    region: "England",
    description: "League Cup format information and printable knockout chart workshop.",
    formatSummary: "Bespoke League Cup template from Round 1, Round 2, Round 3, Round 4, quarter-finals, two-leg semi-finals and final.",
    templateSlug: "league-cup",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "catalog-premier-league",
    slug: "premier-league",
    aliases: ["epl", "english-premier-league"],
    name: "Premier League",
    type: "Historical chart search",
    region: "England",
    description: "Recent Premier League seasons, final tables and printable league wall-chart products.",
    formatSummary: "20-team league-table template with fixtures, standings, top scorer and season notes.",
    templateSlug: "premier-league-table",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "catalog-laliga",
    slug: "laliga",
    aliases: ["la-liga", "spanish-la-liga", "spain-laliga"],
    name: "LaLiga",
    type: "Historical chart search",
    region: "Spain",
    description: "LaLiga season table information and printable league wall-chart workshop.",
    formatSummary: "Bespoke league template: 20-team table, fixture notes, top scorer and season notes panels.",
    templateSlug: "laliga-league",
    is_active: true,
    sort_order: 7,
  },
];

const uclRecent: Record<number, Pick<CatalogSeason, "winner" | "runnerUp" | "finalScore" | "verified" | "sourceLabel">> = {
  2025: { winner: "Paris Saint-Germain", runnerUp: "Arsenal", verified: true, sourceLabel: "UEFA history" },
  2024: { winner: "Paris Saint-Germain", runnerUp: "Inter", finalScore: "5–0", verified: true, sourceLabel: "UEFA history" },
  2023: { winner: "Real Madrid", runnerUp: "Borussia Dortmund", finalScore: "2–0", verified: true, sourceLabel: "UEFA history" },
  2022: { winner: "Manchester City", runnerUp: "Inter", finalScore: "1–0", verified: true, sourceLabel: "UEFA history" },
  2021: { winner: "Real Madrid", runnerUp: "Liverpool", finalScore: "1–0", verified: true, sourceLabel: "UEFA history" },
  2020: { winner: "Chelsea", runnerUp: "Manchester City", finalScore: "1–0", verified: true, sourceLabel: "UEFA history" },
};

const uclSeasons = Array.from({ length: 21 }, (_, i) => {
  const start = 2025 - i;
  const end = String((start + 1) % 100).padStart(2, "0");
  const classic = start <= 2023;
  return {
    id: `catalog-ucl-${start}-${end}`,
    slug: `${start}-${end}`,
    name: `${start}/${end}`,
    competition_slug: "uefa-champions-league",
    is_current: start === 2025,
    sort_order: i + 1,
    templateSlug: classic ? "champions-league-classic" : "champions-league-league-phase",
    formatSummary: classic ? "Classic Champions League: 8 groups of 4, top 2 qualify, two-leg knockout ties to final." : "League phase followed by knockout play-offs, round of 16, quarter-finals, semi-finals and final.",
    ...uclRecent[start],
  } satisfies CatalogSeason;
});

const laligaSeasons = Array.from({ length: 10 }, (_, i) => {
  const start = 2024 - i;
  const end = String((start + 1) % 100).padStart(2, "0");
  return {
    id: `catalog-laliga-${start}-${end}`,
    slug: `${start}-${end}`,
    name: `${start}/${end}`,
    competition_slug: "laliga",
    is_current: start === 2024,
    sort_order: i + 1,
    templateSlug: "laliga-league",
    formatSummary: "LaLiga league-table chart: 20-team standings, season notes and manual fixture/result entry.",
  } satisfies CatalogSeason;
});

const recentEnglishSeasons = Array.from({ length: 6 }, (_, i) => {
  const start = 2025 - i;
  const end = String((start + 1) % 100).padStart(2, "0");
  return { start, end, name: `${start}/${end}` };
});

const premierLeagueRecent: Record<number, Pick<CatalogSeason, "winner" | "verified" | "sourceLabel">> = {
  2025: { winner: "Arsenal", verified: true, sourceLabel: "Premier League history" },
  2024: { winner: "Liverpool", verified: true, sourceLabel: "Premier League history" },
  2023: { winner: "Manchester City", verified: true, sourceLabel: "Premier League history" },
  2022: { winner: "Manchester City", verified: true, sourceLabel: "Premier League history" },
  2021: { winner: "Manchester City", verified: true, sourceLabel: "Premier League history" },
  2020: { winner: "Manchester City", verified: true, sourceLabel: "Premier League history" },
};

const faCupRecent: Record<number, Pick<CatalogSeason, "winner" | "runnerUp" | "finalScore" | "verified" | "sourceLabel">> = {
  2025: { winner: "Manchester City", runnerUp: "Chelsea", finalScore: "1–0", verified: true, sourceLabel: "The FA finals list" },
  2024: { winner: "Crystal Palace", runnerUp: "Manchester City", finalScore: "1–0", verified: true, sourceLabel: "The FA finals list" },
  2023: { winner: "Manchester United", runnerUp: "Manchester City", finalScore: "2–1", verified: true, sourceLabel: "The FA finals list" },
  2022: { winner: "Manchester City", runnerUp: "Manchester United", finalScore: "2–1", verified: true, sourceLabel: "The FA finals list" },
  2021: { winner: "Liverpool", runnerUp: "Chelsea", finalScore: "0–0, 6–5 pens", verified: true, sourceLabel: "The FA finals list" },
  2020: { winner: "Leicester City", runnerUp: "Chelsea", finalScore: "1–0", verified: true, sourceLabel: "The FA finals list" },
};

const leagueCupRecent: Record<number, Pick<CatalogSeason, "winner" | "runnerUp" | "finalScore" | "verified" | "sourceLabel">> = {
  2025: { winner: "Manchester City", runnerUp: "Arsenal", finalScore: "2–0", verified: true, sourceLabel: "EFL competition history" },
  2024: { winner: "Newcastle United", runnerUp: "Liverpool", finalScore: "2–1", verified: true, sourceLabel: "EFL previous finals" },
  2023: { winner: "Liverpool", runnerUp: "Chelsea", finalScore: "1–0 aet", verified: true, sourceLabel: "EFL previous finals" },
  2022: { winner: "Manchester United", runnerUp: "Newcastle United", finalScore: "2–0", verified: true, sourceLabel: "EFL previous finals" },
  2021: { winner: "Liverpool", runnerUp: "Chelsea", finalScore: "0–0, 11–10 pens", verified: true, sourceLabel: "EFL previous finals" },
  2020: { winner: "Manchester City", runnerUp: "Tottenham Hotspur", finalScore: "1–0", verified: true, sourceLabel: "EFL previous finals" },
};

const premierLeagueSeasons = recentEnglishSeasons.map(({ start, end, name }, index) => ({
  id: `catalog-premier-league-${start}-${end}`,
  slug: `${start}-${end}`,
  name,
  competition_slug: "premier-league",
  is_current: index === 0,
  sort_order: index + 1,
  templateSlug: "premier-league-table",
  formatSummary: "Premier League season table, fixtures, leading scorers and notes.",
  ...premierLeagueRecent[start],
} satisfies CatalogSeason));

const faCupSeasons = recentEnglishSeasons.map(({ start, end, name }, index) => ({
  id: `catalog-fa-cup-${start}-${end}`,
  slug: `${start}-${end}`,
  name,
  competition_slug: "fa-cup",
  is_current: index === 0,
  sort_order: index + 1,
  templateSlug: "fa-cup-proper",
  formatSummary: "FA Cup proper round-by-round historical chart.",
  ...faCupRecent[start],
} satisfies CatalogSeason));

const leagueCupSeasons = recentEnglishSeasons.map(({ start, end, name }, index) => ({
  id: `catalog-league-cup-${start}-${end}`,
  slug: `${start}-${end}`,
  name,
  competition_slug: "efl-cup",
  is_current: index === 0,
  sort_order: index + 1,
  templateSlug: "league-cup",
  formatSummary: "League Cup round-by-round historical chart.",
  ...leagueCupRecent[start],
} satisfies CatalogSeason));

export const HISTORICAL_SEASONS: CatalogSeason[] = [
  ...uclSeasons,
  { id: "catalog-world-cup-2026", slug: "2026", name: "2026", competition_slug: "fifa-world-cup", is_current: true, sort_order: 1, templateSlug: "world-cup-2026", formatSummary: "48 teams, 12 groups of 4, best third-place ranking and round of 32 through final." },
  ...[
    [2022, "Argentina", "France", "3–3, 4–2 pens"],
    [2018, "France", "Croatia", "4–2"],
    [2014, "Germany", "Argentina", "1–0 aet"],
    [2010, "Spain", "Netherlands", "1–0 aet"],
    [2006, "Italy", "France", "1–1, 5–3 pens"],
    [2002, "Brazil", "Germany", "2–0"],
  ].map(([year, winner, runnerUp, finalScore], index) => ({ id: `catalog-world-cup-${year}`, slug: String(year), name: String(year), competition_slug: "fifa-world-cup", is_current: false, sort_order: index + 2, templateSlug: "world-cup-32-team", formatSummary: "Classic 32-team World Cup: 8 groups of 4, top 2 qualify, round of 16 through final.", winner: String(winner), runnerUp: String(runnerUp), finalScore: String(finalScore), verified: true, sourceLabel: "FIFA tournament history" } satisfies CatalogSeason)),
  { id: "catalog-euro-2024", slug: "2024", name: "2024", competition_slug: "uefa-european-championship", is_current: false, sort_order: 1, templateSlug: "euro-24-team", formatSummary: "24-team Euro: 6 groups of 4, top two plus four best third-place teams, round of 16 through final.", winner: "Spain", runnerUp: "England", finalScore: "2–1", verified: true, sourceLabel: "UEFA EURO history" },
  ...[
    [2020, "Italy", "England", "1–1, 3–2 pens"],
    [2016, "Portugal", "France", "1–0 aet"],
    [2012, "Spain", "Italy", "4–0"],
    [2008, "Spain", "Germany", "1–0"],
    [2004, "Greece", "Portugal", "1–0"],
  ].map(([year, winner, runnerUp, finalScore], index) => ({ id: `catalog-euro-${year}`, slug: String(year), name: String(year), competition_slug: "uefa-european-championship", is_current: false, sort_order: index + 2, templateSlug: "euro-24-team", formatSummary: "European Championship group-stage and knockout wall-chart format.", winner: String(winner), runnerUp: String(runnerUp), finalScore: String(finalScore), verified: true, sourceLabel: "UEFA EURO history" } satisfies CatalogSeason)),
  ...faCupSeasons,
  ...leagueCupSeasons,
  ...premierLeagueSeasons,
  ...laligaSeasons,
];

export function normalizeTournamentSlug(slug: string | undefined | null) {
  if (!slug) return "";
  const key = slug.toLowerCase().trim();
  return HISTORICAL_COMPETITIONS.find((competition) => competition.slug === key || competition.aliases?.includes(key))?.slug ?? key;
}

export function getCatalogCompetition(slug: string) {
  const canonical = normalizeTournamentSlug(slug);
  return HISTORICAL_COMPETITIONS.find((competition) => competition.slug === canonical) ?? null;
}

export function getCatalogSeasons(competitionSlug: string) {
  const canonical = normalizeTournamentSlug(competitionSlug);
  return HISTORICAL_SEASONS.filter((season) => season.competition_slug === canonical).sort((a, b) => a.sort_order - b.sort_order);
}
