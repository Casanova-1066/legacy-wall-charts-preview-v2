import {
  type Competition,
  type Season,
  type Round,
  type Fixture,
  type Team,
  type WallChart,
  type WallChartTemplate,
} from "@/types/tournament";

export interface TournamentData {
  competitions: Competition[];
  seasons: Season[];
  rounds: Round[];
  fixtures: Fixture[];
  teams: Team[];
  wallCharts: WallChart[];
  wallChartTemplates: WallChartTemplate[];
}

type Listener = () => void;

const STORAGE_KEY = "legacy-wall-charts-store";

function loadFromStorage(): TournamentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.competitions?.length) return null;
    return {
      competitions: parsed.competitions ?? [],
      seasons: parsed.seasons ?? [],
      rounds: parsed.rounds ?? [],
      fixtures: parsed.fixtures ?? [],
      teams: parsed.teams ?? [],
      wallCharts: parsed.wallCharts ?? [],
      wallChartTemplates: parsed.wallChartTemplates ?? [],
    };
  } catch {
    return null;
  }
}

function saveToStorage(data: TournamentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

const listeners = new Set<Listener>();

let _data: TournamentData = {
  competitions: [],
  seasons: [],
  rounds: [],
  fixtures: [],
  teams: [],
  wallCharts: [],
  wallChartTemplates: [],
};

export function getStore(): TournamentData {
  return _data;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  listeners.forEach((l) => l());
}

export function seedData(data: TournamentData): void {
  _data = { ...data };
  notify();
}

export function hydrateFromStorage(): boolean {
  const stored = loadFromStorage();
  if (stored) {
    _data = stored;
    notify();
    return true;
  }
  return false;
}

export function persistData(): void {
  saveToStorage(_data);
}

// Mutations — update in place then notify
export function addCompetition(c: Competition): void {
  _data = { ..._data, competitions: [..._data.competitions, c] };
  notify();
}
export function updateCompetition(id: string, patch: Partial<Competition>): void {
  _data = { ..._data, competitions: _data.competitions.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
  notify();
}
export function deleteCompetition(id: string): void {
  _data = { ..._data, competitions: _data.competitions.filter((c) => c.id !== id) };
  notify();
}
export function addSeason(s: Season): void {
  _data = { ..._data, seasons: [..._data.seasons, s] };
  notify();
}
export function updateSeason(id: string, patch: Partial<Season>): void {
  _data = { ..._data, seasons: _data.seasons.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
  notify();
}
export function deleteSeason(id: string): void {
  _data = { ..._data, seasons: _data.seasons.filter((s) => s.id !== id) };
  notify();
}
export function addRound(r: Round): void {
  _data = { ..._data, rounds: [..._data.rounds, r] };
  notify();
}
export function addFixture(f: Fixture): void {
  _data = { ..._data, fixtures: [..._data.fixtures, f] };
  notify();
}
export function addTeam(t: Team): void {
  _data = { ..._data, teams: [..._data.teams, t] };
  notify();
}
export function addWallChart(w: WallChart): void {
  _data = { ..._data, wallCharts: [..._data.wallCharts, w] };
  notify();
}
export function updateWallChart(id: string, patch: Partial<WallChart>): void {
  _data = { ..._data, wallCharts: _data.wallCharts.map((w) => (w.id === id ? { ...w, ...patch } : w)) };
  notify();
}
export function deleteWallChart(id: string): void {
  _data = { ..._data, wallCharts: _data.wallCharts.filter((w) => w.id !== id) };
  notify();
}
