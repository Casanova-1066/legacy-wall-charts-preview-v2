import { getCatalogCompetition, getCatalogSeasons, normalizeTournamentSlug } from '@/lib/catalog';
import { createWorldCup2026Project, createGroupTeams } from './worldCup2026Builder';
import type { BuilderProject } from './types';

function summaryText(competition: string, season: string, winner?: string, runnerUp?: string, finalScore?: string) {
  const parts = [`AI-assisted historical draft for ${competition} ${season}.`];
  if (winner) parts.push(`Champion: ${winner}.`);
  if (runnerUp) parts.push(`Runner-up: ${runnerUp}.`);
  if (finalScore) parts.push(`Final: ${finalScore}.`);
  parts.push('Verify all match-by-match data before publishing or selling this chart.');
  return parts.join(' ');
}

export function createHistoricalAiDraft(competitionSlug: string, seasonSlug: string): BuilderProject {
  const canonical = normalizeTournamentSlug(competitionSlug);
  const competition = getCatalogCompetition(canonical);
  const season = getCatalogSeasons(canonical).find((item) => item.slug === seasonSlug);
  const competitionName = competition?.name ?? canonical;
  const seasonName = season?.name ?? seasonSlug;
  const project = createWorldCup2026Project(`${competitionName} ${seasonName} · AI historical draft`);
  project.id = `local-ai-${Date.now()}`;
  project.templateSlug = season?.templateSlug ?? competition?.templateSlug ?? 'generic-group-knockout';
  project.theme = 'gold';
  project.backgroundOpacity = 26;

  const isWorldCupClassic = canonical === 'fifa-world-cup' && Number(seasonSlug) < 2026;
  const isChampionsClassic = canonical === 'uefa-champions-league' && Number(seasonSlug.slice(0, 4)) <= 2023;
  const groupCount = isWorldCupClassic || isChampionsClassic ? 8 : canonical === 'uefa-european-championship' ? 6 : 12;
  const visibleGroupBlocks = Math.ceil(groupCount / 4);

  project.blocks = project.blocks.map((block) => {
    if (block.type === 'title') {
      return {
        ...block,
        config: {
          ...(block.config || {}),
          text: `${competitionName} ${seasonName}`,
          subtitle: block.page === 'front' ? 'AI-assisted historical knockout draft' : 'AI-assisted historical group-stage draft',
        },
      };
    }
    if (block.type === 'notes') {
      return {
        ...block,
        config: {
          ...(block.config || {}),
          text: summaryText(competitionName, seasonName, season?.winner, season?.runnerUp, season?.finalScore),
        },
      };
    }
    if (block.type === 'group-stage') {
      const index = block.id === 'groups-a-d' ? 0 : block.id === 'groups-e-h' ? 1 : 2;
      const count = Math.max(0, Math.min(4, groupCount - index * 4));
      const startGroup = String.fromCharCode(65 + index * 4);
      return {
        ...block,
        hidden: index >= visibleGroupBlocks,
        config: {
          ...(block.config || {}),
          startGroup,
          groupCount: count || 4,
          teamsPerGroup: 4,
          teams: createGroupTeams(startGroup, count || 4),
        },
      };
    }
    if (block.type === 'knockout') {
      const rounds = isWorldCupClassic
        ? ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']
        : isChampionsClassic
          ? ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']
          : canonical === 'fa-cup'
            ? ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Quarter-finals', 'Semi-finals', 'Final']
            : canonical === 'efl-cup'
              ? ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Quarter-finals', 'Semi-finals', 'Final']
              : ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];
      return {
        ...block,
        config: {
          ...(block.config || {}),
          rounds,
          firstRoundMatches: rounds[0] === 'Round of 16' ? 8 : rounds[0] === 'Round of 32' ? 16 : 32,
          showExtraTime: true,
          showPenalties: true,
        },
      };
    }
    return block;
  });

  return project;
}
