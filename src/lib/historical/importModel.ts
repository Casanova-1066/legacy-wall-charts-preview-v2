export type VerificationSeverity = 'info' | 'warning' | 'error' | 'blocker';
export type ImportRecordStatus = 'pending' | 'accepted' | 'warning' | 'rejected';

export type HistoricalEditionInput = {
  season?: unknown;
  champion?: unknown;
  winner?: unknown;
  runner_up?: unknown;
  final_score?: unknown;
  top_scorer?: unknown;
  most_assists?: unknown;
  player_of_season?: unknown;
  [key: string]: unknown;
};

export type HistoricalCompetitionInput = {
  competition_id?: unknown;
  name?: unknown;
  country?: unknown;
  type?: unknown;
  chart_types?: unknown;
  editions?: unknown;
};

export type HistoricalImportIssue = {
  code: string;
  severity: VerificationSeverity;
  field: string;
  message: string;
};

export type NormalizedHistoricalEdition = {
  season: string;
  winnerName?: string;
  runnerUpName?: string;
  finalScoreText?: string;
  awards: Array<{ awardType: string; playerName?: string; teamName?: string; value?: number; unit?: string }>;
  sourceRecord: HistoricalEditionInput;
};

export type NormalizedHistoricalCompetition = {
  competitionId: string;
  name: string;
  country?: string;
  type: string;
  chartTypes: string[];
  editions: NormalizedHistoricalEdition[];
};

const asText = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const normalizeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function normalizeAward(value: unknown, awardType: string, valueKey: string, unit: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const item = value as Record<string, unknown>;
  const playerName = asText(item.player);
  const teamName = asText(item.club) ?? asText(item.team);
  const numeric = typeof item[valueKey] === 'number' ? item[valueKey] as number : undefined;
  if (!playerName && numeric === undefined) return undefined;
  return { awardType, playerName, teamName, value: numeric, unit };
}

export function validateHistoricalCompetition(input: HistoricalCompetitionInput, currentSeason = '2025-26') {
  const issues: HistoricalImportIssue[] = [];
  const id = asText(input.competition_id);
  const name = asText(input.name);
  const type = asText(input.type) ?? 'unknown';
  const rawEditions = Array.isArray(input.editions) ? input.editions : [];

  if (!id) issues.push({ code: 'missing_competition_id', severity: 'blocker', field: 'competition_id', message: 'A stable competition ID is required.' });
  if (!name) issues.push({ code: 'missing_competition_name', severity: 'blocker', field: 'name', message: 'Competition name is required.' });
  if (!Array.isArray(input.editions)) issues.push({ code: 'invalid_editions', severity: 'blocker', field: 'editions', message: 'Editions must be an array.' });

  const seenSeasons = new Set<string>();
  const editions: NormalizedHistoricalEdition[] = [];

  rawEditions.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      issues.push({ code: 'invalid_edition', severity: 'error', field: `editions.${index}`, message: 'Edition must be an object.' });
      return;
    }
    const edition = raw as HistoricalEditionInput;
    const season = asText(edition.season);
    if (!season) {
      issues.push({ code: 'missing_season', severity: 'error', field: `editions.${index}.season`, message: 'Season is required.' });
      return;
    }
    if (seenSeasons.has(season)) issues.push({ code: 'duplicate_season', severity: 'error', field: `editions.${index}.season`, message: `Season ${season} appears more than once.` });
    seenSeasons.add(season);

    const winnerName = asText(edition.winner) ?? asText(edition.champion);
    const runnerUpName = asText(edition.runner_up);
    if (!winnerName) issues.push({ code: 'missing_winner', severity: 'warning', field: `editions.${index}`, message: `${season} has no winner/champion.` });
    if (winnerName && runnerUpName && normalizeName(winnerName) === normalizeName(runnerUpName)) {
      issues.push({ code: 'winner_equals_runner_up', severity: 'blocker', field: `editions.${index}`, message: `${season} lists the same team as winner and runner-up.` });
    }
    if (season > currentSeason) {
      issues.push({ code: 'future_completed_season', severity: 'blocker', field: `editions.${index}.season`, message: `${season} is later than the latest allowed completed season and must be verified.` });
    }

    const awards = [
      normalizeAward(edition.top_scorer, 'top-scorer', 'goals', 'goals'),
      normalizeAward(edition.most_assists, 'most-assists', 'assists', 'assists'),
    ].filter(Boolean) as NormalizedHistoricalEdition['awards'];
    const playerOfSeason = asText(edition.player_of_season);
    if (playerOfSeason) awards.push({ awardType: 'player-of-season', playerName: playerOfSeason });

    editions.push({ season, winnerName, runnerUpName, finalScoreText: asText(edition.final_score), awards, sourceRecord: edition });
  });

  const normalized: NormalizedHistoricalCompetition | null = id && name ? {
    competitionId: id,
    name,
    country: asText(input.country),
    type,
    chartTypes: Array.isArray(input.chart_types) ? input.chart_types.map(asText).filter(Boolean) as string[] : [],
    editions,
  } : null;

  const blockers = issues.filter((issue) => issue.severity === 'blocker').length;
  const errors = issues.filter((issue) => issue.severity === 'error').length;
  const status: ImportRecordStatus = blockers || errors ? 'rejected' : issues.length ? 'warning' : 'accepted';
  return { normalized, issues, status };
}
