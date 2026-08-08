import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import "./editor-readability.css";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

// Earlier beta builds installed a cache-first service worker which can keep
// serving stale SPA HTML for nested routes forever. The current Vercel build
// does not need offline navigation, so remove any legacy worker and its caches
// as soon as a fresh application bundle is reached.
if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) =>
    Promise.all(registrations.map((registration) => registration.unregister())),
  );
}
if ("caches" in window) {
  void caches.keys().then((keys) =>
    Promise.all(keys.filter((key) => key.startsWith("legacy-wallcharts-")).map((key) => caches.delete(key))),
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
