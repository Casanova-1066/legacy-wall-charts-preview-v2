import { Link, useNavigate } from "@tanstack/react-router";
import { site } from "@/content/site";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/integrations/neon/auth";
import { useAssets } from "@/lib/asset";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, User, LogOut, Shield, Library } from "lucide-react";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const { src } = useAssets();

  return (
    <header className="sticky top-0 z-50 border-b border-glass-border bg-navy/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={src("logos/blood-oath-legacy.png")}
            alt="Blood Oath Legacy"
            className="h-10 w-10 rounded-full object-cover border border-gold/30"
          />
          <span className="text-lg font-bold tracking-tight font-display">
            <span className="text-gold">Legacy</span>{" "}
            <span className="text-foreground">Wall Charts</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-navy-light hover:text-foreground [&.active]:text-gold"
            >
              {item.label}
            </Link>
          ))}
          {user && (<>
            <Link
              to="/my-charts"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-navy-light hover:text-foreground [&.active]:text-gold"
            >
              My Charts
            </Link>
            <Link to="/my-library" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-navy-light hover:text-foreground [&.active]:text-gold">My Library</Link>
          </>)}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-navy-light" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-xs text-gold hover:text-gold-light">
                    <Shield className="mr-1 h-3.5 w-3.5" /> Admin
                  </Button>
                </Link>
              )}
              <Link to="/account">
                <Button variant="ghost" size="sm" className="text-xs">
                  <User className="mr-1 h-3.5 w-3.5" /> {user.email?.split("@")[0]}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => signOut().then(() => navigate({ to: "/" }))}
              >
                <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-glass-border bg-navy/95 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col px-4 py-3">
            {[...site.nav, ...(user ? [{ label: "My Charts", to: "/my-charts" }, { label: "My Library", to: "/my-library" }] : [])].map(
              (item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-navy-light hover:text-foreground [&.active]:text-gold"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="rounded-md px-3 py-2 text-sm text-gold" onClick={() => setMenuOpen(false)}>
                    <Shield className="mr-1 inline h-3.5 w-3.5" /> Admin Dashboard
                  </Link>
                )}
                <Link to="/account" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>
                  <User className="mr-1 inline h-3.5 w-3.5" /> Account
                </Link>
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground"
                  onClick={() => { signOut().then(() => { setMenuOpen(false); navigate({ to: "/" }); }); }}
                >
                  <LogOut className="mr-1 inline h-3.5 w-3.5" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-md px-3 py-2 text-sm text-gold" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
