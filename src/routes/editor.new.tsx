import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDesigner } from "@/components/builder/LayoutDesigner";
import { createWorldCup2026Project } from "@/lib/builder/worldCup2026Builder";
import { createTournamentTemplate } from "@/lib/builder/genericTemplates";
import { loadCloudProject } from "@/lib/builder/cloudProjects";
import { loadBuilderDrafts } from "@/lib/builder/localDrafts";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/editor/new")({
  validateSearch: (search: Record<string, unknown>): { tournament?: string; season?: string; template?: string; projectId?: string; name?: string; sport?: string; fill?: string } => {
    const result: { tournament?: string; season?: string; template?: string; projectId?: string; name?: string; sport?: string; fill?: string } = {};
    if (typeof search.tournament === "string") result.tournament = search.tournament;
    if (typeof search.season === "string") result.season = search.season;
    if (typeof search.template === "string") result.template = search.template;
    if (typeof search.projectId === "string") result.projectId = search.projectId;
    if (typeof search.name === "string") result.name = search.name;
    if (typeof search.sport === "string") result.sport = search.sport;
    if (typeof search.fill === "string") result.fill = search.fill;
    return result;
  },
  component: EditorNew,
});

function EditorNew() {
  const search = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const localProject = search.projectId ? loadBuilderDrafts().find((draft) => draft.id === search.projectId) ?? null : null;
  const { data: cloudProject, isLoading } = useQuery({
    queryKey: ["builder-project", search.projectId, user?.id],
    queryFn: () => loadCloudProject(search.projectId!),
    enabled: !!search.projectId && !!user,
    retry: 1,
  });

  if (authLoading || (search.projectId && user && isLoading)) {
    return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-[70vh] rounded-xl" /></main>;
  }

  const loadedProject = localProject && cloudProject
    ? (new Date(localProject.updatedAt).getTime() > new Date(cloudProject.updatedAt).getTime() ? localProject : cloudProject)
    : localProject ?? cloudProject ?? null;

  if (search.projectId && !loadedProject) {
    return <main className="mx-auto max-w-3xl px-6 py-14"><Card className="glass-panel border-gold/15"><CardContent className="p-8 text-center"><h1 className="text-3xl font-bold">Project could not be loaded</h1><p className="mt-3 text-muted-foreground">The saved chart may have been deleted, or the cloud connection may be temporarily unavailable.</p><div className="mt-6 flex justify-center gap-3"><Link to="/my-charts"><Button>Back to My Charts</Button></Link><Button variant="outline" onClick={() => window.location.reload()}>Try again</Button></div></CardContent></Card></main>;
  }

  const templateRequested = search.template ?? "";
  const isWorldCupTemplate = templateRequested.startsWith("world-cup-2026") || search.tournament === "world-cup" || search.tournament === "fifa-world-cup";
  let project = loadedProject ?? (isWorldCupTemplate
    ? createWorldCup2026Project("World Cup 2026 wall chart")
    : createTournamentTemplate(templateRequested || "generic-group-knockout", search.name ? `${search.name} wall chart` : "Custom tournament wall chart"));

  if (!search.projectId && search.template) {
    const template = search.template;
    if (["generic-group-knockout", "generic-group-knockout-v2", "school-knockout-16", "five-a-side-league", "round-robin-board", "fa-cup-proper", "league-cup", "premier-league-table", "laliga-league", "champions-league-classic", "euro-24-team"].includes(template)) {
      project = createTournamentTemplate(template, search.name ? `${search.name} wall chart` : undefined);
    } else if (template.includes("classic")) {
      project = { ...project, templateSlug: template, name: "World Cup 2026 · Legacy Classic", theme: "retro", backgroundOpacity: 18 };
    } else if (template.includes("poster")) {
      project = { ...project, templateSlug: template, name: "World Cup 2026 · Tournament Poster", theme: "gold", blocks: project.blocks.map((block) => block.id === "knockout" ? { ...block, x: 3, y: 13, width: 94, height: 72 } : block.id === "front-notes" ? { ...block, x: 25, y: 87, width: 50, height: 10, config: { text: "WORLD CHAMPION: ____________________" } } : block) };
    } else if (template.includes("minimal")) {
      project = { ...project, templateSlug: template, name: "World Cup 2026 · Minimal Print", theme: "light", backgroundOpacity: 0 };
    } else if (template.includes("collector")) {
      project = { ...project, templateSlug: template, name: "World Cup 2026 · Collector's Edition", theme: "gold", blocks: project.blocks.map((block) => block.id === "front-notes" ? { ...block, x: 8, y: 88, width: 84, height: 9, config: { text: "Champion: __________  Golden Boot: __________  Golden Ball: __________  Golden Glove: __________" } } : block) };
    } else {
      project = { ...project, templateSlug: template, name: "World Cup 2026 · Legacy Modern", theme: "midnight" };
    }
  }

  if (!search.projectId && search.tournament) {
    project = {
      ...project,
      sportSlug: search.sport,
      competitionSlug: search.tournament,
      competitionName: search.name,
      seasonSlug: search.season,
      name: `${project.name}${search.fill === "verified" ? " · Verified data" : search.fill === "ai" ? " · AI-assisted draft" : search.fill === "manual" ? " · Manual entry" : ""}`,
    };
  }

  return <LayoutDesigner initialProject={project} />;
}
