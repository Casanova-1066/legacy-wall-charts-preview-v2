import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/create-account")({ component: CreateAccount });

function CreateAccount() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/workshop" }); }, [user, navigate]);
  if (loading) return <main className="mx-auto max-w-4xl px-6 py-20"><div className="h-96 animate-pulse rounded-xl bg-navy-light" /></main>;
  if (user) return null;

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-6 py-16 lg:grid-cols-[1fr_440px] lg:items-center">
      <section>
        <Badge className="mb-4 border-gold/20 bg-gold/10 text-gold">Free Legacy account</Badge>
        <h1 className="font-display text-4xl font-black tracking-tight lg:text-6xl">Create, save and collect your wall charts.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">Create a free account to save projects in the cloud, purchase templates, sync between devices and keep every chart you own in My Library.</p>
        <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {["Cloud project saving", "Permanent purchase library", "Access across devices", "PDF credits and billing"].map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold" />{item}</div>)}
        </div>
      </section>
      <Card className="glass-panel border-gold/10"><CardContent className="p-6"><div className="mb-6 text-center"><h2 className="font-display text-3xl font-bold">Create Account</h2><p className="mt-1 text-sm text-muted-foreground">Start free. Upgrade only when you need clean exports or premium products.</p></div><AuthForm defaultMode="signup" lockMode onDone={() => navigate({ to: "/workshop" })} /><p className="mt-5 text-center text-xs text-muted-foreground">Already registered? <Link to="/login" className="text-gold hover:text-gold-light">Sign in</Link></p></CardContent></Card>
    </main>
  );
}
