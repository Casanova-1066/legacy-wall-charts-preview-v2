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

  if (!search.projectId && search.template && search.template !== "world-cup-2026") {
    project = { ...project, templateSlug: search.template, name: "Custom blank wall chart", blocks: project.blocks.map((block) => block.id === "title" ? { ...block, label: "Title", config: { text: "Custom wall chart" } } : block) };
  }

  return <LayoutDesigner initialProject={project} />;
}
