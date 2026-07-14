import type {
  Competition,
  CompetitionFilters,
  Season,
  Round,
  Fixture,
  Team,
  Standing,
  KnockoutBracket,
  KnockoutMatch,
  WallChartData,
  WallChartOptions,
  WallChartTemplate,
  WallChart,
} from "@/types/tournament";
import { getStore } from "@/lib/data/dataStore";

type StoreSnapshot = ReturnType<typeof getStore>;

export class TournamentEngine {
  private getState: () => StoreSnapshot;

  constructor(getStateOverride?: () => StoreSnapshot) {
    this.getState = getStateOverride ?? getStore;
  }

  getCompetitions(filters?: CompetitionFilters): Competition[] {
    let list = this.getState().competitions;
    if (!filters) return list;
    if (filters.type) list = list.filter((c) => c.type === filters.type);
    if (filters.country) list = list.filter((c) => c.country.toLowerCase() === filters.country!.toLowerCase());
    if (filters.isActive !== undefined) list = list.filter((c) => c.isActive === filters.isActive);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getCompetition(idOrSlug: string): (Competition & { seasons: Season[] }) | null {
    const s = this.getState();
    const comp = s.competitions.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (!comp) return null;
    const seasons = s.seasons
      .filter((se) => se.competitionId === comp.id)
      .sort((a, b) => b.name.localeCompare(a.name));
    return { ...comp, seasons };
  }

  getSeasons(competitionId: string): Season[] {
    const s = this.getState();
    return s.seasons.filter((se) => se.competitionId === competitionId);
  }

  getSeason(idOrSlug: string): (Season & { rounds: (Round & { fixtures: Fixture[] })[]; teams: Team[] }) | null {
    const s = this.getState();
    const season = s.seasons.find((se) => se.id === idOrSlug || se.slug === idOrSlug);
    if (!season) return null;
    const rounds = s.rounds
      .filter((r) => r.seasonId === season.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((r) => ({
        ...r,
        fixtures: s.fixtures.filter((f) => f.roundId === r.id),
      }));
    const teamIds = new Set<string>();
    s.fixtures
      .filter((f) => f.seasonId === season.id)
      .forEach((f) => {
        if (f.homeTeamId) teamIds.add(f.homeTeamId);
        if (f.awayTeamId) teamIds.add(f.awayTeamId);
      });
    const teams = s.teams.filter((t) => teamIds.has(t.id));
    return { ...season, rounds, teams };
  }

  getRounds(seasonId: string): Round[] {
    const s = this.getState();
    return s.rounds.filter((r) => r.seasonId === seasonId).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getFixtures(seasonId: string, roundId?: string): Fixture[] {
    const s = this.getState();
    let list = s.fixtures.filter((f) => f.seasonId === seasonId);
    if (roundId) list = list.filter((f) => f.roundId === roundId);
    return list;
  }

  getTeams(): Team[] {
    return this.getState().teams;
  }

  getTeamByCode(code: string): Team | undefined {
    return this.getState().teams.find((t) => t.code === code);
  }

  getStandings(seasonId: string): Standing[] {
    const s = this.getState();
    const fixtures = s.fixtures.filter((f) => f.seasonId === seasonId && f.status === "finished");
    const season = s.seasons.find((se) => se.id === seasonId);

    if (!season) return [];

    const map = new Map<string, Standing>();

    for (const f of fixtures) {
      if (f.homeScore == null || f.awayScore == null) continue;

      const home = this.ensureTeamInMap(map, f, true);
      const away = this.ensureTeamInMap(map, f, false);

      home.played++;
      away.played++;
      home.goalsFor += f.homeScore;
      home.goalsAgainst += f.awayScore;
      away.goalsFor += f.awayScore;
      away.goalsAgainst += f.homeScore;

      if (f.homeScore > f.awayScore) {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (f.homeScore < f.awayScore) {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
      }
    }

    for (const standing of map.values()) {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
    }

    return [...map.values()].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    }).map((st, i) => ({ ...st, position: i + 1 }));
  }

  private ensureTeamInMap(map: Map<string, Standing>, f: Fixture, isHome: boolean): Standing {
    const teamId = isHome ? f.homeTeamId : f.awayTeamId;
    const teamCode = (isHome ? f.homeTeamCode : f.awayTeamCode) ?? "";
    if (!map.has(teamId)) {
      const team = this.getState().teams.find((t) => t.id === teamId || t.code === teamCode);
      map.set(teamId, {
        position: 0,
        teamId,
        teamCode,
        teamName: team?.shortName ?? team?.name ?? teamCode,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }
    return map.get(teamId)!;
  }

  getKnockoutBracket(seasonId: string): KnockoutBracket | null {
    const s = this.getState();
    const rounds = s.rounds
      .filter((r) => r.seasonId === seasonId && (r.type === "knockout" || r.type === "final"))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    if (rounds.length === 0) return null;

    const bracketRounds = rounds.map((r) => {
      const fixtures = s.fixtures.filter((f) => f.roundId === r.id);
      const matches: KnockoutMatch[] = fixtures.map((f) => {
        const homeT = s.teams.find((t) => t.id === f.homeTeamId || t.code === f.homeTeamCode);
        const awayT = s.teams.find((t) => t.id === f.awayTeamId || t.code === f.awayTeamCode);
        const homeName = homeT?.shortName ?? homeT?.name ?? f.homeTeamCode ?? "TBD";
        const awayName = awayT?.shortName ?? awayT?.name ?? f.awayTeamCode ?? "TBD";

        let winner: string | null = null;
        if (f.homeScore != null && f.awayScore != null) {
          if (f.penaltiesHome != null && f.penaltiesAway != null) {
            winner = f.penaltiesHome > f.penaltiesAway ? homeName : awayName;
          } else {
            winner = f.homeScore > f.awayScore ? homeName : f.homeScore < f.awayScore ? awayName : null;
          }
        }

        return {
          id: f.id,
          round: r.name,
          roundNumber: r.roundNumber,
          homeTeamCode: f.homeTeamCode,
          awayTeamCode: f.awayTeamCode,
          homeTeamName: homeName,
          awayTeamName: awayName,
          homeScore: f.homeScore,
          awayScore: f.awayScore,
          date: f.date,
          venue: f.venue,
          status: f.status,
          winner,
        };
      });
      return { name: r.name, roundNumber: r.roundNumber, matches };
    });

    return { rounds: bracketRounds };
  }

  generateWallChartData(seasonId: string, options?: WallChartOptions): WallChartData | null {
    const s = this.getState();
    const season = s.seasons.find((se) => se.id === seasonId || se.slug === seasonId);
    if (!season) return null;

    const competition = s.competitions.find((c) => c.id === season.competitionId);
    if (!competition) return null;

    const layout = options?.layout ?? (season.format as WallChartOptions["layout"]) ?? "league";

    const allRounds = s.rounds
      .filter((r) => r.seasonId === season.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((r) => ({
        name: r.name,
        roundNumber: r.roundNumber,
        fixtures: s.fixtures.filter((f) => f.roundId === r.id),
      }));

    const teamIds = new Set<string>();
    s.fixtures
      .filter((f) => f.seasonId === season.id)
      .forEach((f) => {
        if (f.homeTeamId) teamIds.add(f.homeTeamId);
        if (f.awayTeamId) teamIds.add(f.awayTeamId);
      });
    const teams = s.teams.filter((t) => teamIds.has(t.id));

    const result: WallChartData = {
      competitionName: competition.name,
      seasonName: season.name,
      type: competition.type,
      rounds: allRounds,
      teams,
    };

    if (layout === "league") {
      result.standings = this.getStandings(season.id);
    } else if (layout === "knockout" || layout === "group_knockout") {
      result.knockoutBracket = this.getKnockoutBracket(season.id) ?? undefined;
    }

    if (layout === "group_knockout") {
      result.standings = this.getStandings(season.id);
    }

    return result;
  }

  searchTournaments(query: string): Competition[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const s = this.getState();
    return s.competitions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        s.seasons.some((se) => se.competitionId === c.id && se.name.toLowerCase().includes(q)),
    );
  }

  getWallChartTemplates(): WallChartTemplate[] {
    return this.getState().wallChartTemplates;
  }

  getWallCharts(userId?: string): WallChart[] {
    const list = this.getState().wallCharts;
    if (userId) return list.filter((c) => c.userId === userId);
    return list;
  }

  getWallChart(id: string): (WallChart & { season?: Season; competition?: Competition }) | null {
    const s = this.getState();
    const chart = s.wallCharts.find((c) => c.id === id);
    if (!chart) return null;
    const season = s.seasons.find((se) => se.id === chart.seasonId);
    let competition: Competition | undefined;
    if (season) {
      competition = s.competitions.find((c) => c.id === season.competitionId);
    }
    return { ...chart, season, competition };
  }
}

export const tournamentEngine = new TournamentEngine();
