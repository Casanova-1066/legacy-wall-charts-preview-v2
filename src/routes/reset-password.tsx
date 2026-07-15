import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resetPassword } from "@/integrations/neon/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : "" }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) return setError("This reset link is missing its token. Request a new link.");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      window.setTimeout(() => navigate({ to: "/my-charts" }), 1000);
    } catch (err: any) {
      setError(err?.message ?? "Could not reset the password. The link may have expired.");
    } finally { setLoading(false); }
  }

  return <main className="mx-auto max-w-md px-6 py-20"><Card className="glass-panel border-gold/10"><CardContent className="p-6">
    <h1 className="text-2xl font-bold">Choose a new password</h1>
    {done ? <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mr-2 inline h-4 w-4" />Password updated. Opening your charts…</div> :
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
      <Button className="w-full bg-gold text-navy hover:bg-gold-light" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update password</Button>
    </form>}
    <Link to="/forgot-password" className="mt-5 block text-center text-sm text-muted-foreground hover:text-gold">Request a new reset link</Link>
  </CardContent></Card></main>;
}
