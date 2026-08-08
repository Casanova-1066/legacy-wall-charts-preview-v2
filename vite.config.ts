import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Static SPA build (NO SSR). `vite build` → dist/ (index.html + assets/*).
// dist/ is what we upload to GCS (preview) / R2 (publish). No server runs.
//
// Vercel serves this SPA from the domain root. Absolute asset URLs are
// required so direct visits to nested routes (and "open in new tab") load
// `/assets/*` instead of incorrectly resolving `/tournaments/assets/*`.
export default defineConfig({
  base: "/",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }), // file-based routes → routeTree.gen.ts
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
