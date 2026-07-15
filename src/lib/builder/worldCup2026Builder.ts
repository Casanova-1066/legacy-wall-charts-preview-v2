import type { BuilderBlock, BuilderProject } from "./types";

export const WORLD_CUP_2026_GROUPS = Array.from({ length: 12 }, (_, index) => String.fromCharCode(65 + index));

export function createGroupTeams(startGroup: string, groupCount: number, teamsPerGroup = 4) {
  const start = startGroup.charCodeAt(0) - 65;
  return Object.fromEntries(
    Array.from({ length: groupCount }, (_, groupOffset) => {
      const letter = String.fromCharCode(65 + start + groupOffset);
      return [letter, Array.from({ length: teamsPerGroup }, (_, teamIndex) => `Team ${letter}${teamIndex + 1}`)];
    }),
  );
}

export function createWorldCup2026Blocks(): BuilderBlock[] {
  return [
    {
      id: "front-title",
      type: "title",
      page: "front",
      label: "Front title",
      x: 4,
      y: 3,
      width: 92,
      height: 9,
      zIndex: 10,
      config: { text: "FIFA World Cup 2026", subtitle: "Knockout stage" },
    },
    {
      id: "knockout",
      type: "knockout",
      page: "front",
      label: "Knockout stage",
      x: 4,
      y: 14,
      width: 92,
      height: 74,
      zIndex: 20,
      config: {
        rounds: ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"],
        firstRoundMatches: 16,
        twoLegged: false,
        thirdPlace: true,
        showExtraTime: true,
        showPenalties: true,
      },
    },
    {
      id: "front-notes",
      type: "notes",
      page: "front",
      label: "Final and notes",
      x: 12,
      y: 90,
      width: 76,
      height: 7,
      zIndex: 20,
      config: { text: "Champion: ____________________    Third place: ____________________" },
    },
    {
      id: "back-title",
      type: "title",
      page: "back",
      label: "Back title",
      x: 4,
      y: 2,
      width: 92,
      height: 8,
      zIndex: 10,
      config: { text: "FIFA World Cup 2026", subtitle: "Group stage fixtures and tables" },
    },
    {
      id: "groups-a-d",
      type: "group-stage",
      page: "back",
      label: "Groups A–D",
      x: 2,
      y: 12,
      width: 31,
      height: 82,
      zIndex: 20,
      config: { startGroup: "A", groupCount: 4, teamsPerGroup: 4, showFixtures: true, teams: createGroupTeams("A", 4) },
    },
    {
      id: "groups-e-h",
      type: "group-stage",
      page: "back",
      label: "Groups E–H",
      x: 34.5,
      y: 12,
      width: 31,
      height: 82,
      zIndex: 20,
      config: { startGroup: "E", groupCount: 4, teamsPerGroup: 4, showFixtures: true, teams: createGroupTeams("E", 4) },
    },
    {
      id: "groups-i-l",
      type: "group-stage",
      page: "back",
      label: "Groups I–L",
      x: 67,
      y: 12,
      width: 31,
      height: 82,
      zIndex: 20,
      config: { startGroup: "I", groupCount: 4, teamsPerGroup: 4, showFixtures: true, teams: createGroupTeams("I", 4) },
    },
    {
      id: "back-notes",
      type: "notes",
      page: "back",
      label: "Qualification notes",
      x: 10,
      y: 95,
      width: 80,
      height: 3,
      zIndex: 20,
      config: { text: "Top two teams and the eight best third-placed teams qualify for the Round of 32." },
    },
  ];
}

export function createWorldCup2026Project(name = "World Cup 2026 wall chart"): BuilderProject {
  return {
    id: `local-${Date.now()}`,
    name,
    templateSlug: "world-cup-2026",
    printSize: "a2",
    orientation: "landscape",
    backgroundOpacity: 38,
    backgroundFit: "cover",
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    backgroundScale: 100,
    theme: "midnight",
    showSafeArea: true,
    safeMarginPct: 3,
    showBleed: false,
    blocks: createWorldCup2026Blocks(),
    updatedAt: new Date().toISOString(),
  };
}
