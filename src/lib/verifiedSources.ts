export type VerifiedSource = {
  sourceKey: string;
  competitionSlug: string;
  name: string;
  url: string;
  type: "official" | "licensed-api" | "reputable-secondary";
  trustLevel: number;
};

export const VERIFIED_SOURCES: VerifiedSource[] = [
  {
    sourceKey: "fifa-worldcup-2026",
    competitionSlug: "worldcup",
    name: "FIFA World Cup 2026 official schedule, fixtures and results",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums",
    type: "official",
    trustLevel: 100,
  },
  {
    sourceKey: "fifa-worldcup-archive",
    competitionSlug: "worldcup",
    name: "FIFA World Cup official archive",
    url: "https://www.fifa.com/en/archive",
    type: "official",
    trustLevel: 100,
  },
  {
    sourceKey: "uefa-ucl-history",
    competitionSlug: "ucl",
    name: "UEFA Champions League official history",
    url: "https://www.uefa.com/uefachampionsleague/history/",
    type: "official",
    trustLevel: 100,
  },
  {
    sourceKey: "thefa-facup-results-archive",
    competitionSlug: "facup",
    name: "The FA Cup official results archive",
    url: "https://www.thefa.com/competitions/thefacup/results-archive",
    type: "official",
    trustLevel: 100,
  },
  {
    sourceKey: "efl-carabao-cup",
    competitionSlug: "carabao",
    name: "EFL Carabao Cup official competition page",
    url: "https://efl.com/competitions/carabao-cup",
    type: "official",
    trustLevel: 95,
  },
  {
    sourceKey: "uefa-euro-history",
    competitionSlug: "euros",
    name: "UEFA EURO official history",
    url: "https://www.uefa.com/uefaeuro/history/",
    type: "official",
    trustLevel: 100,
  },
];
