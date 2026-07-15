import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDesigner } from "@/components/builder/LayoutDesigner";
import { createWorldCup2026Project } from "@/lib/builder/worldCup2026Builder";
import { loadCloudProject } from "@/lib/builder/cloudProjects";
import { loadBuilderDrafts } from "@/lib/builder/localDrafts";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/editor/new")({
  validateSearch: (search: Record<string, unknown>): { tournament?: string; season?: string; template?: string; projectId?: string } => {
    const result: { tournament?: string; season?: string; template?: string; projectId?: string } = {};
    if (typeof search.tournament === "string") result.tournament = search.tournament;
    if (typeof search.season === "string") result.season = search.season;
    if (typeof search.template === "string") result.template = search.template;
    if (typeof search.projectId === "string") result.projectId = search.projectId;
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
    enabled: !!search.projectId && !!user && !localProject,
    retry: 1,
  });

  if (authLoading || (search.projectId && user && !localProject && isLoading)) {
    return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-[70vh] rounded-xl" /></main>;
  }

  let project = localProject ?? cloudProject ?? createWorldCup2026Project(
    search.template === "world-cup-2026" || search.tournament === "world-cup" ? "World Cup 2026 wall chart" : "Custom blank wall chart",
  );

  if (!search.projectId && search.template) {
    const template = search.template;
    if (template === "generic-group-knockout") {
      project = { ...project, templateSlug: template, name: "Custom blank wall chart", blocks: project.blocks.map((block) => block.id === "front-title" ? { ...block, label: "Title", config: { text: "Custom wall chart", subtitle: "Build your own tournament" } } : block) };
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

  return <LayoutDesigner initialProject={project} />;
}
