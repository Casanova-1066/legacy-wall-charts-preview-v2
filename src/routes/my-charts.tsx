import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit3, Copy, Trash2, FolderOpen, Cloud, HardDrive, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { deleteBuilderDraft, loadBuilderDrafts, saveBuilderDraft } from "@/lib/builder/localDrafts";
import { deleteCloudProject, duplicateCloudProject, loadCloudProjects, saveCloudProject } from "@/lib/builder/cloudProjects";
import type { BuilderProject } from "@/lib/builder/types";

export const Route = createFileRoute("/my-charts")({ component: MyCharts });

function ProjectCard({ project, cloud, onDuplicate, onDelete }: { project: BuilderProject; cloud: boolean; onDuplicate: () => void; onDelete: () => void }) {
  return <Card className="glass-panel border-gold/10"><CardContent className="p-5">
    <div className="relative mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <span className="pointer-events-none absolute -rotate-[20deg] select-none text-xl font-black tracking-[.2em] text-white/[.05]">LEGACY</span>
      <span className="relative text-sm text-white/65">{project.templateSlug === "world-cup-2026" ? "World Cup 2026" : "Custom chart"}</span>
    </div>
    <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{project.name}</h3><span className="flex items-center gap-1 text-[10px] text-muted-foreground">{cloud ? <Cloud className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}{cloud ? "Cloud" : "Device"}</span></div>
    <p className="mt-1 text-xs text-muted-foreground">Updated {new Date(project.updatedAt).toLocaleString()}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <Link to="/editor/new" search={{ projectId: project.id }}><Button variant="outline" size="sm"><Edit3 className="mr-1 h-3 w-3" />Edit</Button></Link>
      <Button variant="ghost" size="sm" onClick={onDuplicate}><Copy className="mr-1 h-3 w-3" />Duplicate</Button>
      <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}><Trash2 className="mr-1 h-3 w-3" />Delete</Button>
    </div>
  </CardContent></Card>;
}

function MyCharts() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const localDrafts = loadBuilderDrafts();
  const { data: cloudRows, isLoading } = useQuery({ queryKey: ["builder-projects", user?.id], queryFn: loadCloudProjects, enabled: !!user });
  const cloudProjects = (cloudRows ?? []).map((row) => ({ ...row.project_data, id: row.id, updatedAt: row.updated_at }));
  const localOnly = localDrafts.filter((local) => !cloudProjects.some((cloud) => cloud.id === local.id));

  async function migrateLocalDrafts() {
    if (!user || localOnly.length === 0) return;
    try {
      await Promise.all(localOnly.map((project) => saveCloudProject(project, user.id)));
      await queryClient.invalidateQueries({ queryKey: ["builder-projects"] });
      toast.success(`${localOnly.length} local ${localOnly.length === 1 ? "draft" : "drafts"} copied to your account`);
    } catch (error: any) { toast.error(error?.message ?? "Could not upload local drafts"); }
  }

  if (loading) return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-64 rounded-xl" /></main>;
  const count = cloudProjects.length + localOnly.length;

  return <main className="mx-auto max-w-7xl px-6 py-12">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">My Charts</h1><p className="mt-2 text-muted-foreground">{count} saved {count === 1 ? "project" : "projects"}</p></div><div className="flex gap-2">{user && localOnly.length > 0 && <Button variant="outline" onClick={migrateLocalDrafts}><UploadCloud className="mr-2 h-4 w-4" />Copy device drafts to cloud</Button>}<Link to="/editor/new"><Button className="bg-gold text-navy hover:bg-gold-light"><Plus className="mr-2 h-4 w-4" />New Chart</Button></Link></div></div>
    {!user && <Card className="mb-6 border-gold/20 bg-gold/5"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><p className="text-sm">Your device drafts are available below. Sign in to sync them across devices.</p><Link to="/login" search={{ returnTo: "/my-charts" }}><Button size="sm" variant="outline">Sign in</Button></Link></CardContent></Card>}
    {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div> : count === 0 ? <Card className="glass-panel border-gold/10 p-12 text-center"><FolderOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" /><h2 className="text-xl font-semibold">No charts yet</h2><p className="mt-1 text-muted-foreground">Create the first World Cup 2026 wall chart.</p><Link to="/editor/new" search={{ template: "world-cup-2026" }}><Button className="mt-4 bg-gold text-navy hover:bg-gold-light"><Plus className="mr-1 h-4 w-4" />Create chart</Button></Link></Card> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cloudProjects.map((project) => <ProjectCard key={`cloud-${project.id}`} project={project} cloud onDuplicate={async () => { if (!user) return; await duplicateCloudProject(project, user.id); await queryClient.invalidateQueries({ queryKey: ["builder-projects"] }); toast.success("Project duplicated"); }} onDelete={async () => { if (!confirm(`Delete “${project.name}”?`)) return; await deleteCloudProject(project.id); await queryClient.invalidateQueries({ queryKey: ["builder-projects"] }); toast.success("Project deleted"); }} />)}
      {localOnly.map((project) => <ProjectCard key={`local-${project.id}`} project={project} cloud={false} onDuplicate={() => { const copy = { ...project, id: `local-${Date.now()}`, name: `${project.name} copy`, updatedAt: new Date().toISOString() }; saveBuilderDraft(copy); window.location.reload(); }} onDelete={() => { if (!confirm(`Delete “${project.name}”?`)) return; deleteBuilderDraft(project.id); window.location.reload(); }} />)}
    </div>}
  </main>;
}
