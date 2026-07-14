import type {
  Competition,
  Season,
  Round,
  Fixture,
  Team,
  WallChartTemplate,
} from "@/types/tournament";

function uid(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(3, 4)}${hex.slice(4, 7)}-${hex}000000`.slice(0, 36);
}

export const TEAMS: Team[] = [
  // Premier League
  { id: uid("team-arsenal"), code: "ARS", name: "Arsenal", shortName: "Arsenal", logoUrl: null, country: "England" },
  { id: uid("team-aston-villa"), code: "AVL", name: "Aston Villa", shortName: "Aston Villa", logoUrl: null, country: "England" },
  { id: uid("team-bournemouth"), code: "BOU", name: "AFC Bournemouth", shortName: "Bournemouth", logoUrl: null, country: "England" },
  { id: uid("team-brentford"), code: "BRE", name: "Brentford", shortName: "Brentford", logoUrl: null, country: "England" },
  { id: uid("team-brighton"), code: "BHA", name: "Brighton & Hove Albion", shortName: "Brighton", logoUrl: null, country: "England" },
  { id: uid("team-chelsea"), code: "CHE", name: "Chelsea", shortName: "Chelsea", logoUrl: null, country: "England" },
  { id: uid("team-crystal-palace"), code: "CRY", name: "Crystal Palace", shortName: "Crystal Palace", logoUrl: null, country: "England" },
  { id: uid("team-everton"), code: "EVE", name: "Everton", shortName: "Everton", logoUrl: null, country: "England" },
  { id: uid("team-fulham"), code: "FUL", name: "Fulham", shortName: "Fulham", logoUrl: null, country: "England" },
  { id: uid("team-ipswich"), code: "IPS", name: "Ipswich Town", shortName: "Ipswich", logoUrl: null, country: "England" },
  { id: uid("team-leicester"), code: "LEI", name: "Leicester City", shortName: "Leicester", logoUrl: null, country: "England" },
  { id: uid("team-liverpool"), code: "LIV", name: "Liverpool", shortName: "Liverpool", logoUrl: null, country: "England" },
  { id: uid("team-man-city"), code: "MCI", name: "Manchester City", shortName: "Man City", logoUrl: null, country: "England" },
  { id: uid("team-man-utd"), code: "MUN", name: "Manchester United", shortName: "Man United", logoUrl: null, country: "England" },
  { id: uid("team-newcastle"), code: "NEW", name: "Newcastle United", shortName: "Newcastle", logoUrl: null, country: "England" },
  { id: uid("team-forest"), code: "NFO", name: "Nottingham Forest", shortName: "Nott'm Forest", logoUrl: null, country: "England" },
  { id: uid("team-southampton"), code: "SOU", name: "Southampton", shortName: "Southampton", logoUrl: null, country: "England" },
  { id: uid("team-tottenham"), code: "TOT", name: "Tottenham Hotspur", shortName: "Tottenham", logoUrl: null, country: "England" },
  { id: uid("team-west-ham"), code: "WHU", name: "West Ham United", shortName: "West Ham", logoUrl: null, country: "England" },
  { id: uid("team-wolves"), code: "WOL", name: "Wolverhampton Wanderers", shortName: "Wolves", logoUrl: null, country: "England" },
  // La Liga
  { id: uid("team-real-madrid"), code: "RMA", name: "Real Madrid", shortName: "Real Madrid", logoUrl: null, country: "Spain" },
  { id: uid("team-barcelona"), code: "BAR", name: "FC Barcelona", shortName: "Barcelona", logoUrl: null, country: "Spain" },
  { id: uid("team-atletico"), code: "ATM", name: "Atletico Madrid", shortName: "Atletico", logoUrl: null, country: "Spain" },
  { id: uid("team-girona"), code: "GIR", name: "Girona FC", shortName: "Girona", logoUrl: null, country: "Spain" },
  { id: uid("team-athletic"), code: "ATH", name: "Athletic Club", shortName: "Athletic", logoUrl: null, country: "Spain" },
  { id: uid("team-real-sociedad"), code: "RSO", name: "Real Sociedad", shortName: "Real Sociedad", logoUrl: null, country: "Spain" },
  { id: uid("team-betis"), code: "BET", name: "Real Betis", shortName: "Betis", logoUrl: null, country: "Spain" },
  { id: uid("team-villarreal"), code: "VIL", name: "Villarreal CF", shortName: "Villarreal", logoUrl: null, country: "Spain" },
  { id: uid("team-valencia"), code: "VAL", name: "Valencia CF", shortName: "Valencia", logoUrl: null, country: "Spain" },
  { id: uid("team-sevilla"), code: "SEV", name: "Sevilla FC", shortName: "Sevilla", logoUrl: null, country: "Spain" },
  { id: uid("team-alaves"), code: "ALA", name: "Deportivo Alaves", shortName: "Alaves", logoUrl: null, country: "Spain" },
  { id: uid("team-las-palmas"), code: "LPA", name: "UD Las Palmas", shortName: "Las Palmas", logoUrl: null, country: "Spain" },
  { id: uid("team-osasuna"), code: "OSA", name: "CA Osasuna", shortName: "Osasuna", logoUrl: null, country: "Spain" },
  { id: uid("team-mallorca"), code: "MAL", name: "RCD Mallorca", shortName: "Mallorca", logoUrl: null, country: "Spain" },
  { id: uid("team-celta-vigo"), code: "CEL", name: "Celta de Vigo", shortName: "Celta Vigo", logoUrl: null, country: "Spain" },
  { id: uid("team-rayo"), code: "RAY", name: "Rayo Vallecano", shortName: "Rayo", logoUrl: null, country: "Spain" },
  { id: uid("team-getafe"), code: "GET", name: "Getafe CF", shortName: "Getafe", logoUrl: null, country: "Spain" },
  { id: uid("team-espanyol"), code: "ESP", name: "RCD Espanyol", shortName: "Espanyol", logoUrl: null, country: "Spain" },
  { id: uid("team-leganes"), code: "LEG", name: "CD Leganes", shortName: "Leganes", logoUrl: null, country: "Spain" },
  { id: uid("team-valladolid"), code: "VLL", name: "Real Valladolid", shortName: "Valladolid", logoUrl: null, country: "Spain" },
  // Bundesliga
  { id: uid("team-bayern"), code: "BAY", name: "Bayern Munich", shortName: "Bayern", logoUrl: null, country: "Germany" },
  { id: uid("team-dortmund"), code: "BVB", name: "Borussia Dortmund", shortName: "Dortmund", logoUrl: null, country: "Germany" },
  { id: uid("team-leipzig"), code: "RBL", name: "RB Leipzig", shortName: "Leipzig", logoUrl: null, country: "Germany" },
  { id: uid("team-leverkusen"), code: "B04", name: "Bayer Leverkusen", shortName: "Leverkusen", logoUrl: null, country: "Germany" },
  { id: uid("team-stuttgart"), code: "VFB", name: "VfB Stuttgart", shortName: "Stuttgart", logoUrl: null, country: "Germany" },
  { id: uid("team-frankfurt"), code: "SGE", name: "Eintracht Frankfurt", shortName: "Frankfurt", logoUrl: null, country: "Germany" },
  { id: uid("team-hoffenheim"), code: "TSG", name: "TSG Hoffenheim", shortName: "Hoffenheim", logoUrl: null, country: "Germany" },
  { id: uid("team-freiburg"), code: "SCF", name: "SC Freiburg", shortName: "Freiburg", logoUrl: null, country: "Germany" },
  { id: uid("team-wolfsburg"), code: "WOB", name: "VfL Wolfsburg", shortName: "Wolfsburg", logoUrl: null, country: "Germany" },
  { id: uid("team-mgladbach"), code: "BMG", name: "Borussia Monchengladbach", shortName: "M'gladbach", logoUrl: null, country: "Germany" },
  { id: uid("team-mainz"), code: "M05", name: "1. FSV Mainz 05", shortName: "Mainz", logoUrl: null, country: "Germany" },
  { id: uid("team-werder"), code: "SVW", name: "Werder Bremen", shortName: "Bremen", logoUrl: null, country: "Germany" },
  { id: uid("team-augsburg"), code: "FCA", name: "FC Augsburg", shortName: "Augsburg", logoUrl: null, country: "Germany" },
  { id: uid("team-union-berlin"), code: "FCU", name: "1. FC Union Berlin", shortName: "Union Berlin", logoUrl: null, country: "Germany" },
  { id: uid("team-bochum"), code: "BOC", name: "VfL Bochum", shortName: "Bochum", logoUrl: null, country: "Germany" },
  { id: uid("team-st-pauli"), code: "STP", name: "FC St. Pauli", shortName: "St. Pauli", logoUrl: null, country: "Germany" },
  { id: uid("team-heidenheim"), code: "HDH", name: "1. FC Heidenheim", shortName: "Heidenheim", logoUrl: null, country: "Germany" },
  { id: uid("team-holstein-kiel"), code: "HKI", name: "Holstein Kiel", shortName: "Holstein Kiel", logoUrl: null, country: "Germany" },
  // Serie A
  { id: uid("team-inter"), code: "INT", name: "Inter Milan", shortName: "Inter", logoUrl: null, country: "Italy" },
  { id: uid("team-ac-milan"), code: "ACM", name: "AC Milan", shortName: "AC Milan", logoUrl: null, country: "Italy" },
  { id: uid("team-juventus"), code: "JUV", name: "Juventus", shortName: "Juventus", logoUrl: null, country: "Italy" },
  { id: uid("team-napoli"), code: "NAP", name: "SSC Napoli", shortName: "Napoli", logoUrl: null, country: "Italy" },
  { id: uid("team-atalanta"), code: "ATA", name: "Atalanta BC", shortName: "Atalanta", logoUrl: null, country: "Italy" },
  { id: uid("team-roma"), code: "ROM", name: "AS Roma", shortName: "Roma", logoUrl: null, country: "Italy" },
  { id: uid("team-lazio"), code: "LAZ", name: "SS Lazio", shortName: "Lazio", logoUrl: null, country: "Italy" },
  { id: uid("team-fiorentina"), code: "FIO", name: "ACF Fiorentina", shortName: "Fiorentina", logoUrl: null, country: "Italy" },
  { id: uid("team-torino"), code: "TOR", name: "Torino FC", shortName: "Torino", logoUrl: null, country: "Italy" },
  { id: uid("team-bologna"), code: "BOL", name: "Bologna FC", shortName: "Bologna", logoUrl: null, country: "Italy" },
  { id: uid("team-genoa"), code: "GEN", name: "Genoa CFC", shortName: "Genoa", logoUrl: null, country: "Italy" },
  { id: uid("team-monza"), code: "MON", name: "AC Monza", shortName: "Monza", logoUrl: null, country: "Italy" },
  { id: uid("team-udinese"), code: "UDI", name: "Udinese Calcio", shortName: "Udinese", logoUrl: null, country: "Italy" },
  { id: uid("team-lecce"), code: "LEC", name: "US Lecce", shortName: "Lecce", logoUrl: null, country: "Italy" },
  { id: uid("team-cagliari"), code: "CAG", name: "Cagliari Calcio", shortName: "Cagliari", logoUrl: null, country: "Italy" },
  { id: uid("team-empoli"), code: "EMP", name: "Empoli FC", shortName: "Empoli", logoUrl: null, country: "Italy" },
  { id: uid("team-hellas-verona"), code: "VER", name: "Hellas Verona", shortName: "Verona", logoUrl: null, country: "Italy" },
  { id: uid("team-parma"), code: "PAR", name: "Parma Calcio", shortName: "Parma", logoUrl: null, country: "Italy" },
  { id: uid("team-como"), code: "COM", name: "Como 1907", shortName: "Como", logoUrl: null, country: "Italy" },
  { id: uid("team-venezia"), code: "VEN", name: "Venezia FC", shortName: "Venezia", logoUrl: null, country: "Italy" },
  // Ligue 1
  { id: uid("team-psg"), code: "PSG", name: "Paris Saint-Germain", shortName: "PSG", logoUrl: null, country: "France" },
  { id: uid("team-monaco"), code: "ASM", name: "AS Monaco", shortName: "Monaco", logoUrl: null, country: "France" },
  { id: uid("team-marseille"), code: "OM", name: "Olympique Marseille", shortName: "Marseille", logoUrl: null, country: "France" },
  { id: uid("team-lyon"), code: "OL", name: "Olympique Lyonnais", shortName: "Lyon", logoUrl: null, country: "France" },
  { id: uid("team-lille"), code: "LIL", name: "LOSC Lille", shortName: "Lille", logoUrl: null, country: "France" },
  { id: uid("team-rennes"), code: "REN", name: "Stade Rennais", shortName: "Rennes", logoUrl: null, country: "France" },
  { id: uid("team-nice"), code: "NIC", name: "OGC Nice", shortName: "Nice", logoUrl: null, country: "France" },
  { id: uid("team-lens"), code: "RCL", name: "RC Lens", shortName: "Lens", logoUrl: null, country: "France" },
  { id: uid("team-strasbourg"), code: "RCS", name: "RC Strasbourg", shortName: "Strasbourg", logoUrl: null, country: "France" },
  { id: uid("team-brest"), code: "BRE", name: "Stade Brestois", shortName: "Brest", logoUrl: null, country: "France" },
  { id: uid("team-reims"), code: "SR", name: "Stade de Reims", shortName: "Reims", logoUrl: null, country: "France" },
  { id: uid("team-nantes"), code: "FCN", name: "FC Nantes", shortName: "Nantes", logoUrl: null, country: "France" },
  { id: uid("team-montpellier"), code: "MHSC", name: "Montpellier HSC", shortName: "Montpellier", logoUrl: null, country: "France" },
  { id: uid("team-toulouse"), code: "TFC", name: "Toulouse FC", shortName: "Toulouse", logoUrl: null, country: "France" },
  { id: uid("team-auxerre"), code: "AJA", name: "AJ Auxerre", shortName: "Auxerre", logoUrl: null, country: "France" },
  { id: uid("team-angers"), code: "SCO", name: "Angers SCO", shortName: "Angers", logoUrl: null, country: "France" },
  { id: uid("team-le-havre"), code: "HAC", name: "Le Havre AC", shortName: "Le Havre", logoUrl: null, country: "France" },
  { id: uid("team-st-etienne"), code: "ASSE", name: "AS Saint-Etienne", shortName: "Saint-Etienne", logoUrl: null, country: "France" },
  // Champions League notable teams
  { id: uid("team-real-madrid-ucl"), code: "RMA", name: "Real Madrid", shortName: "Real Madrid", logoUrl: null, country: "Spain" },
  { id: uid("team-barcelona-ucl"), code: "BAR", name: "FC Barcelona", shortName: "Barcelona", logoUrl: null, country: "Spain" },
  { id: uid("team-bayern-ucl"), code: "BAY", name: "Bayern Munich", shortName: "Bayern", logoUrl: null, country: "Germany" },
  { id: uid("team-liverpool-ucl"), code: "LIV", name: "Liverpool", shortName: "Liverpool", logoUrl: null, country: "England" },
  { id: uid("team-man-city-ucl"), code: "MCI", name: "Manchester City", shortName: "Man City", logoUrl: null, country: "England" },
  { id: uid("team-inter-ucl"), code: "INT", name: "Inter Milan", shortName: "Inter", logoUrl: null, country: "Italy" },
  { id: uid("team-psg-ucl"), code: "PSG", name: "Paris Saint-Germain", shortName: "PSG", logoUrl: null, country: "France" },
  // World Cup
  { id: uid("team-argentina"), code: "ARG", name: "Argentina", shortName: "Argentina", logoUrl: null, country: "Argentina" },
  { id: uid("team-france"), code: "FRA", name: "France", shortName: "France", logoUrl: null, country: "France" },
  { id: uid("team-brazil"), code: "BRA", name: "Brazil", shortName: "Brazil", logoUrl: null, country: "Brazil" },
  { id: uid("team-england"), code: "ENG", name: "England", shortName: "England", logoUrl: null, country: "England" },
  { id: uid("team-germany"), code: "GER", name: "Germany", shortName: "Germany", logoUrl: null, country: "Germany" },
  { id: uid("team-spain"), code: "ESP", name: "Spain", shortName: "Spain", logoUrl: null, country: "Spain" },
  { id: uid("team-netherlands"), code: "NED", name: "Netherlands", shortName: "Netherlands", logoUrl: null, country: "Netherlands" },
  { id: uid("team-portugal"), code: "POR", name: "Portugal", shortName: "Portugal", logoUrl: null, country: "Portugal" },
  { id: uid("team-croatia"), code: "CRO", name: "Croatia", shortName: "Croatia", logoUrl: null, country: "Croatia" },
  { id: uid("team-morocco"), code: "MAR", name: "Morocco", shortName: "Morocco", logoUrl: null, country: "Morocco" },
  { id: uid("team-japan"), code: "JPN", name: "Japan", shortName: "Japan", logoUrl: null, country: "Japan" },
  { id: uid("team-senegal"), code: "SEN", name: "Senegal", shortName: "Senegal", logoUrl: null, country: "Senegal" },
  { id: uid("team-usa"), code: "USA", name: "United States", shortName: "USA", logoUrl: null, country: "USA" },
  { id: uid("team-mexico"), code: "MEX", name: "Mexico", shortName: "Mexico", logoUrl: null, country: "Mexico" },
  { id: uid("team-belgium"), code: "BEL", name: "Belgium", shortName: "Belgium", logoUrl: null, country: "Belgium" },
  { id: uid("team-uruguay"), code: "URU", name: "Uruguay", shortName: "Uruguay", logoUrl: null, country: "Uruguay" },
];

function fixture(
  seed: string,
  roundId: string,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeCode: string,
  awayCode: string,
  homeScore: number | null,
  awayScore: number | null,
  date: string,
  venue: string,
  status: Fixture["status"] = "finished",
  matchday = 1,
): Fixture {
  return {
    id: uid(`fix-${seed}`),
    roundId,
    seasonId,
    homeTeamId,
    awayTeamId,
    homeTeamCode: homeCode,
    awayTeamCode: awayCode,
    homeScore,
    awayScore,
    extraTimeHome: null,
    extraTimeAway: null,
    penaltiesHome: null,
    penaltiesAway: null,
    date,
    venue,
    status,
    matchday,
    notes: null,
  };
}

function id(v: string) {
  return uid(v);
}

export const COMPETITIONS: Competition[] = [
  { id: id("comp-premier-league"), slug: "premier-league", name: "Premier League", type: "league", country: "England", logoUrl: null, isActive: true, displayOrder: 1 },
  { id: id("comp-la-liga"), slug: "la-liga", name: "La Liga", type: "league", country: "Spain", logoUrl: null, isActive: true, displayOrder: 2 },
  { id: id("comp-bundesliga"), slug: "bundesliga", name: "Bundesliga", type: "league", country: "Germany", logoUrl: null, isActive: true, displayOrder: 3 },
  { id: id("comp-serie-a"), slug: "serie-a", name: "Serie A", type: "league", country: "Italy", logoUrl: null, isActive: true, displayOrder: 4 },
  { id: id("comp-ligue-1"), slug: "ligue-1", name: "Ligue 1", type: "league", country: "France", logoUrl: null, isActive: true, displayOrder: 5 },
  { id: id("comp-champions-league"), slug: "champions-league", name: "UEFA Champions League", type: "cup", country: "Europe", logoUrl: null, isActive: true, displayOrder: 6 },
  { id: id("comp-world-cup"), slug: "world-cup", name: "FIFA World Cup", type: "international", country: "Global", logoUrl: null, isActive: true, displayOrder: 7 },
];

const PL_TEAMS = TEAMS.filter((t) =>
  ["ARS", "AVL", "BOU", "BRE", "BHA", "CHE", "CRY", "EVE", "FUL", "IPS", "LEI", "LIV", "MCI", "MUN", "NEW", "NFO", "SOU", "TOT", "WHU", "WOL"].includes(t.code) && t.country === "England"
);
const LL_TEAMS = dedupeByCode(TEAMS.filter((t) =>
  ["RMA", "BAR", "ATM", "GIR", "ATH", "RSO", "BET", "VIL", "VAL", "SEV", "ALA", "LPA", "OSA", "MAL", "CEL", "RAY", "GET", "ESP", "LEG", "VLL"].includes(t.code) && t.country === "Spain" && t.shortName !== "Spain"
));
const BL_TEAMS = dedupeByCode(TEAMS.filter((t) =>
  ["BAY", "BVB", "RBL", "B04", "VFB", "SGE", "TSG", "SCF", "WOB", "BMG", "M05", "SVW", "FCA", "FCU", "BOC", "STP", "HDH", "HKI"].includes(t.code) && t.country === "Germany"
));
const SA_TEAMS = dedupeByCode(TEAMS.filter((t) =>
  ["INT", "ACM", "JUV", "NAP", "ATA", "ROM", "LAZ", "FIO", "TOR", "BOL", "GEN", "MON", "UDI", "LEC", "CAG", "EMP", "VER", "PAR", "COM", "VEN"].includes(t.code) && t.country === "Italy"
));
const L1_TEAMS = dedupeByCode(TEAMS.filter((t) =>
  ["PSG", "ASM", "OM", "OL", "LIL", "REN", "NIC", "RCL", "RCS", "BRE", "SR", "FCN", "MHSC", "TFC", "AJA", "SCO", "HAC", "ASSE"].includes(t.code) && t.country === "France"
));
const ALL_TEAMS = dedupeByCode([...PL_TEAMS, ...LL_TEAMS, ...BL_TEAMS, ...SA_TEAMS, ...L1_TEAMS]);

function dedupeByCode(list: Team[]): Team[] {
  const seen = new Set<string>();
  return list.filter((t) => {
    if (seen.has(t.code)) return false;
    seen.add(t.code);
    return true;
  });
}

const engVenues = ["Emirates Stadium", "Villa Park", "Stamford Bridge", "Anfield", "Etihad Stadium", "Old Trafford", "Tottenham Hotspur Stadium", "London Stadium", "Goodison Park", "St James' Park"];
const espVenues = ["Santiago Bernabeu", "Camp Nou", "Metropolitano", "Estadi Montilivi", "San Mames", "Reale Arena", "Benito Villamarin", "La Ceramica", "Mestalla", "Ramon Sanchez Pizjuan"];
const gerVenues = ["Allianz Arena", "Signal Iduna Park", "Red Bull Arena", "BayArena", "MHPArena", "Deutsche Bank Park", "PreZero Arena", "Europa-Park Stadion", "Volkswagen Arena", "Borussia-Park"];
const itaVenues = ["San Siro", "San Siro", "Allianz Stadium", "Diego Armando Maradona", "Gewiss Stadium", "Stadio Olimpico", "Stadio Olimpico", "Artemio Franchi", "Olimpico Grande Torino", "Renato Dall'Ara"];
const fraVenues = ["Parc des Princes", "Stade Louis II", "Orange Velodrome", "Groupama Stadium", "Stade Pierre-Mauroy", "Roazhon Park", "Allianz Riviera", "Stade Bollaert-Delelis", "Stade de la Meinau", "Stade Francis-Le Ble"];

function makeLeagueMatchday(
  seasonId: string,
  roundId: string,
  teams: Team[],
  seasonSlug: string,
  venues: string[],
  md: number,
  scores: [number, number][],
): Fixture[] {
  const fixtures: Fixture[] = [];
  const half = Math.floor(teams.length / 2);
  for (let i = 0; i < half && i < 10; i++) {
    const h = teams[i];
    const a = teams[half + i];
    if (!h || !a) continue;
    const s = scores[i] ?? [0, 0] as [number, number];
    fixtures.push(
      fixture(
        `${seasonSlug}-md${md}-${i}`,
        roundId,
        seasonId,
        h.id,
        a.id,
        h.code,
        a.code,
        s[0],
        s[1],
        `2024-08-${String(9 + md * 7 + i).padStart(2, "0")}`,
        venues[i % venues.length],
        "finished",
        md,
      ),
    );
  }
  return fixtures;
}

function makeLeagueFixtures(seasonId: string, teamCodes: string[], seasonSlug: string, venues: string[]): { rounds: Round[]; fixtures: Fixture[] } {
  const rounds: Round[] = [];
  const fixtures: Fixture[] = [];
  const teams: Team[] = [];
  for (const code of teamCodes) {
    const found = ALL_TEAMS.find((t) => t.code === code);
    if (found) teams.push(found);
  }
  if (teams.length < 2) return { rounds, fixtures };

  const matchdayScores: [number, number][][] = [
    [[2, 1], [3, 0], [1, 1], [0, 2], [2, 2], [4, 1], [1, 0], [0, 0], [2, 0], [1, 3]],
    [[0, 0], [1, 2], [3, 3], [2, 0], [0, 1], [1, 1], [4, 0], [2, 1], [0, 3], [2, 2]],
    [[3, 1], [0, 0], [1, 0], [2, 1], [3, 2], [0, 4], [1, 1], [2, 0], [0, 0], [1, 2]],
    [[1, 0], [2, 2], [0, 1], [3, 0], [1, 1], [2, 3], [0, 0], [1, 1], [3, 2], [0, 1]],
    [[2, 0], [1, 1], [3, 1], [0, 0], [2, 1], [0, 2], [1, 3], [2, 2], [0, 0], [4, 1]],
  ];

  for (let md = 1; md <= 5; md++) {
    const roundId = id(`round-${seasonSlug}-md${md}`);
    rounds.push({
      id: roundId,
      seasonId,
      roundNumber: md,
      name: `Matchday ${md}`,
      type: "group",
      displayOrder: md,
    });
    fixtures.push(...makeLeagueMatchday(seasonId, roundId, teams, seasonSlug, venues, md, matchdayScores[md - 1]));
  }

  return { rounds, fixtures };
}

function makeKnockoutFixtures(seasonId: string, seasonSlug: string): { rounds: Round[]; fixtures: Fixture[] } {
  const rounds: Round[] = [];
  const fixtures: Fixture[] = [];

  const stages: { name: string; order: number; matches: { h: string; a: string; hs: number; as: number; date: string; venue: string }[] }[] = [
    {
      name: "Quarter-Final",
      order: 1,
      matches: [
        { h: "RMA", a: "BAY", hs: 2, as: 1, date: "2025-04-08", venue: "Santiago Bernabeu" },
        { h: "BAR", a: "PSG", hs: 1, as: 1, date: "2025-04-09", venue: "Camp Nou" },
        { h: "LIV", a: "INT", hs: 3, as: 0, date: "2025-04-08", venue: "Anfield" },
        { h: "MCI", a: "B04", hs: 2, as: 2, date: "2025-04-09", venue: "Etihad Stadium" },
      ],
    },
    {
      name: "Semi-Final",
      order: 2,
      matches: [
        { h: "RMA", a: "BAR", hs: 1, as: 0, date: "2025-04-29", venue: "Santiago Bernabeu" },
        { h: "LIV", a: "MCI", hs: 2, as: 1, date: "2025-04-30", venue: "Anfield" },
      ],
    },
    {
      name: "Final",
      order: 3,
      matches: [
        { h: "RMA", a: "LIV", hs: 2, as: 0, date: "2025-05-31", venue: "Allianz Arena" },
      ],
    },
  ];

  for (const stage of stages) {
    const roundId = id(`round-${seasonSlug}-${stage.name.toLowerCase().replace(" ", "-")}`);
    rounds.push({
      id: roundId,
      seasonId,
      roundNumber: stage.order,
      name: stage.name,
      type: stage.name === "Final" ? "final" : "knockout",
      displayOrder: stage.order,
    });

    for (const m of stage.matches) {
      const tH = ALL_TEAMS.find((t) => t.code === m.h);
      const tA = ALL_TEAMS.find((t) => t.code === m.a);
      if (tH && tA) {
        fixtures.push(
          fixture(
            `${seasonSlug}-${stage.name}-${m.h}-${m.a}`,
            roundId,
            seasonId,
            tH.id,
            tA.id,
            m.h,
            m.a,
            m.hs,
            m.as,
            m.date,
            m.venue,
            "finished",
            0,
          ),
        );
      }
    }
  }

  return { rounds, fixtures };
}

function makeWorldCupFixtures(seasonId: string): { rounds: Round[]; fixtures: Fixture[] } {
  const rounds: Round[] = [];
  const fixtures: Fixture[] = [];

  // Group A
  const groupA = ["ARG", "FRA", "BRA", "ENG"] as const;
  const groupAMatches: [string, string, number, number][] = [
    ["ARG", "FRA", 3, 2],
    ["BRA", "ENG", 1, 1],
    ["ARG", "BRA", 2, 0],
    ["FRA", "ENG", 2, 1],
    ["ARG", "ENG", 2, 0],
    ["FRA", "BRA", 1, 0],
  ];

  // Group stage
  const groups = ["Group A"];
  let matchIdx = 0;
  for (const gName of groups) {
    const roundId = id(`round-wc-group-a`);
    rounds.push({ id: roundId, seasonId, roundNumber: 1, name: gName, type: "group", displayOrder: 1 });

    for (const [h, a, hs, as] of groupAMatches) {
      const tH = TEAMS.find((t) => t.code === h);
      const tA = TEAMS.find((t) => t.code === a);
      if (!tH || !tA) continue;
      fixtures.push(
        fixture(`wc-${matchIdx++}`, roundId, seasonId, tH.id, tA.id, tH.code, tA.code, hs, as, "2022-11-20", "Lusail Stadium", "finished", 1),
      );
    }
  }

  // Quarter-Final
  const qfId = id("round-wc-qf");
  rounds.push({ id: qfId, seasonId, roundNumber: 2, name: "Quarter-Final", type: "knockout", displayOrder: 2 });
  const qfMatches: [string, string, number, number][] = [
    ["ARG", "ENG", 2, 1],
    ["FRA", "BRA", 2, 0],
    ["GER", "ESP", 1, 1],
    ["NED", "POR", 2, 1],
  ];
  for (const [h, a, hs, as] of qfMatches) {
    const tH = TEAMS.find((t) => t.code === h);
    const tA = TEAMS.find((t) => t.code === a);
    if (tH && tA) {
      fixtures.push(fixture(`wc-qf-${h}-${a}`, qfId, seasonId, tH.id, tA.id, tH.code, tA.code, hs, as, "2022-12-09", "Education City Stadium", "finished", 0));
    }
  }

  // Semi-Final
  const sfId = id("round-wc-sf");
  rounds.push({ id: sfId, seasonId, roundNumber: 3, name: "Semi-Final", type: "knockout", displayOrder: 3 });
  const sfMatches: [string, string, number, number][] = [
    ["ARG", "GER", 3, 0],
    ["FRA", "NED", 2, 0],
  ];
  for (const [h, a, hs, as] of sfMatches) {
    const tH = TEAMS.find((t) => t.code === h);
    const tA = TEAMS.find((t) => t.code === a);
    if (tH && tA) {
      fixtures.push(fixture(`wc-sf-${h}-${a}`, sfId, seasonId, tH.id, tA.id, tH.code, tA.code, hs, as, "2022-12-13", "Lusail Stadium", "finished", 0));
    }
  }

  // Final
  const fId = id("round-wc-final");
  rounds.push({ id: fId, seasonId, roundNumber: 4, name: "Final", type: "final", displayOrder: 4 });
  const tH = TEAMS.find((t) => t.code === "ARG");
  const tA = TEAMS.find((t) => t.code === "FRA");
  if (tH && tA) {
    fixtures.push(
      fixture("wc-final", fId, seasonId, tH.id, tA.id, "ARG", "FRA", 3, 3, "2022-12-18", "Lusail Stadium", "finished", 0),
    );
    // Set penalty shootout on Final manually
    const finalFix = fixtures[fixtures.length - 1];
    finalFix.penaltiesHome = 4;
    finalFix.penaltiesAway = 2;
  }

  return { rounds, fixtures };
}

export const SEASONS: Season[] = [
  { id: id("season-pl-2425"), competitionId: id("comp-premier-league"), slug: "premier-league-2024-25", name: "2024-25", startDate: "2024-08-16", endDate: "2025-05-25", isActive: true, format: "league" },
  { id: id("season-ll-2425"), competitionId: id("comp-la-liga"), slug: "la-liga-2024-25", name: "2024-25", startDate: "2024-08-15", endDate: "2025-05-25", isActive: true, format: "league" },
  { id: id("season-bl-2425"), competitionId: id("comp-bundesliga"), slug: "bundesliga-2024-25", name: "2024-25", startDate: "2024-08-23", endDate: "2025-05-17", isActive: true, format: "league" },
  { id: id("season-sa-2425"), competitionId: id("comp-serie-a"), slug: "serie-a-2024-25", name: "2024-25", startDate: "2024-08-17", endDate: "2025-06-01", isActive: true, format: "league" },
  { id: id("season-l1-2425"), competitionId: id("comp-ligue-1"), slug: "ligue-1-2024-25", name: "2024-25", startDate: "2024-08-16", endDate: "2025-05-17", isActive: true, format: "league" },
  { id: id("season-ucl-2425"), competitionId: id("comp-champions-league"), slug: "champions-league-2024-25", name: "2024-25", startDate: "2024-09-17", endDate: "2025-05-31", isActive: true, format: "knockout" },
  { id: id("season-wc-2022"), competitionId: id("comp-world-cup"), slug: "world-cup-2022", name: "2022", startDate: "2022-11-20", endDate: "2022-12-18", isActive: false, format: "group_knockout" },
];

function buildSeedData(): {
  rounds: Round[];
  fixtures: Fixture[];
} {
  const allRounds: Round[] = [];
  const allFixtures: Fixture[] = [];

  // Premier League
  {
    const { rounds, fixtures } = makeLeagueFixtures(id("season-pl-2425"), PL_TEAMS.map((t) => t.code), "pl", engVenues);
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }
  // La Liga
  {
    const { rounds, fixtures } = makeLeagueFixtures(id("season-ll-2425"), LL_TEAMS.map((t) => t.code), "ll", espVenues);
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }
  // Bundesliga
  {
    const { rounds, fixtures } = makeLeagueFixtures(id("season-bl-2425"), BL_TEAMS.map((t) => t.code), "bl", gerVenues);
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }
  // Serie A
  {
    const { rounds, fixtures } = makeLeagueFixtures(id("season-sa-2425"), SA_TEAMS.map((t) => t.code), "sa", itaVenues);
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }
  // Ligue 1
  {
    const { rounds, fixtures } = makeLeagueFixtures(id("season-l1-2425"), L1_TEAMS.map((t) => t.code), "l1", fraVenues);
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }
  // Champions League
  {
    const { rounds, fixtures } = makeKnockoutFixtures(id("season-ucl-2425"), "ucl");
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }
  // World Cup
  {
    const { rounds, fixtures } = makeWorldCupFixtures(id("season-wc-2022"));
    allRounds.push(...rounds);
    allFixtures.push(...fixtures);
  }

  return { rounds: allRounds, fixtures: allFixtures };
}

const seedData = buildSeedData();

export const ROUNDS = seedData.rounds;
export const FIXTURES = seedData.fixtures;

export const TEMPLATES: WallChartTemplate[] = [
  {
    id: id("template-league-grid"),
    name: "League Grid",
    layout: "league",
    columns: 20,
    styleDefaults: { fontSize: 12, headerBg: "#0a0a1a", rowAltBg: "#0f0f2a", textColor: "#ffffff", accentColor: "#d4a843" },
  },
  {
    id: id("template-knockout-bracket"),
    name: "Knockout Bracket",
    layout: "knockout",
    columns: 4,
    styleDefaults: { fontSize: 14, lineColor: "#d4a843", nodeBg: "#0a0a1a", textColor: "#ffffff", accentColor: "#d4a843" },
  },
  {
    id: id("template-group-knockout"),
    name: "Group + Knockout",
    layout: "group_knockout",
    columns: 8,
    styleDefaults: { fontSize: 12, headerBg: "#0a0a1a", textColor: "#ffffff", accentColor: "#d4a843" },
  },
];

export const SEED_DATA = {
  competitions: COMPETITIONS,
  seasons: SEASONS,
  rounds: ROUNDS,
  fixtures: FIXTURES,
  teams: TEAMS,
  wallChartTemplates: TEMPLATES,
};
