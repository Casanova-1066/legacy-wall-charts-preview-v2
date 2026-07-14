import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import type {
  Competition, Season, Fixture, Team, WallChart,
} from "@/types/tournament";

type DBCompetition = {
  id: string; slug: string; name: string; type: string; region: string | null;
  logo_url: string | null; is_active: boolean; sort_order: number; featured_order: number | null;
};
type DBSeason = {
  id: string; slug: string; competition_slug: string | null; name: string;
  start_date: string | null; end_date: string | null; is_current: boolean; is_complete: boolean; sort_order: number;
};
type DBRound = {
  id: string; season_slug: string | null; name: string; slug: string;
  round_type: string; sort_order: number; num_teams: number | null;
};
type DBFixture = {
  id: string; key: string | null; season_slug: string | null; round_slug: string | null;
  home_team_code: string | null; away_team_code: string | null; bracket_position: number | null;
  matchday: number | null; leg: number; scheduled_date: string | null; venue: string | null; sort_order: number;
};
type DBResult = {
  fixture_key: string | null; home_score: number | null; away_score: number | null;
  status: string; winner_team_code: string | null; is_extra_time: boolean; is_penalties: boolean;
  penalties_home: number | null; penalties_away: number | null; source: string | null; verified: boolean; notes: string | null;
};
type DBOverride = {
  fixture_key: string | null; chart_id: string | null; home_score: number | null; away_score: number | null;
  winner_team_code: string | null; notes: string | null;
};
type DBTeam = {
  id: string; code: string; name: string; short_name: string | null;
  country: string | null; logo_url: string | null;
};

function mapCompetition(c: DBCompetition): Competition {
  return {
    id: c.id, slug: c.slug, name: c.name,
    type: c.type as Competition["type"], country: c.region ?? "",
    logoUrl: c.logo_url, isActive: c.is_active,
    displayOrder: c.sort_order ?? c.featured_order ?? 0,
  };
}
function mapSeason(s: DBSeason): Season {
  return {
    id: s.id, slug: s.slug, competitionId: s.competition_slug ?? "",
    name: s.name, startDate: s.start_date, endDate: s.end_date,
    isActive: s.is_current, format: "group_knockout",
  };
}
function mapTeam(t: DBTeam): Team {
  return { id: t.id, code: t.code, name: t.name, shortName: t.short_name, logoUrl: t.logo_url, country: t.country ?? "" };
}

export function useCompetitions(): Competition[] {
  const { data } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data, error } = await db.from<DBCompetition[]>("competitions").select("*").order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapCompetition);
    },
  });
  return data ?? [];
}

export function useCompetition(idOrSlug: string | undefined): (Competition & { seasons: Season[] }) | null {
  const { data: comp } = useQuery({
    queryKey: ["competition", idOrSlug],
    queryFn: async () => {
      const { data } = await db.from<DBCompetition>("competitions").select("*").eq("slug", idOrSlug).single();
      return data ? mapCompetition(data) : null;
    },
    enabled: !!idOrSlug,
  });
  const { data: seasons } = useQuery({
    queryKey: ["seasons", idOrSlug],
    queryFn: async () => {
      const { data, error } = await db.from<DBSeason[]>("seasons").select("*").eq("competition_slug", idOrSlug).order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapSeason);
    },
    enabled: !!idOrSlug,
  });
  if (!comp) return null;
  return { ...comp, seasons: seasons ?? [] };
}

export function useSeasons(competitionSlug: string | undefined): Season[] {
  const { data } = useQuery({
    queryKey: ["seasons", competitionSlug],
    queryFn: async () => {
      const { data, error } = await db.from<DBSeason[]>("seasons").select("*").eq("competition_slug", competitionSlug).order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapSeason);
    },
    enabled: !!competitionSlug,
  });
  return data ?? [];
}

type RoundWithFixtures = import("@/types/tournament").Round & { fixtures: Fixture[] };

export function useSeason(
  idOrSlug: string | undefined,
  options?: { chartId?: string; autoFillEnabled?: boolean },
): (Season & { rounds: RoundWithFixtures[]; teams: Team[] }) | null {
  const { data: season } = useQuery({
    queryKey: ["season", idOrSlug],
    queryFn: async () => {
      const { data } = await db.from<DBSeason>("seasons").select("*").eq("slug", idOrSlug).single();
      return data ? mapSeason(data) : null;
    },
    enabled: !!idOrSlug,
  });
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data } = await db.from<DBTeam[]>("teams").select("*");
      return (data ?? []).map(mapTeam);
    },
  });
  const { data: rounds } = useQuery({
    queryKey: ["rounds", idOrSlug],
    queryFn: async () => {
      const { data, error } = await db.from<DBRound[]>("rounds").select("*").eq("season_slug", idOrSlug).order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!idOrSlug,
  });
  const { data: fixtures } = useQuery({
    queryKey: ["fixtures", idOrSlug],
    queryFn: async () => {
      const { data, error } = await db.from<DBFixture[]>("fixtures").select("*").eq("season_slug", idOrSlug).order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!idOrSlug,
  });
  const officialResultsAllowed = options?.autoFillEnabled === true;
  const { data: results } = useQuery({
    queryKey: ["official_results", idOrSlug, officialResultsAllowed],
    queryFn: async () => {
      const { data, error } = await db.from<DBResult[]>("official_results").select("*").like("fixture_key", `${idOrSlug}|%`);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!idOrSlug && officialResultsAllowed,
  });
  const { data: overrides } = useQuery({
    queryKey: ["user_overrides", options?.chartId],
    queryFn: async () => {
      const { data, error } = await db.from<DBOverride[]>("user_overrides").select("*").eq("chart_id", options!.chartId!);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!options?.chartId && options?.autoFillEnabled === false,
  });
  if (!season) return null;
  const resultMap: Record<string, DBResult> = {};
  (results ?? []).forEach((r) => { if (r.fixture_key) resultMap[r.fixture_key] = r; });
  const overrideMap: Record<string, DBOverride> = {};
  (overrides ?? []).forEach((r) => { if (r.fixture_key) overrideMap[r.fixture_key] = r; });
  const roundsWithFixtures: RoundWithFixtures[] = (rounds ?? []).map((r) => {
    const rFixtures: Fixture[] = (fixtures ?? []).filter((f) => f.round_slug === r.slug).map((f) => {
      const res = f.key ? resultMap[f.key] : undefined;
      const override = f.key ? overrideMap[f.key] : undefined;
      const useOverride = !officialResultsAllowed && !!override;
      const homeScore = useOverride ? override.home_score : officialResultsAllowed ? res?.home_score : null;
      const awayScore = useOverride ? override.away_score : officialResultsAllowed ? res?.away_score : null;
      const resultMode: Fixture["resultMode"] = useOverride
        ? "manual"
        : !officialResultsAllowed
          ? "pending"
          : res?.source === "data-import-pending"
            ? "needs-data"
            : homeScore != null && awayScore != null
              ? "official"
              : "pending";
      return {
        id: f.id, roundId: f.round_slug ?? "", seasonId: f.season_slug ?? "",
        homeTeamId: "", awayTeamId: "",
        homeTeamCode: f.home_team_code, awayTeamCode: f.away_team_code,
        homeScore: homeScore ?? null, awayScore: awayScore ?? null,
        extraTimeHome: null, extraTimeAway: null,
        penaltiesHome: useOverride || !officialResultsAllowed ? null : res?.is_penalties ? res.penalties_home : null,
        penaltiesAway: useOverride || !officialResultsAllowed ? null : res?.is_penalties ? res.penalties_away : null,
        date: f.scheduled_date, venue: f.venue,
        status: (homeScore != null && awayScore != null ? "finished" : officialResultsAllowed && res?.status === "completed" ? "finished" : "scheduled") as Fixture["status"],
        matchday: f.matchday ?? 0, notes: useOverride ? override.notes : res?.notes ?? null,
        resultSource: useOverride ? "manual override" : officialResultsAllowed ? res?.source ?? null : null,
        verified: useOverride ? true : officialResultsAllowed ? Boolean(res?.verified) : false,
        resultMode,
        fixtureKey: f.key,
      };
    });
    return {
      id: r.id, seasonId: r.season_slug ?? "", roundNumber: r.sort_order,
      name: r.name, type: r.round_type as import("@/types/tournament").Round["type"],
      displayOrder: r.sort_order, fixtures: rFixtures,
    };
  });
  return { ...season, rounds: roundsWithFixtures, teams: teams ?? [] };
}

export function useFixtures(seasonSlug: string | undefined): Fixture[] {
  const { data } = useQuery({
    queryKey: ["fixtures-only", seasonSlug],
    queryFn: async () => {
      const { data, error } = await db.from<DBFixture[]>("fixtures").select("*").eq("season_slug", seasonSlug).order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!seasonSlug,
  });
  return (data ?? []).map((f) => ({
    id: f.id, roundId: f.round_slug ?? "", seasonId: f.season_slug ?? "",
    homeTeamId: "", awayTeamId: "", homeTeamCode: f.home_team_code, awayTeamCode: f.away_team_code,
    homeScore: null, awayScore: null, extraTimeHome: null, extraTimeAway: null,
    penaltiesHome: null, penaltiesAway: null, date: f.scheduled_date, venue: f.venue,
    status: "scheduled" as Fixture["status"], matchday: f.matchday ?? 0, notes: null,
  }));
}

export function useTeams(): Team[] {
  const { data } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data } = await db.from<DBTeam[]>("teams").select("*");
      return (data ?? []).map(mapTeam);
    },
  });
  return data ?? [];
}

type DBWallChart = {
  id: string; name: string; owner_id: string; season_slug: string | null;
  competition_slug: string | null; created_at: string; updated_at: string;
  watermark_enabled: boolean; auto_fill_enabled: boolean;
};

export function useWallCharts(userId?: string): WallChart[] {
  const { data } = useQuery({
    queryKey: ["wall-charts", userId],
    queryFn: async () => {
      const { data, error } = await db.from<DBWallChart[]>("wall_charts").select("*").order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((c) => ({
        id: c.id, name: c.name, userId: c.owner_id, seasonId: c.season_slug ?? "",
        templateId: null, theme: "stadium-lights", customizations: {},
        createdAt: c.created_at, updatedAt: c.updated_at,
      }));
    },
    enabled: !!userId,
  });
  return data ?? [];
}

export function useWallChart(id: string | undefined): (WallChart & { season?: Season; competition?: Competition }) | null {
  const { data } = useQuery({
    queryKey: ["wall-chart", id],
    queryFn: async () => {
      const { data } = await db.from<DBWallChart>("wall_charts").select("*").eq("id", id).single();
      if (!data) return null;
      return {
        id: data.id, name: data.name, userId: data.owner_id,
        seasonId: data.season_slug ?? "", templateId: null,
        theme: "stadium-lights", customizations: {},
        createdAt: data.created_at, updatedAt: data.updated_at,
      } as WallChart;
    },
    enabled: !!id,
  });
  return data ?? null;
}

export function useSearchTournaments(query: string): Competition[] {
  const all = useCompetitions();
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
}

// Stubs for engine-based hooks (not used by routes that fetch from Neon)
export function useTournamentEngine() { return null; }
export function useStandings(): any[] { return []; }
export function useKnockoutBracket(): null { return null; }
export function useWallChartData(): null { return null; }
export function useWallChartRenderable(): null { return null; }
export function useWallChartTemplates(): any[] { return []; }
