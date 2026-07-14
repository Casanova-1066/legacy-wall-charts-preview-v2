import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { Component, type ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import { Toaster } from "@/components/ui/sonner";
import { Home, Trophy, PenLine, Library, User } from "lucide-react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error("[render-error]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">Something went wrong</p>
          <p className="mt-2 text-sm text-muted-foreground">This section could not load. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const MOBILE_NAV = [
  { label: "Home", to: "/", icon: Home },
  { label: "Tournaments", to: "/tournaments", icon: Trophy },
  { label: "Editor", to: "/editor/new", icon: PenLine },
  { label: "Library", to: "/my-library", icon: Library },
  { label: "Account", to: "/account", icon: User },
];

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-right" richColors />
      <SiteHeader />
      <ErrorBoundary>
        <div className="pb-20 lg:pb-0">
          <Outlet />
        </div>
      </ErrorBoundary>
      <footer className="border-t border-glass-border bg-navy/80 backdrop-blur-xl hidden lg:block">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Legacy Wall Charts. A Blood Oath Legacy Product. Wear Your Legacy.
            </p>
            <nav className="flex items-center gap-4">
              {site.footerNav.map((item) => (
                <Link key={item.to} to={item.to} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border bg-navy/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground [&.active]:text-gold"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  ),
});
