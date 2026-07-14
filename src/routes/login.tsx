import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string; mode?: "signin" | "signup" };
  const returnTo = search.returnTo && search.returnTo.startsWith("/") ? search.returnTo : "/my-charts";

  useEffect(() => {
    if (user) navigate({ to: returnTo as any });
  }, [user, navigate, returnTo]);

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <div className="h-64 animate-pulse rounded-xl bg-navy-light" />
      </main>
    );
  }

  if (user) return null;

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <Card className="glass-panel border-gold/10">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <Badge className="mb-3 bg-gold/10 text-gold border-gold/20">Legacy account</Badge>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to save charts, unlock purchases and manage PDF credits.</p>
          </div>
          <AuthForm defaultMode={search.mode ?? "signin"} onDone={() => navigate({ to: returnTo as any })} />
          <div className="mt-4 text-center">
            <Link to="/pricing" className="text-xs text-muted-foreground hover:text-gold">View plans and one-time purchases</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
