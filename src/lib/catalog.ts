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
    sort_order: 6,
  },
];

const uclSeasons = Array.from({ length: 21 }, (_, i) => {
  const start = 2023 - i;
  const end = String((start + 1) % 100).padStart(2, "0");
  return {
    id: `catalog-ucl-${start}-${end}`,
    slug: `${start}-${end}`,
    name: `${start}/${end}`,
    competition_slug: "uefa-champions-league",
    is_current: start === 2023,
    sort_order: i + 1,
    templateSlug: "champions-league-classic",
    formatSummary: "Classic Champions League: 8 groups of 4, top 2 qualify, two-leg knockout ties to final.",
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

export const HISTORICAL_SEASONS: CatalogSeason[] = [
  ...uclSeasons,
  { id: "catalog-world-cup-2026", slug: "2026", name: "2026", competition_slug: "fifa-world-cup", is_current: true, sort_order: 1, templateSlug: "world-cup-2026", formatSummary: "48 teams, 12 groups of 4, best third-place ranking and round of 32 through final." },
  ...[2022, 2018, 2014, 2010, 2006, 2002, 1998].map((year, index) => ({ id: `catalog-world-cup-${year}`, slug: String(year), name: String(year), competition_slug: "fifa-world-cup", is_current: false, sort_order: index + 2, templateSlug: "world-cup-32-team", formatSummary: "Classic 32-team World Cup: 8 groups of 4, top 2 qualify, round of 16 through final." })),
  { id: "catalog-euro-2024", slug: "2024", name: "2024", competition_slug: "uefa-european-championship", is_current: true, sort_order: 1, templateSlug: "euro-24-team", formatSummary: "24-team Euro: 6 groups of 4, top two plus four best third-place teams, round of 16 through final." },
  ...[2020, 2016].map((year, index) => ({ id: `catalog-euro-${year}`, slug: String(year), name: String(year), competition_slug: "uefa-european-championship", is_current: false, sort_order: index + 2, templateSlug: "euro-24-team", formatSummary: "Modern 24-team European Championship wall-chart format." })),
  { id: "catalog-fa-cup-blank", slug: "blank-fa-cup", name: "Blank FA Cup proper chart", competition_slug: "fa-cup", is_current: true, sort_order: 1, templateSlug: "fa-cup-proper", formatSummary: "Blank FA Cup proper knockout chart from Round 1 to final for manual editing and print." },
  { id: "catalog-league-cup-blank", slug: "blank-league-cup", name: "Blank League Cup chart", competition_slug: "efl-cup", is_current: true, sort_order: 1, templateSlug: "league-cup", formatSummary: "Blank League Cup/Carabao Cup knockout chart from Round 1 to final for manual editing and print." },
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
