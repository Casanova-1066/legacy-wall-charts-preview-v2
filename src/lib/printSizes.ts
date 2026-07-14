export type PrintOrientation = "landscape" | "portrait";

export interface PrintSizePreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  category: "paper" | "poster" | "digital";
}

export const PRINT_SIZE_PRESETS: PrintSizePreset[] = [
  { id: "a4", name: "A4", widthMm: 210, heightMm: 297, category: "paper" },
  { id: "a3", name: "A3", widthMm: 297, heightMm: 420, category: "paper" },
  { id: "a2", name: "A2", widthMm: 420, heightMm: 594, category: "paper" },
  { id: "a1", name: "A1", widthMm: 594, heightMm: 841, category: "paper" },
  { id: "a0", name: "A0", widthMm: 841, heightMm: 1189, category: "paper" },
  { id: "poster-24x36", name: "Poster 24×36 in", widthMm: 610, heightMm: 914, category: "poster" },
  { id: "poster-30x40", name: "Poster 30×40 in", widthMm: 762, heightMm: 1016, category: "poster" },
  { id: "digital-16x9", name: "Digital 16:9", widthMm: 320, heightMm: 180, category: "digital" },
];

export function getPrintSize(id: string): PrintSizePreset {
  return PRINT_SIZE_PRESETS.find((preset) => preset.id === id) ?? PRINT_SIZE_PRESETS[1];
}

export function getCanvasDimensions(sizeId: string, orientation: PrintOrientation) {
  const preset = getPrintSize(sizeId);
  const landscape = orientation === "landscape";
  const widthMm = landscape ? Math.max(preset.widthMm, preset.heightMm) : Math.min(preset.widthMm, preset.heightMm);
  const heightMm = landscape ? Math.min(preset.widthMm, preset.heightMm) : Math.max(preset.widthMm, preset.heightMm);
  const scale = 3.2;
  return {
    widthMm,
    heightMm,
    widthPx: Math.round(widthMm * scale),
    heightPx: Math.round(heightMm * scale),
    aspectRatio: widthMm / heightMm,
    label: `${preset.name} ${orientation}`,
  };
}
