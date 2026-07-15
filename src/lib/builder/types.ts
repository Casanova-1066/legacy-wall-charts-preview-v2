export type BuilderBlockType = "title" | "group-stage" | "knockout" | "notes" | "image" | "text" | "league-table" | "fixtures";
export type BuilderPage = "front" | "back";

export interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  label: string;
  page?: BuilderPage;
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
  hidden?: boolean;
  zIndex: number;
  config?: Record<string, unknown>;
}

export interface BuilderProject {
  id: string;
  name: string;
  templateSlug: string;
  printSize: string;
  orientation: "landscape" | "portrait";
  backgroundUrl?: string;
  backgroundOpacity: number;
  backgroundFit?: "cover" | "contain" | "stretch" | "manual";
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  backgroundScale?: number;
  backgroundWidthPx?: number;
  backgroundHeightPx?: number;
  theme?: "midnight" | "gold" | "light" | "retro";
  showSafeArea?: boolean;
  safeMarginPct?: number;
  showBleed?: boolean;
  blocks: BuilderBlock[];
  updatedAt: string;
}
