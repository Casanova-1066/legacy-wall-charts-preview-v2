import { db } from "@/integrations/neon/client";
import type { BuilderProject } from "./types";

export type CloudBuilderProject = {
  id: string;
  owner_id: string;
  name: string;
  template_slug: string;
  project_data: BuilderProject;
  created_at: string;
  updated_at: string;
};

export async function loadCloudProjects(): Promise<CloudBuilderProject[]> {
  const { data, error } = await db.from<CloudBuilderProject[]>("builder_projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadCloudProject(projectId: string): Promise<BuilderProject | null> {
  const { data, error } = await db.from<CloudBuilderProject>("builder_projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) throw new Error(error.message);
  return data?.project_data ? { ...data.project_data, id: data.id, updatedAt: data.updated_at } : null;
}

export async function saveCloudProject(project: BuilderProject, ownerId: string): Promise<BuilderProject> {
  const now = new Date().toISOString();
  const payload = {
    id: project.id,
    owner_id: ownerId,
    name: project.name.trim() || "Untitled wall chart",
    template_slug: project.templateSlug,
    project_data: { ...project, updatedAt: now },
    updated_at: now,
  };
  const { data, error } = await db.from<CloudBuilderProject>("builder_projects")
    .upsert(payload)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data?.project_data ? { ...data.project_data, id: data.id, updatedAt: data.updated_at } : { ...project, updatedAt: now };
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  const { error } = await db.from("builder_projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
}

export async function duplicateCloudProject(project: BuilderProject, ownerId: string): Promise<BuilderProject> {
  const duplicate: BuilderProject = {
    ...project,
    id: crypto.randomUUID(),
    name: `${project.name} copy`,
    blocks: project.blocks.map((block) => ({ ...block, config: block.config ? structuredClone(block.config) : undefined })),
    updatedAt: new Date().toISOString(),
  };
  return saveCloudProject(duplicate, ownerId);
}
