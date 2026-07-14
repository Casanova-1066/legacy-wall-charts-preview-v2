// Asset helpers for Legacy Wall Charts.
//
// If VITE_ASSET_BASE_URL is set, relative asset paths are resolved against it.
// If it is empty, relative paths are served from the same site root.
// Full URLs, data URLs, blob URLs, and same-origin paths pass through unchanged.
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";

const BASE = (import.meta.env.VITE_ASSET_BASE_URL || "").replace(/\/+$/, "");

/** Low-level: build a public CDN URL for a relative asset path.
 *  Values that are already resolvable are returned unchanged: absolute URLs,
 *  protocol-relative URLs, data URLs, blob URLs, and same-origin paths.
 *  Bare relative paths are prefixed with VITE_ASSET_BASE_URL when it is set.
 */
export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) {
    return path;
  }
  return `${BASE}/${path.replace(/^\/+/, "")}`;
}

export type Asset = {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number | null;
  mime: string | null;
};

/**
 * The site's media catalog. If you later move assets to R2/Supabase Storage, keep this table updated.
 * Returns the full list plus `src(nameOrPath)` to resolve one URL. `src` falls back to
 * `assetUrl()` (same value) while the query loads or for an unknown ref, so images never
 * block on the fetch.
 */
export function useAssets() {
  const query = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await db.from<Asset[]>("assets").select("id,name,path,url,size,mime");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });
  const assets = query.data ?? [];
  const src = (ref: string) => assets.find((a) => a.path === ref || a.name === ref)?.url ?? assetUrl(ref);
  return { assets, src, isLoading: query.isLoading };
}
