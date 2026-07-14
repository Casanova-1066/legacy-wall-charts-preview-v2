import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCompetitions, useSeason } from "@/lib/hooks/useTournamentEngine";
import { buildWallChart } from "@/lib/wallchart/builder";
import { WallChartCanvas } from "@/components/wallchart/WallChartCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, Save, Undo2, Copy, Download, Shuffle, RotateCcw, ZoomOut, ZoomIn, Move, Type, Palette, Image, Lock } from "lucide-react";

export const Route = createFileRoute("/editor/$chartId")({ component: EditorChart });

type Theme = { id: string; slug: string; name: string; css_properties: any; is_premium: boolean };
type ChartRow = {
  id: string;
  name: string;
  title?: string | null;
  owner_id: string;
  competition_slug?: string | null;
  competition_id?: string | null;
  season_slug?: string | null;
  auto_fill_enabled?: boolean;
  watermark_enabled?: boolean;
  pdf_config?: any;
  updated_at?: string;
};

function EditorChart() {
  const { chartId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chartName, setChartName] = useState("Untitled Chart");
  const [selectedTheme, setSelectedTheme] = useState<string>("stadium-lights");
  const [autoFill, setAutoFill] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [zoom, setZoom] = useState(70);
  const [activePanel, setActivePanel] = useState<"properties" | "themes" | "background" | null>("properties");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [history, setHistory] = useState<Array<{ name: string; theme: string; autoFill: boolean; watermark: boolean; tournament: string; season: string }>>([]);

  const competitions = useCompetitions();
  const selectedCompetition = competitions.find((c) => c.slug === selectedTournament);

  const { data: themes } = useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data } = await db.from<Theme[]>("themes").select("*");
      return data ?? [];
    },
  });

  const { data: seasons } = useQuery({
    queryKey: ["editor-seasons", selectedTournament],
    queryFn: async () => {
      const { data, error } = await db.from<any[]>("seasons").select("*").eq("competition_slug", selectedTournament).order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!selectedTournament,
  });

  const { data: chart, refetch: refetchChart } = useQuery({
    queryKey: ["chart", chartId],
    queryFn: async () => {
      const { data, error } = await db.from<ChartRow>("wall_charts").select("*").eq("id", chartId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!chartId && chartId !== "new",
  });

  const { data: entitlement } = useQuery({
    queryKey: ["watermark-entitlement", chartId],
    queryFn: async () => {
      const { data, error } = await db.rpc<any>("check_watermark_entitlement", { p_chart_id: chartId });
      if (error || !data) return { can_remove_watermark: false };
      return data;
    },
    enabled: !!chartId && chartId !== "new" && !!user,
  });

  const canRemoveWatermark = entitlement?.can_remove_watermark ?? false;
  const canUseAutoFill = entitlement?.watermark_unlocked ?? false;
  const effectiveAutoFill = autoFill && canUseAutoFill;
  const seasonData = useSeason(selectedSeason || undefined, { chartId, autoFillEnabled: effectiveAutoFill });

  useEffect(() => {
    if (!chart) return;
    setChartName(chart.name || chart.title || "Untitled Chart");
    setSelectedTournament(chart.competition_slug ?? "");
    setSelectedSeason(chart.season_slug ?? "");
    setAutoFill(Boolean(chart.auto_fill_enabled) && canUseAutoFill);
    setSelectedTheme(chart.pdf_config?.theme_slug ?? chart.pdf_config?.theme ?? "stadium-lights");
    setWatermarkEnabled(canRemoveWatermark ? Boolean(chart.watermark_enabled ?? true) : true);
  }, [chart, canRemoveWatermark, canUseAutoFill]);

  const vm = useMemo(() => {
    if (!seasonData) return null;
    const competitionName = selectedCompetition?.name ?? "Legacy Wall Chart";
    return buildWallChart(competitionName, seasonData.name, seasonData.rounds, seasonData.teams);
  }, [seasonData, selectedCompetition?.name]);

  const resultSummary = useMemo(() => {
    const rows = [
      ...(vm?.bracketColumns.flatMap((column) => column.cells) ?? []),
      ...(vm?.groupTables.flatMap((group) => group.matchdays.flatMap((matchday) => matchday.fixtures)) ?? []),
    ];
    return {
      official: effectiveAutoFill ? rows.filter((row) => row.resultMode === "official").length : 0,
      manual: rows.filter((row) => row.resultMode === "manual").length,
      pending: rows.filter((row) => row.resultMode === "pending").length,
      needsData: effectiveAutoFill ? rows.filter((row) => row.resultMode === "needs-data").length : 0,
      total: rows.length,
    };
  }, [vm, effectiveAutoFill]);

  const snapshot = useCallback(() => {
    setHistory((prev) => [...prev.slice(-19), { name: chartName, theme: selectedTheme, autoFill, watermark: watermarkEnabled, tournament: selectedTournament, season: selectedSeason }]);
  }, [chartName, selectedTheme, autoFill, watermarkEnabled, selectedTournament, selectedSeason]);

  const handleSave = useCallback(async () => {
    if (!user) { toast.error("Sign in to save charts"); return; }
    if (!selectedTournament || !selectedSeason) { toast.error("Choose a tournament and season first"); return; }

    const safeWatermark = canRemoveWatermark ? watermarkEnabled : true;
    const payload: Partial<ChartRow> = {
      name: chartName.trim() || "Untitled Chart",
      title: chartName.trim() || "Untitled Chart",
      owner_id: user.id,
      competition_slug: selectedTournament,
      competition_id: selectedCompetition?.id ?? null,
      season_slug: selectedSeason,
      auto_fill_enabled: effectiveAutoFill,
      watermark_enabled: safeWatermark,
      pdf_config: {
        ...(chart?.pdf_config ?? {}),
        theme_slug: selectedTheme,
        paper_size: chart?.pdf_config?.paper_size ?? "A3",
        orientation: chart?.pdf_config?.orientation ?? "landscape",
        resolution: chart?.pdf_config?.resolution ?? 300,
      },
    };

    const { error } = await db.from("wall_charts").update(payload).eq("id", chartId).select("*").single();
    if (error) { toast.error(error.message || "Could not save chart"); return; }
    await queryClient.invalidateQueries({ queryKey: ["chart", chartId] });
    await queryClient.invalidateQueries({ queryKey: ["my-charts"] });
    toast.success("Chart saved");
  }, [user, selectedTournament, selectedSeason, canRemoveWatermark, watermarkEnabled, chartName, selectedCompetition?.id, effectiveAutoFill, chart?.pdf_config, selectedTheme, chartId, queryClient]);

  const handleDuplicate = useCallback(async () => {
    if (!user || !chart) { toast.error("Save this chart before duplicating"); return; }
    const { data, error } = await db.from<any>("wall_charts").insert({
      name: `${chartName || chart.name} copy`,
      title: `${chartName || chart.name} copy`,
      owner_id: user.id,
      competition_slug: selectedTournament || chart.competition_slug,
      competition_id: selectedCompetition?.id ?? chart.competition_id ?? null,
      season_slug: selectedSeason || chart.season_slug,
      chart_type: "bracket",
      auto_fill_enabled: effectiveAutoFill,
      watermark_enabled: canRemoveWatermark ? watermarkEnabled : true,
      pdf_config: { ...(chart.pdf_config ?? {}), theme_slug: selectedTheme },
    }).select("*").single();
    if (error || !data?.id) { toast.error(error?.message ?? "Could not duplicate chart"); return; }
    toast.success("Chart duplicated");
    navigate({ to: "/editor/$chartId", params: { chartId: data.id } });
  }, [user, chart, chartName, selectedTournament, selectedCompetition?.id, selectedSeason, effectiveAutoFill, canRemoveWatermark, watermarkEnabled, selectedTheme, navigate]);

  const handleUndo = useCallback(() => {
    const previous = history[history.length - 1];
    if (!previous) { toast.message("Nothing to undo yet"); return; }
    setChartName(previous.name);
    setSelectedTheme(previous.theme);
    setAutoFill(previous.autoFill);
    setWatermarkEnabled(previous.watermark);
    setSelectedTournament(previous.tournament);
    setSelectedSeason(previous.season);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const handleReset = useCallback(async () => {
    const refreshed = await refetchChart();
    if (refreshed.data) toast.success("Restored saved official chart settings");
  }, [refetchChart]);

  const randomizeTheme = useCallback(() => {
    if (!themes || themes.length === 0) return;
    snapshot();
    const random = themes[Math.floor(Math.random() * themes.length)];
    setSelectedTheme(random.slug);
    toast.success(`Theme: ${random.name}`);
  }, [themes, snapshot]);

  const handleRefreshOfficialResults = useCallback(async () => {
    if (!selectedSeason) {
      toast.error("Choose a season first");
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["official_results", selectedSeason] }),
      queryClient.invalidateQueries({ queryKey: ["season", selectedSeason] }),
    ]);
    toast.success("Official result data refreshed");
  }, [queryClient, selectedSeason]);

  const handleWatermarkChange = (value: boolean) => {
    if (!canRemoveWatermark && value === false) {
      toast.error("Remove watermark with Pro or printable PDF purchase.");
      return;
    }
    snapshot();
    setWatermarkEnabled(value);
  };

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-glass-border bg-navy/80 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/my-charts" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <Input value={chartName} onChange={(e) => { snapshot(); setChartName(e.target.value); }} className="h-8 w-48 border-none bg-transparent text-sm font-semibold focus-visible:ring-0" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button variant="ghost" size="sm" onClick={handleSave} className="text-xs"><Save className="mr-1 h-3.5 w-3.5" /> Save</Button>
          <Button variant="ghost" size="sm" onClick={handleDuplicate} className="text-xs"><Copy className="mr-1 h-3.5 w-3.5" /> Duplicate</Button>
          <Button variant="ghost" size="sm" onClick={handleUndo} className="text-xs"><Undo2 className="mr-1 h-3.5 w-3.5" /> Undo</Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs"><RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset</Button>
          <Link to="/editor/$chartId/print" params={{ chartId }}><Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10 text-xs"><Download className="mr-1 h-3.5 w-3.5" /> Export PDF</Button></Link>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-12 flex-col items-center gap-1 border-r border-glass-border bg-navy/50 py-3 lg:flex">
          {[{ icon: Move, id: "select" }, { icon: Type, id: "text" }, { icon: Palette, id: "colors" }].map((t) => (
            <button key={t.id} type="button" title={t.id} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-navy-light hover:text-foreground"><t.icon className="h-4 w-4" /></button>
          ))}
        </div>
        <div className="flex flex-1 items-start justify-center overflow-auto bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.03),transparent_70%)] p-4">
          <div className="watermark-overlay relative w-[1400px] max-w-none min-h-[780px] shrink-0 glass-panel rounded-lg overflow-visible shadow-2xl" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}>
            {watermarkEnabled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                <span className="text-4xl lg:text-6xl font-black text-white/[0.06] tracking-[0.3em] -rotate-[20deg] whitespace-nowrap">BLOOD OATH LEGACY</span>
              </div>
            )}
            <div className="relative z-10 p-4">
              {vm ? (
                <WallChartCanvas vm={vm} tournamentId={selectedTournament} seasonId={selectedSeason} backgroundConfig={chart?.pdf_config?.background ?? null} />
              ) : (
                <div className="flex min-h-[460px] flex-col items-center justify-center text-center space-y-4">
                  <Image className="h-16 w-16 text-gold/30 mx-auto" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Select a Tournament</h3>
                  <p className="text-sm text-muted-foreground max-w-md">Choose a tournament and season to load verified match data.</p>
                  <div className="flex flex-col items-center gap-3 max-w-xs mx-auto w-full">
                    <Select value={selectedTournament} onValueChange={(value) => { snapshot(); setSelectedTournament(value); setSelectedSeason(""); }}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select tournament" /></SelectTrigger>
                      <SelectContent>{competitions.map((t) => (<SelectItem key={t.id} value={t.slug}>{t.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={selectedSeason} onValueChange={(value) => { snapshot(); setSelectedSeason(value); }} disabled={!selectedTournament || (seasons ?? []).length === 0}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={selectedTournament ? "Select season" : "Choose tournament first"} /></SelectTrigger>
                      <SelectContent>{(seasons ?? []).map((s: any) => (<SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>))}</SelectContent>
                    </Select>
                    {selectedTournament && (seasons ?? []).length === 0 && <p className="text-xs text-muted-foreground">Season data coming soon.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="hidden w-72 flex-col border-l border-glass-border bg-navy/50 lg:flex">
          <div className="flex border-b border-glass-border">
            {["properties", "themes", "background"].map((tab) => (
              <button key={tab} type="button" onClick={() => setActivePanel(activePanel === (tab as any) ? null : (tab as any))} className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${activePanel === tab ? "border-b-2 border-gold text-gold" : "text-muted-foreground hover:text-foreground"}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === "properties" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Chart Settings</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Tournament</Label>
                    <Select value={selectedTournament} onValueChange={(value) => { snapshot(); setSelectedTournament(value); setSelectedSeason(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select tournament" /></SelectTrigger>
                      <SelectContent>{competitions.map((t) => (<SelectItem key={t.id} value={t.slug}>{t.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Season</Label>
                    <Select value={selectedSeason} onValueChange={(value) => { snapshot(); setSelectedSeason(value); }} disabled={!selectedTournament || (seasons ?? []).length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                      <SelectContent>{(seasons ?? []).map((s: any) => (<SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 rounded-lg border border-gold/10 bg-navy/30 p-3">
                    <div className="flex items-center justify-between"><Label className="text-xs">Auto-Fill Results</Label><Switch checked={effectiveAutoFill} disabled={!canUseAutoFill} onCheckedChange={(v) => { if (!canUseAutoFill) { toast.error("Auto-fill unlocks with a Pro subscription or a paid chart/PDF purchase."); return; } snapshot(); setAutoFill(v); }} /></div>
                    <p className="text-[11px] text-muted-foreground">{canUseAutoFill ? (effectiveAutoFill ? "Official results fill the chart automatically." : "Manual scores/overrides are preserved and official results will not overwrite them.") : "Locked until account subscription or chart/PDF purchase. Manual mode stays on by default."}</p>
                    {!canUseAutoFill && <Link to="/pricing" className="flex items-center gap-1.5 text-[10px] text-gold/70 hover:text-gold"><Lock className="h-3.5 w-3.5" /> Unlock auto-fill</Link>}
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <span>Official: <b className="text-emerald-300">{resultSummary.official}</b></span>
                      <span>Manual: <b className="text-sky-300">{resultSummary.manual}</b></span>
                      <span>Pending: <b>{resultSummary.pending}</b></span>
                      <span>Needs data: <b className="text-amber-300">{resultSummary.needsData}</b></span>
                    </div>
                    <Button type="button" variant="outline" size="sm" disabled={!canUseAutoFill} onClick={handleRefreshOfficialResults} className="w-full border-gold/20 text-xs text-gold disabled:opacity-40">Refresh official results</Button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-xs">Watermark</Label>
                    {canRemoveWatermark ? (
                      <Switch checked={watermarkEnabled} onCheckedChange={handleWatermarkChange} />
                    ) : (
                      <Link to="/pricing" className="flex items-center gap-1.5 text-[10px] text-gold/70 hover:text-gold"><Lock className="h-3.5 w-3.5" /> Remove watermark with Pro or printable PDF purchase.</Link>
                    )}
                  </div>
                </div>
                <div className="space-y-2"><Label className="text-xs">Zoom ({zoom}%)</Label><Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={25} max={200} step={5} /></div>
              </div>
            )}
            {activePanel === "themes" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Themes</h3><Button variant="ghost" size="sm" onClick={randomizeTheme} className="text-xs"><Shuffle className="mr-1 h-3 w-3" /> Random</Button></div>
                <div className="grid grid-cols-1 gap-2">
                  {(themes ?? []).map((t) => (
                    <button key={t.id} type="button" onClick={() => { snapshot(); setSelectedTheme(t.slug); }} className={`rounded-lg border p-3 text-left transition-all ${selectedTheme === t.slug ? "border-gold bg-gold/10" : "border-glass-border hover:border-gold/30"}`}>
                      <div className="flex items-center justify-between"><span className="text-xs font-semibold">{t.name}</span>{t.is_premium && <span className="text-[10px] text-gold/70">Premium</span>}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activePanel === "background" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Background</h3>
                <div className="glass-panel flex flex-col items-center justify-center rounded-lg border border-dashed border-gold/20 p-6">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground text-center">Upload and adjust a custom background on the background page.</p>
                  <Link to="/editor/$chartId/background" params={{ chartId }}><Button variant="outline" size="sm" className="mt-2 text-xs">Upload Image</Button></Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-glass-border p-3">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(25, zoom - 10))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-glass-border bg-navy/90 px-4 py-2 lg:hidden">
        <Button variant="ghost" size="sm" onClick={handleSave} className="text-xs"><Save className="mr-1 h-3.5 w-3.5" /> Save</Button>
        <Button variant="ghost" size="sm" onClick={randomizeTheme} className="text-xs"><Shuffle className="mr-1 h-3.5 w-3.5" /> Theme</Button>
        <Link to="/editor/$chartId/background" params={{ chartId }}><Button variant="ghost" size="sm" className="text-xs"><Image className="mr-1 h-3.5 w-3.5" /> BG</Button></Link>
        <Link to="/editor/$chartId/print" params={{ chartId }}><Button variant="outline" size="sm" className="border-gold/30 text-gold text-xs"><Download className="mr-1 h-3.5 w-3.5" /> Export</Button></Link>
      </div>
    </main>
  );
}
