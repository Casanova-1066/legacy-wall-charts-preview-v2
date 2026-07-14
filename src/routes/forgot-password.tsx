import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { requestPasswordReset } from "@/integrations/neon/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      await requestPasswordReset(email.trim(), redirectTo);
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="mx-auto max-w-md px-6 py-20">
    <Card className="glass-panel border-gold/10"><CardContent className="p-6">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the email used for your Legacy Wall Charts account.</p>
      {sent ? <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mr-2 inline h-4 w-4" />Check your inbox. The reset link expires after 15 minutes.</div> :
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2"><Label htmlFor="reset-email">Email</Label><Input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
        <Button className="w-full bg-gold text-navy hover:bg-gold-light" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send reset link</Button>
      </form>}
      <Link to="/login" className="mt-5 block text-center text-sm text-muted-foreground hover:text-gold">Back to sign in</Link>
    </CardContent></Card>
  </main>;
}
