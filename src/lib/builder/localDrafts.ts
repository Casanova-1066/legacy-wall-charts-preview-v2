import type { BuilderProject } from "./types";

const STORAGE_KEY = "legacy-wallcharts-platform-v2-drafts";

export function loadBuilderDrafts(): BuilderProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuilderDraft(project: BuilderProject) {
  if (typeof window === "undefined") return;
  const drafts = loadBuilderDrafts().filter((draft) => draft.id !== project.id);
  const next = [{ ...project, updatedAt: new Date().toISOString() }, ...drafts].slice(0, 25);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteBuilderDraft(projectId: string) {
  if (typeof window === "undefined") return;
  const next = loadBuilderDrafts().filter((draft) => draft.id !== projectId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
