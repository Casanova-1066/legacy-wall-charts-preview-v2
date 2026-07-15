import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { BringToFront, Copy, Download, Eye, EyeOff, Grid3X3, Image, Layers3, Lock, Maximize2, Move, Plus, RotateCcw, Save, ScanSearch, SendToBack, Trash2, Unlock, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { getCanvasDimensions, PRINT_SIZE_PRESETS, type PrintOrientation } from "@/lib/printSizes";
import { createGroupTeams, createWorldCup2026Project } from "@/lib/builder/worldCup2026Builder";
import { saveBuilderDraft } from "@/lib/builder/localDrafts";
import { saveCloudProject } from "@/lib/builder/cloudProjects";
import { useAuth } from "@/hooks/use-auth";
import type { BuilderBlock, BuilderBlockType, BuilderPage, BuilderProject } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

type DragState = {
  blockId: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  original: BuilderBlock;
};

const blockTypeLabels: Record<BuilderBlockType, string> = {
  title: "Title",
  "group-stage": "Group stage",
  knockout: "Knockout",
  notes: "Notes",
  image: "Image",
  text: "Text",
  "league-table": "League table",
  fixtures: "Fixtures",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, enabled: boolean) {
  return enabled ? Math.round(value) : value;
}

function nextBlock(type: BuilderBlockType, zIndex: number, page: BuilderPage): BuilderBlock {
  const id = `${type}-${Date.now()}`;
  const base = { id, type, page, label: blockTypeLabels[type], x: 10, y: 10, width: 24, height: 16, zIndex };
  if (type === "group-stage") {
    return { ...base, width: 30, height: 70, config: { startGroup: "A", groupCount: 4, teamsPerGroup: 4, showFixtures: true, teams: createGroupTeams("A", 4) } };
  }
  if (type === "knockout") return { ...base, width: 80, height: 70, config: { rounds: ["Quarter-finals", "Semi-finals", "Final"], firstRoundMatches: 4, showExtraTime: true, showPenalties: true, thirdPlace: false } };
  if (type === "title") return { ...base, width: 70, height: 9, x: 15, y: 5, config: { text: "Custom wall chart", subtitle: "Blank printable template" } };
  if (type === "notes") return { ...base, width: 44, height: 12, y: 78, config: { text: "Add notes here" } };
  return base;
}

function groupLetters(start: string, count: number) {
  const startIndex = Math.max(0, start.toUpperCase().charCodeAt(0) - 65);
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + startIndex + i));
}

function roundRobinPairs(teamCount: number) {
  const pairs: Array<[number, number]> = [];
  for (let home = 0; home < teamCount; home += 1) {
    for (let away = home + 1; away < teamCount; away += 1) pairs.push([home, away]);
  }
  return pairs;
}

function BlockPreview({ block }: { block: BuilderBlock }) {
  if (block.type === "title") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <p className="text-[10px] uppercase tracking-[.3em] text-gold/80">Legacy Wall Charts</p>
        <h1 className="font-display text-2xl font-black uppercase tracking-[.12em]">{String(block.config?.text ?? "FIFA World Cup 2026")}</h1>
        <p className="text-xs text-white/70">{String(block.config?.subtitle ?? "Blank editable tournament wall chart")}</p>
      </div>
    );
  }

  if (block.type === "group-stage") {
    const groups = groupLetters(String(block.config?.startGroup ?? "A"), Number(block.config?.groupCount ?? 4));
    const teamsByGroup = (block.config?.teams as Record<string, string[]> | undefined) ?? {};
    const teamsPerGroup = Number(block.config?.teamsPerGroup ?? 4);
    const showFixtures = Boolean(block.config?.showFixtures ?? true);

    return (
      <div className="h-full overflow-hidden p-2">
        <div className="mb-2 text-center text-xs font-black uppercase text-gold">{block.label}</div>
        <div className="grid h-[calc(100%-1.25rem)] grid-cols-2 gap-1.5">
          {groups.map((letter) => {
            const teams = teamsByGroup[letter] ?? Array.from({ length: teamsPerGroup }, (_, i) => `Team ${letter}${i + 1}`);
            const fixtures = roundRobinPairs(teams.length);
            return (
              <div key={letter} className="overflow-hidden rounded border border-white/30 bg-white/95 p-1 text-[7px] text-slate-950">
                <div className="mb-1 rounded bg-blue-900 px-1 py-0.5 text-center font-black text-white">Group {letter}</div>
                <div className="grid grid-cols-[1fr_repeat(8,10px)] gap-px border-b border-slate-400 pb-0.5 text-[5.5px] font-bold">
                  <span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GF</span><span>GA</span><span>GD</span><span>Pts</span>
                </div>
                {teams.map((team, i) => (
                  <div key={`${letter}-${i}`} className="grid grid-cols-[1fr_repeat(8,10px)] gap-px border-b border-slate-300 py-[1px]">
                    <span className="truncate">{i + 1}. {team}</span>{Array.from({ length: 8 }).map((_, cell) => <span key={cell}>_</span>)}
                  </div>
                ))}
                {showFixtures && (
                  <div className="mt-1 border-t border-slate-300 pt-1 text-[6px] leading-tight">
                    {fixtures.map(([home, away]) => (
                      <div key={`${home}-${away}`} className="grid grid-cols-[1fr_10px_1fr] gap-1">
                        <span className="truncate text-right">{teams[home]}</span><span className="text-center">–</span><span className="truncate">{teams[away]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (block.type === "knockout") {
    const rounds = (block.config?.rounds as string[] | undefined) ?? ["Quarter-finals", "Semi-finals", "Final"];
    const firstRoundMatches = Number(block.config?.firstRoundMatches ?? 4);
    const thirdPlace = Boolean(block.config?.thirdPlace ?? true);
    const showExtraTime = Boolean(block.config?.showExtraTime ?? true);
    const showPenalties = Boolean(block.config?.showPenalties ?? true);
    return (
      <div className="h-full p-2">
        <div className="mb-2 text-center text-xs font-black uppercase tracking-[.18em] text-gold">Knockout stage</div>
        <div className="grid h-[calc(100%-1.25rem)] gap-2" style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))` }}>
          {rounds.map((round, index) => {
            const matchCount = Math.max(1, Math.ceil(firstRoundMatches / Math.pow(2, index)));
            const isSemiFinal = round.toLowerCase().includes("semi");
            const isFinal = round.toLowerCase() === "final";
            return (
              <div key={round} className="flex min-h-0 flex-col justify-around gap-1">
                <p className="text-center text-[8px] font-black uppercase tracking-wide text-white/85">{round}</p>
                {Array.from({ length: matchCount }).map((_, i) => (
                  <div key={i} className={`overflow-hidden rounded-md border bg-gradient-to-b from-white to-slate-100 text-[7px] text-slate-950 shadow-md ${isFinal ? "border-amber-400 ring-1 ring-amber-300/60" : "border-white/45"}`}>
                    <div className="flex items-center justify-between border-b border-slate-300 px-1.5 py-1"><span className="truncate font-semibold">Team {i * 2 + 1}</span><span className="ml-1 flex h-4 w-5 items-center justify-center rounded border border-slate-400 bg-white font-bold">_</span></div>
                    <div className="flex items-center justify-between px-1.5 py-1"><span className="truncate font-semibold">Team {i * 2 + 2}</span><span className="ml-1 flex h-4 w-5 items-center justify-center rounded border border-slate-400 bg-white font-bold">_</span></div>
                    {(showExtraTime || showPenalties) && <div className="flex items-center justify-end gap-1 border-t border-slate-300 bg-slate-200/75 px-1 py-0.5 text-[5px] font-bold uppercase text-slate-600">
                      {showExtraTime && <span className="flex items-center gap-0.5">ET <b className="rounded border border-slate-400 bg-white px-1">_</b><b className="rounded border border-slate-400 bg-white px-1">_</b></span>}
                      {showPenalties && <span className="flex items-center gap-0.5">Pens <b className="rounded border border-slate-400 bg-white px-1">_</b><b className="rounded border border-slate-400 bg-white px-1">_</b></span>}
                    </div>}
                    <div className="px-1.5 py-0.5 text-[5px] text-slate-500">Date / venue: __________________</div>
                  </div>
                ))}
                {isSemiFinal && thirdPlace && <div className="rounded border border-amber-500/60 bg-amber-50 p-1 text-[6px] font-semibold text-slate-900">Third-place match →</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (block.type === "notes") return <div className="flex h-full items-center justify-center p-3 text-center text-xs text-white/75">{String(block.config?.text ?? "Add notes here")}</div>;
  if (block.type === "league-table") return <div className="p-2 text-xs"><b>League table</b>{Array.from({ length: 8 }).map((_, i) => <div key={i} className="mt-1 grid grid-cols-[1fr_24px_24px] border-b border-white/20"><span>{i + 1}. ______</span><span>P</span><span>Pts</span></div>)}</div>;
  if (block.type === "fixtures") return <div className="h-full overflow-hidden p-2 text-[7px]"><div className="mb-2 text-center text-xs font-black uppercase text-gold">Fixture list</div>{Array.from({ length: 10 }).map((_, i) => <div key={i} className="grid grid-cols-[44px_1fr_18px_1fr] gap-1 border-b border-white/20 py-1"><span>Match {i + 1}</span><span className="truncate text-right">____________</span><span className="text-center">v</span><span className="truncate">____________</span></div>)}</div>;
  if (block.type === "image") return <div className="flex h-full items-center justify-center text-white/50"><Image className="h-8 w-8" /></div>;
  return <div className="flex h-full items-center justify-center p-3 text-center text-sm text-white/80">Editable text block</div>;
}

export function LayoutDesigner({ initialProject }: { initialProject?: BuilderProject }) {
  const { user } = useAuth();
  const [project, setProject] = useState<BuilderProject>(() => initialProject ?? createWorldCup2026Project());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activePage, setActivePage] = useState<BuilderPage>("front");
  const [selectedId, setSelectedId] = useState(project.blocks.find((block) => (block.page ?? "front") === "front")?.id ?? "");
  const [zoom, setZoom] = useState(56);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [inspectionMode, setInspectionMode] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const lastSavedRef = useRef(initialProject?.updatedAt ?? "");

  useEffect(() => {
    if (!initialProject) return;
    setProject(initialProject);
    setActivePage("front");
    setSelectedId(initialProject.blocks.find((block) => (block.page ?? "front") === "front")?.id ?? "");
    lastSavedRef.current = initialProject.updatedAt;
  }, [initialProject]);

  const selectedBlock = project.blocks.find((block) => block.id === selectedId) ?? null;
  const visibleBlocks = project.blocks.filter((block) => (block.page ?? "front") === activePage && !block.hidden);
  const dims = useMemo(() => getCanvasDimensions(project.printSize, project.orientation), [project.printSize, project.orientation]);
  const effectiveDpi = useMemo(() => {
    if (!project.backgroundWidthPx || !project.backgroundHeightPx) return null;
    const widthInches = dims.widthMm / 25.4;
    const heightInches = dims.heightMm / 25.4;
    return Math.floor(Math.min(project.backgroundWidthPx / widthInches, project.backgroundHeightPx / heightInches));
  }, [dims.heightMm, dims.widthMm, project.backgroundHeightPx, project.backgroundWidthPx]);

  const patchProject = useCallback((patch: Partial<BuilderProject>) => setProject((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() })), []);
  const patchBlock = useCallback((blockId: string, patch: Partial<BuilderBlock>) => setProject((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === blockId ? { ...block, ...patch } : block), updatedAt: new Date().toISOString() })), []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = ((event.clientX - drag.startX) / Math.max(0.1, zoom / 100)) / dims.widthPx * 100;
      const dy = ((event.clientY - drag.startY) / Math.max(0.1, zoom / 100)) / dims.heightPx * 100;
      if (drag.mode === "move") {
        patchBlock(drag.blockId, { x: clamp(snap(drag.original.x + dx, snapToGrid), 0, 98), y: clamp(snap(drag.original.y + dy, snapToGrid), 0, 98) });
      } else {
        patchBlock(drag.blockId, { width: clamp(snap(drag.original.width + dx, snapToGrid), 6, 100 - drag.original.x), height: clamp(snap(drag.original.height + dy, snapToGrid), 5, 100 - drag.original.y) });
      }
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [dims.heightPx, dims.widthPx, patchBlock, snapToGrid, zoom]);

  const switchPage = (page: BuilderPage) => {
    setActivePage(page);
    setSelectedId(project.blocks.find((block) => (block.page ?? "front") === page)?.id ?? "");
  };

  const startDrag = (event: React.PointerEvent, block: BuilderBlock, mode: "move" | "resize") => {
    if (block.locked) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(block.id);
    dragRef.current = { blockId: block.id, mode, startX: event.clientX, startY: event.clientY, original: block };
  };

  const addBlock = (type: BuilderBlockType) => {
    const topZ = Math.max(10, ...project.blocks.map((block) => block.zIndex));
    const block = nextBlock(type, topZ + 1, activePage);
    patchProject({ blocks: [...project.blocks, block] });
    setSelectedId(block.id);
  };

  const duplicateBlock = () => {
    if (!selectedBlock) return;
    const copy = { ...selectedBlock, id: `${selectedBlock.id}-copy-${Date.now()}`, label: `${selectedBlock.label} copy`, x: clamp(selectedBlock.x + 3, 0, 90), y: clamp(selectedBlock.y + 3, 0, 90), zIndex: Math.max(...project.blocks.map((block) => block.zIndex)) + 1 };
    patchProject({ blocks: [...project.blocks, copy] });
    setSelectedId(copy.id);
  };

  const deleteBlock = () => {
    if (!selectedBlock) return;
    const next = project.blocks.filter((block) => block.id !== selectedBlock.id);
    patchProject({ blocks: next });
    setSelectedId(next.find((block) => (block.page ?? "front") === activePage)?.id ?? "");
  };

  const saveDraft = useCallback(async (quiet = false) => {
    setSaveState("saving");
    try {
      saveBuilderDraft(project);
      if (user) {
        const saved = await saveCloudProject(project, user.id);
        setProject(saved);
        lastSavedRef.current = saved.updatedAt;
      } else {
        lastSavedRef.current = project.updatedAt;
      }
      setSaveState("saved");
      if (!quiet) toast.success(user ? "Saved to your account" : "Saved on this device");
    } catch (error: any) {
      setSaveState("error");
      saveBuilderDraft(project);
      if (!quiet) toast.error(`${error?.message ?? "Cloud save failed"}. A local backup was kept.`);
    }
  }, [project, user]);

  useEffect(() => {
    if (project.updatedAt === lastSavedRef.current) return;
    const timer = window.setTimeout(() => { void saveDraft(true); }, 30_000);
    return () => window.clearTimeout(timer);
  }, [project.updatedAt, saveDraft]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (project.updatedAt === lastSavedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [project.updatedAt]);

  const bringForward = () => {
    if (!selectedBlock) return;
    patchBlock(selectedBlock.id, { zIndex: Math.max(...project.blocks.map((block) => block.zIndex)) + 1 });
  };

  const sendBackward = () => {
    if (!selectedBlock) return;
    patchBlock(selectedBlock.id, { zIndex: Math.min(...project.blocks.map((block) => block.zIndex)) - 1 });
  };

  const uploadBackground = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Background images must be 8 MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result ?? "");
      const image = new window.Image();
      image.onload = () => patchProject({
        backgroundUrl: source,
        backgroundWidthPx: image.naturalWidth,
        backgroundHeightPx: image.naturalHeight,
        backgroundFit: project.backgroundFit ?? "cover",
        backgroundPositionX: project.backgroundPositionX ?? 50,
        backgroundPositionY: project.backgroundPositionY ?? 50,
        backgroundScale: project.backgroundScale ?? 100,
      });
      image.src = source;
    };
    reader.readAsDataURL(file);
  };

  const applyTheme = (theme: BuilderProject["theme"]) => {
    patchProject({ theme, backgroundUrl: "" });
  };

  const resetWorldCupLayout = () => {
    const fresh = createWorldCup2026Project(project.name);
    setProject({ ...fresh, id: project.id, theme: project.theme, printSize: project.printSize, orientation: project.orientation, backgroundUrl: project.backgroundUrl, backgroundOpacity: project.backgroundOpacity, backgroundFit: project.backgroundFit, backgroundPositionX: project.backgroundPositionX, backgroundPositionY: project.backgroundPositionY, backgroundScale: project.backgroundScale, backgroundWidthPx: project.backgroundWidthPx, backgroundHeightPx: project.backgroundHeightPx });
    setActivePage("front");
    setSelectedId("front-title");
    toast.success("World Cup 2026 layout restored");
  };

  const openPrintPreview = async () => {
    await saveDraft(true);
    window.location.assign(`/editor/print?projectId=${encodeURIComponent(project.id)}`);
  };

  const updateGroupTeam = (group: string, index: number, value: string) => {
    if (!selectedBlock || selectedBlock.type !== "group-stage") return;
    const teams = { ...((selectedBlock.config?.teams as Record<string, string[]> | undefined) ?? {}) };
    const current = [...(teams[group] ?? [])];
    current[index] = value;
    teams[group] = current;
    patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, teams } });
  };

  return (
    <div className={cn("flex h-[calc(100vh-4rem)] overflow-hidden bg-navy text-foreground", inspectionMode && "fixed inset-0 z-[100] h-screen")}>
      <aside className={cn("hidden w-72 shrink-0 overflow-y-auto border-r border-glass-border bg-navy-light/60 p-4 print:hidden lg:block", inspectionMode && "lg:hidden")}>
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[.25em] text-gold/70">Template Workshop</p>
          <Input value={project.name} onChange={(e) => patchProject({ name: e.target.value })} className="mt-2 border-gold/15 bg-black/20 font-semibold" />
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-gold/15 bg-black/20 p-2">
            <Button size="sm" onClick={() => switchPage("front")} variant={activePage === "front" ? "default" : "ghost"} className={activePage === "front" ? "bg-gold text-navy hover:bg-gold-light" : ""}>Front</Button>
            <Button size="sm" onClick={() => switchPage("back")} variant={activePage === "back" ? "default" : "ghost"} className={activePage === "back" ? "bg-gold text-navy hover:bg-gold-light" : ""}>Back</Button>
          </div>
          <Button size="sm" variant="outline" className="w-full border-gold/20" onClick={resetWorldCupLayout}><RotateCcw className="mr-2 h-4 w-4" /> Restore World Cup layout</Button>

          <div className="rounded-lg border border-gold/15 bg-black/20 p-3">
            <Label className="text-xs">Add block to {activePage}</Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["group-stage", "knockout", "fixtures", "league-table", "title", "text", "image", "notes"] as BuilderBlockType[]).map((type) => (
                <Button key={type} size="sm" variant="outline" className="justify-start border-gold/20 text-[11px]" onClick={() => addBlock(type)}><Plus className="mr-1 h-3 w-3" /> {blockTypeLabels[type]}</Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Print size</Label>
            <Select value={project.printSize} onValueChange={(printSize) => patchProject({ printSize })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRINT_SIZE_PRESETS.map((size) => <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={project.orientation} onValueChange={(orientation) => patchProject({ orientation: orientation as PrintOrientation })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="landscape">Landscape</SelectItem><SelectItem value="portrait">Portrait</SelectItem></SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">{dims.widthMm}×{dims.heightMm}mm · print-safe canvas</p>
          </div>

          <div className="space-y-3 rounded-lg border border-gold/15 bg-black/20 p-3">
            <Label className="text-xs">Theme</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["midnight", "Midnight"],
                ["gold", "Gold"],
                ["light", "Light"],
                ["retro", "Retro"],
              ].map(([value, label]) => (
                <Button key={value} size="sm" variant={project.theme === value ? "default" : "outline"} className={project.theme === value ? "bg-gold text-navy hover:bg-gold-light" : "border-gold/20"} onClick={() => applyTheme(value as BuilderProject["theme"])}>{label}</Button>
              ))}
            </div>
            <input ref={backgroundInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadBackground(event.target.files?.[0])} />
            <Button type="button" variant="outline" className="w-full border-gold/25" onClick={() => backgroundInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload background</Button>
            <Input value={project.backgroundUrl ?? ""} onChange={(e) => patchProject({ backgroundUrl: e.target.value })} placeholder="Or paste image URL" />
            <Label className="text-[11px]">Background opacity {project.backgroundOpacity}%</Label>
            <Slider value={[project.backgroundOpacity]} min={0} max={100} step={1} onValueChange={([backgroundOpacity]) => patchProject({ backgroundOpacity })} />
            {project.backgroundUrl && <>
              <Label className="text-[11px]">Background fit</Label>
              <Select value={project.backgroundFit ?? "cover"} onValueChange={(backgroundFit) => patchProject({ backgroundFit: backgroundFit as BuilderProject["backgroundFit"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="cover">Cover (recommended)</SelectItem><SelectItem value="contain">Contain</SelectItem><SelectItem value="stretch">Stretch</SelectItem><SelectItem value="manual">Manual crop / zoom</SelectItem></SelectContent>
              </Select>
              {(project.backgroundFit ?? "cover") === "manual" && <>
                <Label className="text-[11px]">Background zoom {project.backgroundScale ?? 100}%</Label>
                <Slider value={[project.backgroundScale ?? 100]} min={50} max={250} step={1} onValueChange={([backgroundScale]) => patchProject({ backgroundScale })} />
                <Label className="text-[11px]">Horizontal position {project.backgroundPositionX ?? 50}%</Label>
                <Slider value={[project.backgroundPositionX ?? 50]} min={0} max={100} step={1} onValueChange={([backgroundPositionX]) => patchProject({ backgroundPositionX })} />
                <Label className="text-[11px]">Vertical position {project.backgroundPositionY ?? 50}%</Label>
                <Slider value={[project.backgroundPositionY ?? 50]} min={0} max={100} step={1} onValueChange={([backgroundPositionY]) => patchProject({ backgroundPositionY })} />
              </>}
              <div className={`rounded-md border p-2 text-[11px] ${effectiveDpi === null ? "border-white/10 text-muted-foreground" : effectiveDpi >= 300 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : effectiveDpi >= 200 ? "border-amber-500/30 bg-amber-500/10 text-amber-100" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
                <b>Print quality:</b> {project.backgroundWidthPx && project.backgroundHeightPx ? `${project.backgroundWidthPx}×${project.backgroundHeightPx}px` : "Image dimensions unavailable"}<br />
                {effectiveDpi !== null ? <>Estimated {effectiveDpi} DPI at {dims.label}. {effectiveDpi >= 300 ? "Excellent for print." : effectiveDpi >= 200 ? "Usable, but may soften at large size." : "Warning: likely to look blurred. Use a 300 DPI image or smaller print size."}</> : "Upload an image to calculate effective DPI."}
              </div>
            </>}
          </div>

          <div className="space-y-3 rounded-lg border border-gold/15 bg-black/20 p-3">
            <div className="flex items-center justify-between"><Label className="text-xs"><Grid3X3 className="mr-1 inline h-3 w-3" /> Snap to grid</Label><Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Show grid</Label><Switch checked={showGrid} onCheckedChange={setShowGrid} /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Safe print area</Label><Switch checked={project.showSafeArea ?? true} onCheckedChange={(showSafeArea) => patchProject({ showSafeArea })} /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Bleed guide</Label><Switch checked={project.showBleed ?? false} onCheckedChange={(showBleed) => patchProject({ showBleed })} /></div>
            <Label className="text-xs">Safe margin {project.safeMarginPct ?? 3}%</Label>
            <Slider value={[project.safeMarginPct ?? 3]} min={1} max={10} step={0.5} onValueChange={([safeMarginPct]) => patchProject({ safeMarginPct })} />
            <Label className="text-xs">Zoom {zoom}%</Label>
            <div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => setZoom((value) => clamp(value - 25, 25, 200))}><ZoomOut className="h-3.5 w-3.5" /></Button><Slider value={[zoom]} min={25} max={200} step={5} onValueChange={([value]) => setZoom(value)} /><Button size="sm" variant="outline" onClick={() => setZoom((value) => clamp(value + 25, 25, 200))}><ZoomIn className="h-3.5 w-3.5" /></Button></div>
            <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" onClick={() => setZoom(56)}>Fit screen</Button><Button size="sm" variant="outline" onClick={() => setZoom(100)}>100%</Button></div>
            <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold-light" onClick={() => setInspectionMode(true)}><ScanSearch className="mr-2 h-4 w-4" /> Inspect design</Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => void saveDraft()} className="flex-1 bg-gold text-navy hover:bg-gold-light"><Save className="mr-1 h-4 w-4" /> Save</Button>
            <Button onClick={openPrintPreview} variant="outline" className="border-gold/25 text-gold"><Download className="mr-1 h-4 w-4" /> PDF</Button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-glass-border bg-navy/80 px-4 py-2 print:hidden">
          <div className="text-sm"><b>{dims.label} · {activePage === "front" ? "Front" : "Back"}</b><span className="ml-2 text-muted-foreground">Front holds the knockout bracket. Back holds all 12 groups and fixtures.</span><span className="ml-3 text-xs text-gold/80">{saveState === "saving" ? "Saving…" : saveState === "saved" ? (user ? "Saved to cloud" : "Saved locally") : saveState === "error" ? "Cloud save failed" : project.updatedAt === lastSavedRef.current ? "Saved" : "Unsaved changes"}</span></div>
          <div className="flex gap-2">{inspectionMode && <Button size="sm" variant="outline" onClick={() => setInspectionMode(false)}>Back to editor</Button>}<Button size="sm" variant="ghost" onClick={() => void saveDraft()}><Save className="mr-1 h-4 w-4" /> Save draft</Button><Button size="sm" onClick={openPrintPreview} className="bg-gold text-navy hover:bg-gold-light"><Download className="mr-1 h-4 w-4" /> Preview PDF</Button></div>
        </div>

        <div className="flex flex-1 overflow-auto p-6 print:block print:overflow-visible print:p-0">
          <div className="mx-auto shrink-0 origin-top print:mx-0 print:scale-100" style={{ transform: `scale(${zoom / 100})` }}>
            <div
              ref={canvasRef}
              className={cn("relative overflow-hidden rounded-xl border border-white/15 shadow-2xl print:rounded-none print:border-0", showGrid && "builder-grid")}
              style={{
                width: dims.widthPx,
                height: dims.heightPx,
                backgroundImage: project.backgroundUrl ? undefined : project.theme === "gold"
                  ? "radial-gradient(circle at 72% 20%, rgba(234,179,8,.35), transparent 28%), linear-gradient(135deg,#140d02,#3b2705 55%,#080603)"
                  : project.theme === "light"
                    ? "linear-gradient(135deg,#f8fafc,#dbeafe 55%,#ffffff)"
                    : project.theme === "retro"
                      ? "radial-gradient(circle at 20% 20%, rgba(120,53,15,.18), transparent 30%), linear-gradient(135deg,#f2e7cf,#d8c39b 60%,#efe2c8)"
                      : "radial-gradient(circle at 70% 75%, rgba(30,64,175,.55), transparent 26%), linear-gradient(135deg,#020617,#061a3a 55%,#020617)",
              }}
              onPointerDown={() => setSelectedId("")}
            >
              {project.backgroundUrl && <img src={project.backgroundUrl} alt="" className="absolute inset-0 h-full w-full" style={{
                opacity: project.backgroundOpacity / 100,
                objectFit: project.backgroundFit === "stretch" ? "fill" : project.backgroundFit === "contain" ? "contain" : "cover",
                objectPosition: `${project.backgroundPositionX ?? 50}% ${project.backgroundPositionY ?? 50}%`,
                transform: project.backgroundFit === "manual" ? `scale(${(project.backgroundScale ?? 100) / 100})` : undefined,
                transformOrigin: `${project.backgroundPositionX ?? 50}% ${project.backgroundPositionY ?? 50}%`,
              }} />}
              <div className={cn("absolute inset-0", project.theme === "light" || project.theme === "retro" ? "bg-white/5" : "bg-gradient-to-b from-black/30 via-transparent to-black/45")} />
              {project.showBleed && <div className="pointer-events-none absolute inset-[1%] border border-dashed border-red-400/80 print:hidden" />}
              {project.showSafeArea && <div className="pointer-events-none absolute border border-dashed border-emerald-300/80 print:hidden" style={{ inset: `${project.safeMarginPct ?? 3}%` }} />}
              {visibleBlocks.sort((a, b) => a.zIndex - b.zIndex).map((block) => (
                <div
                  key={block.id}
                  className={cn("absolute rounded-lg border bg-black/35 text-white shadow-lg backdrop-blur-sm", selectedId === block.id ? "border-gold ring-2 ring-gold/25" : "border-white/25", block.locked && "opacity-80")}
                  style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.width}%`, height: `${block.height}%`, zIndex: block.zIndex }}
                  onPointerDown={(event) => startDrag(event, block, "move")}
                >
                  <div className="absolute left-2 top-1 z-20 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80 print:hidden"><Move className="h-3 w-3" /> {block.label}</div>
                  <BlockPreview block={block} />
                  {selectedId === block.id && !block.locked && <button aria-label="Resize block" className="absolute bottom-0 right-0 z-30 flex h-5 w-5 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gold text-navy print:hidden" onPointerDown={(event) => startDrag(event, block, "resize")}><Maximize2 className="h-3 w-3" /></button>}
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-black tracking-[.3em] text-white/[.035] -rotate-12 print:text-white/[.025]">LEGACY WALL CHARTS</div>
            </div>
          </div>
        </div>
      </main>

      <aside className={cn("hidden w-80 shrink-0 overflow-y-auto border-l border-glass-border bg-navy-light/60 p-4 print:hidden xl:block", inspectionMode && "xl:hidden")}>
        <div className="mb-4"><p className="text-[10px] uppercase tracking-[.25em] text-gold/70">Properties</p><h2 className="mt-1 font-display text-xl font-bold">{selectedBlock ? selectedBlock.label : "No block selected"}</h2></div>
        <div className="mb-5 rounded-lg border border-gold/15 bg-black/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gold"><Layers3 className="h-4 w-4" /> Layers · {activePage}</div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {project.blocks.filter((block) => (block.page ?? "front") === activePage).sort((a, b) => b.zIndex - a.zIndex).map((block) => (
              <div key={block.id} className={cn("flex items-center gap-1 rounded border px-2 py-1", selectedId === block.id ? "border-gold bg-gold/10" : "border-white/10")}>
                <button className="min-w-0 flex-1 truncate text-left text-xs" onClick={() => setSelectedId(block.id)}>{block.label}</button>
                <button aria-label={block.hidden ? "Show layer" : "Hide layer"} onClick={() => patchBlock(block.id, { hidden: !block.hidden })}>{block.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                <button aria-label={block.locked ? "Unlock layer" : "Lock layer"} onClick={() => patchBlock(block.id, { locked: !block.locked })}>{block.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}</button>
              </div>
            ))}
          </div>
        </div>
        {selectedBlock ? <div className="space-y-4">
          <div className="space-y-2"><Label className="text-xs">Block name</Label><Input value={selectedBlock.label} onChange={(e) => patchBlock(selectedBlock.id, { label: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2"><div><Label className="text-xs">X</Label><Input type="number" value={Math.round(selectedBlock.x)} onChange={(e) => patchBlock(selectedBlock.id, { x: clamp(Number(e.target.value), 0, 98) })} /></div><div><Label className="text-xs">Y</Label><Input type="number" value={Math.round(selectedBlock.y)} onChange={(e) => patchBlock(selectedBlock.id, { y: clamp(Number(e.target.value), 0, 98) })} /></div><div><Label className="text-xs">Width</Label><Input type="number" value={Math.round(selectedBlock.width)} onChange={(e) => patchBlock(selectedBlock.id, { width: clamp(Number(e.target.value), 6, 100) })} /></div><div><Label className="text-xs">Height</Label><Input type="number" value={Math.round(selectedBlock.height)} onChange={(e) => patchBlock(selectedBlock.id, { height: clamp(Number(e.target.value), 5, 100) })} /></div></div>
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => patchBlock(selectedBlock.id, { locked: !selectedBlock.locked })}>{selectedBlock.locked ? <Unlock className="mr-1 h-4 w-4" /> : <Lock className="mr-1 h-4 w-4" />}{selectedBlock.locked ? "Unlock" : "Lock"}</Button><Button size="sm" variant="outline" onClick={duplicateBlock}><Copy className="mr-1 h-4 w-4" />Duplicate</Button><Button size="sm" variant="outline" onClick={bringForward}><BringToFront className="mr-1 h-4 w-4" />Front</Button><Button size="sm" variant="outline" onClick={sendBackward}><SendToBack className="mr-1 h-4 w-4" />Back</Button><Button size="sm" variant="destructive" onClick={deleteBlock}><Trash2 className="mr-1 h-4 w-4" />Delete</Button></div>

          {(selectedBlock.type === "title" || selectedBlock.type === "notes") && <div className="space-y-2 rounded-lg border border-gold/15 p-3"><Label className="text-xs">Text</Label><Input value={String(selectedBlock.config?.text ?? "")} onChange={(e) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, text: e.target.value } })} />{selectedBlock.type === "title" && <><Label className="text-xs">Subtitle</Label><Input value={String(selectedBlock.config?.subtitle ?? "")} onChange={(e) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, subtitle: e.target.value } })} /></>}</div>}

          {selectedBlock.type === "group-stage" && <div className="space-y-3 rounded-lg border border-gold/15 p-3">
            <Label className="text-xs">Group count</Label><Slider value={[Number(selectedBlock.config?.groupCount ?? 4)]} min={1} max={12} step={1} onValueChange={([groupCount]) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, groupCount } })} />
            <Label className="text-xs">Teams per group</Label><Slider value={[Number(selectedBlock.config?.teamsPerGroup ?? 4)]} min={2} max={6} step={1} onValueChange={([teamsPerGroup]) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, teamsPerGroup } })} />
            <div className="flex items-center justify-between"><Label className="text-xs">Show fixtures</Label><Switch checked={Boolean(selectedBlock.config?.showFixtures ?? true)} onCheckedChange={(showFixtures) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, showFixtures } })} /></div>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {groupLetters(String(selectedBlock.config?.startGroup ?? "A"), Number(selectedBlock.config?.groupCount ?? 4)).map((group) => {
                const teams = ((selectedBlock.config?.teams as Record<string, string[]> | undefined) ?? {})[group] ?? Array.from({ length: Number(selectedBlock.config?.teamsPerGroup ?? 4) }, (_, i) => `Team ${group}${i + 1}`);
                return <div key={group} className="rounded border border-white/10 p-2"><p className="mb-2 text-xs font-bold text-gold">Group {group}</p>{teams.map((team, index) => <Input key={`${group}-${index}`} value={team} onChange={(e) => updateGroupTeam(group, index, e.target.value)} className="mb-1 h-8 text-xs" />)}</div>;
              })}
            </div>
          </div>}

          {selectedBlock.type === "knockout" && <div className="space-y-3 rounded-lg border border-gold/15 p-3">
            <Label className="text-xs">Round names (comma separated)</Label>
            <Input value={((selectedBlock.config?.rounds as string[] | undefined) ?? []).join(", ")} onChange={(e) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, rounds: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) } })} />
            <Label className="text-xs">First-round matches</Label>
            <Input type="number" min={1} max={64} value={Number(selectedBlock.config?.firstRoundMatches ?? 4)} onChange={(e) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, firstRoundMatches: clamp(Number(e.target.value), 1, 64) } })} />
            <div className="flex items-center justify-between"><Label className="text-xs">Extra-time boxes</Label><Switch checked={Boolean(selectedBlock.config?.showExtraTime ?? true)} onCheckedChange={(showExtraTime) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, showExtraTime } })} /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Penalty boxes</Label><Switch checked={Boolean(selectedBlock.config?.showPenalties ?? true)} onCheckedChange={(showPenalties) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, showPenalties } })} /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Third-place match</Label><Switch checked={Boolean(selectedBlock.config?.thirdPlace ?? true)} onCheckedChange={(thirdPlace) => patchBlock(selectedBlock.id, { config: { ...selectedBlock.config, thirdPlace } })} /></div>
            <p className="text-[11px] text-muted-foreground">World Cup 2026 uses 16 matches in the Round of 32.</p>
          </div>}
        </div> : <p className="text-sm text-muted-foreground">Select a block on the canvas to rename, move, resize, lock, duplicate or delete it.</p>}
      </aside>
    </div>
  );
}
