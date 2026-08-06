import type { BuilderBlock, BuilderProject } from './types';

function nowId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

export function createMatchCardBlock(input: Partial<BuilderBlock> & { round?: string; matchNumber?: number } = {}): BuilderBlock {
  const matchNumber = input.matchNumber ?? 1;
  return {
    id: input.id ?? nowId('match'),
    type: 'match-card',
    page: input.page ?? 'front',
    label: input.label ?? `Match ${matchNumber}`,
    x: input.x ?? 8,
    y: input.y ?? 18,
    width: input.width ?? 18,
    height: input.height ?? 10,
    zIndex: input.zIndex ?? 20,
    config: {
      round: input.round ?? 'Round 1',
      team1: 'Team 1',
      team2: 'Team 2',
      score1: '',
      score2: '',
      showExtraTime: true,
      showPenalties: true,
      dateVenue: 'Date / venue',
      ...(input.config ?? {}),
    },
  };
}

function baseProject(name: string, slug: string, blocks: BuilderBlock[], theme: BuilderProject['theme'] = 'midnight'): BuilderProject {
  return {
    id: `local-${Date.now()}`,
    name,
    templateSlug: slug,
    printSize: 'a2',
    orientation: 'landscape',
    backgroundOpacity: 34,
    backgroundFit: 'cover',
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    backgroundScale: 100,
    theme,
    showSafeArea: true,
    safeMarginPct: 3,
    showBleed: false,
    blocks,
    updatedAt: new Date().toISOString(),
  };
}

function title(text: string, subtitle: string): BuilderBlock {
  return { id: nowId('title'), type: 'title', page: 'front', label: 'Tournament title', x: 7, y: 3, width: 86, height: 10, zIndex: 30, config: { text, subtitle } };
}

function notes(text: string): BuilderBlock {
  return { id: nowId('notes'), type: 'notes', page: 'front', label: 'Tournament notes', x: 18, y: 89, width: 64, height: 7, zIndex: 20, config: { text } };
}

export function createSchoolKnockoutProject(name = 'School knockout tournament'): BuilderProject {
  const blocks: BuilderBlock[] = [title(name, 'Editable 16-team knockout board')];
  const columns = [7, 31, 55, 78];
  const rounds = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];
  const counts = [8, 4, 2, 1];
  counts.forEach((count, roundIndex) => {
    const gap = 70 / count;
    Array.from({ length: count }).forEach((_, index) => blocks.push(createMatchCardBlock({
      round: rounds[roundIndex], matchNumber: index + 1, x: columns[roundIndex], y: 15 + index * gap + (gap - 8) / 2, width: roundIndex === 3 ? 17 : 19, height: roundIndex === 3 ? 13 : 8,
      config: { round: rounds[roundIndex], team1: 'Team / Player', team2: 'Team / Player', showExtraTime: roundIndex > 0, showPenalties: roundIndex > 0, dateVenue: 'Date / pitch' },
    })));
  });
  blocks.push(notes('Champion: ____________________    Organiser: ____________________'));
  return baseProject(name, 'school-knockout-16', blocks, 'gold');
}

export function createFiveAsideLeagueProject(name = '5-a-side league board'): BuilderProject {
  return baseProject(name, 'five-a-side-league', [
    title(name, 'League table, fixtures and finals'),
    { id: nowId('table'), type: 'league-table', page: 'front', label: 'League table', x: 5, y: 16, width: 42, height: 68, zIndex: 20, config: { teamCount: 10, title: 'League table' } },
    { id: nowId('fixtures'), type: 'fixtures', page: 'front', label: 'Fixtures', x: 51, y: 16, width: 44, height: 48, zIndex: 20, config: { fixtureCount: 18, title: 'Fixtures & scores' } },
    createMatchCardBlock({ round: 'Semi-final', x: 53, y: 69, width: 18, height: 9, config: { round: 'Semi-final 1', team1: '1st place', team2: '4th place', showExtraTime: false, showPenalties: true, dateVenue: 'Pitch / time' } }),
    createMatchCardBlock({ round: 'Semi-final', x: 76, y: 69, width: 18, height: 9, config: { round: 'Semi-final 2', team1: '2nd place', team2: '3rd place', showExtraTime: false, showPenalties: true, dateVenue: 'Pitch / time' } }),
    createMatchCardBlock({ round: 'Final', x: 64, y: 82, width: 20, height: 11, config: { round: 'Final', team1: 'Winner SF1', team2: 'Winner SF2', showExtraTime: true, showPenalties: true, dateVenue: 'Final pitch / time' } }),
  ], 'midnight');
}

export function createGroupKnockoutProject(name = 'Group and knockout tournament'): BuilderProject {
  return baseProject(name, 'generic-group-knockout-v2', [
    title(name, 'Flexible groups with movable knockout matches'),
    { id: nowId('groups'), type: 'group-stage', page: 'front', label: 'Group stage', x: 4, y: 15, width: 45, height: 72, zIndex: 20, config: { startGroup: 'A', groupCount: 4, teamsPerGroup: 4, showFixtures: true, teams: {} } },
    ...Array.from({ length: 4 }, (_, i) => createMatchCardBlock({ round: 'Quarter-final', matchNumber: i + 1, x: 55, y: 18 + i * 16, width: 18, height: 10, config: { round: `Quarter-final ${i + 1}`, team1: 'Qualifier', team2: 'Qualifier', showExtraTime: true, showPenalties: true, dateVenue: 'Date / venue' } })),
    ...Array.from({ length: 2 }, (_, i) => createMatchCardBlock({ round: 'Semi-final', matchNumber: i + 1, x: 77, y: 28 + i * 30, width: 18, height: 11, config: { round: `Semi-final ${i + 1}`, team1: 'Winner', team2: 'Winner', showExtraTime: true, showPenalties: true, dateVenue: 'Date / venue' } })),
    createMatchCardBlock({ round: 'Final', x: 76, y: 76, width: 20, height: 13, config: { round: 'Final', team1: 'Winner SF1', team2: 'Winner SF2', showExtraTime: true, showPenalties: true, dateVenue: 'Final venue' } }),
  ], 'gold');
}

export function createRoundRobinProject(name = 'Friends round-robin tournament'): BuilderProject {
  return baseProject(name, 'round-robin-board', [
    title(name, 'Editable league and fixture board'),
    { id: nowId('table'), type: 'league-table', page: 'front', label: 'Standings', x: 5, y: 17, width: 42, height: 70, zIndex: 20, config: { teamCount: 12, title: 'Standings' } },
    { id: nowId('fixtures'), type: 'fixtures', page: 'front', label: 'Match schedule', x: 52, y: 17, width: 43, height: 70, zIndex: 20, config: { fixtureCount: 24, title: 'Match schedule' } },
    notes('Winner: ____________________    Top scorer: ____________________'),
  ], 'retro');
}

export function createTournamentTemplate(slug?: string, name?: string): BuilderProject {
  switch (slug) {
    case 'school-knockout-16': return createSchoolKnockoutProject(name);
    case 'five-a-side-league': return createFiveAsideLeagueProject(name);
    case 'round-robin-board': return createRoundRobinProject(name);
    case 'generic-group-knockout':
    case 'generic-group-knockout-v2': return createGroupKnockoutProject(name);
    case 'fa-cup-proper': return createSchoolKnockoutProject(name ?? 'FA Cup-style knockout chart');
    case 'league-cup': return createSchoolKnockoutProject(name ?? 'League Cup-style knockout chart');
    case 'premier-league-table':
    case 'laliga-league': return createRoundRobinProject(name ?? 'League season wall chart');
    case 'champions-league-classic':
    case 'euro-24-team': return createGroupKnockoutProject(name ?? 'Group and knockout wall chart');
    default: return createGroupKnockoutProject(name);
  }
}
