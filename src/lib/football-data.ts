import { db } from "@/integrations/neon/client";

// ── Typed interfaces for the normalized football schema ──
export type Competition = {
  id: string; slug: string; name: string; type: string; region: string | null;
  logo_url: string | null; description: string | null; is_active: boolean;
  featured_order: number | null; sort_order: number;
};

export type Season = {
  id: string; slug: string; competition_slug: string | null; name: string;
  start_date: string | null; end_date: string | null; is_current: boolean;
  is_complete: boolean; sort_order: number;
};

export type Round = {
  id: string; season_slug: string | null; competition_slug: string | null;
  name: string; slug: string; round_type: string; sort_order: number;
  num_teams: number | null; round_config: any;
};

export type Fixture = {
  id: string; key: string | null; season_slug: string | null; round_slug: string | null;
  competition_slug: string | null; home_team_code: string | null; away_team_code: string | null;
  bracket_position: number | null; group_name: string | null; matchday: number | null;
  leg: number; scheduled_date: string | null; venue: string | null; sort_order: number;
};

export type OfficialResult = {
  id: string; fixture_key: string | null; home_score: number | null; away_score: number | null;
  status: string; winner_team_code: string | null; is_extra_time: boolean;
  is_penalties: boolean; penalties_home: number | null; penalties_away: number | null;
  notes: string | null; source: string | null; verified: boolean;
};

export type Team = {
  id: string; code: string; name: string; short_name: string | null;
  slug: string | null; country: string | null; logo_url: string | null;
  primary_color: string | null; secondary_color: string | null;
};

// ── Query helpers ──
export async function fetchCompetitions(): Promise<Competition[]> {
  const { data, error } = await db.from<Competition[]>("competitions")
    .select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchSeasons(competitionSlug: string): Promise<Season[]> {
  const { data, error } = await db.from<Season[]>("seasons")
    .select("*").eq("competition_slug", competitionSlug).order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchRounds(seasonSlug: string): Promise<Round[]> {
  const { data, error } = await db.from<Round[]>("rounds")
    .select("*").eq("season_slug", seasonSlug).order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchFixtures(seasonSlug: string): Promise<Fixture[]> {
  const { data, error } = await db.from<Fixture[]>("fixtures")
    .select("*").eq("season_slug", seasonSlug).order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchOfficialResults(seasonSlug: string): Promise<OfficialResult[]> {
  const { data, error } = await db.from<OfficialResult[]>("official_results")
    .select("fixture_key,home_score,away_score,status,winner_team_code,is_extra_time,is_penalties,penalties_home,penalties_away,notes,source,verified")
    .like("fixture_key", `${seasonSlug}|%`);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await db.from<Team[]>("teams").select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Build a lookup map of fixture_key → official_result for overlay rendering
export function resultsByFixtureKey(results: OfficialResult[]): Record<string, OfficialResult> {
  const map: Record<string, OfficialResult> = {};
  for (const r of results) {
    if (r.fixture_key) map[r.fixture_key] = r;
  }
  return map;
}
