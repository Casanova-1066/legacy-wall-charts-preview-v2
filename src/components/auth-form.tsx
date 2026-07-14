import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { authHealthCheck, getAuthDiagnostics, signIn, signUp } from "@/integrations/neon/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Props = {
  onDone?: () => void;
  defaultMode?: "signin" | "signup";
};

export function AuthForm({ onDone, defaultMode = "signin" }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const env = useMemo(() => getAuthDiagnostics(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") await signIn(email.trim(), password);
      else await signUp(email.trim(), password, name.trim() || undefined);
      setInfo("Signed in successfully.");
      onDone?.();
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function runDiagnostics() {
    setChecking(true);
    setDiagnostic(null);
    try {
      const result = await authHealthCheck();
      setDiagnostic([
        `Configured: ${result.configured ? "yes" : "no"}`,
        result.origin ? `Current origin: ${result.origin}` : null,
        result.authUrl ? `Auth URL: ${result.authUrl}` : null,
        result.sessionStatus ? `Session status: ${result.sessionStatus}` : null,
        result.message,
      ].filter(Boolean).join("\n"));
    } finally {
      setChecking(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="auth-name">Name</Label>
          <Input id="auth-name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="auth-password">Password</Label>
        <Input
          id="auth-password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {!env.configured && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          VITE_NEON_AUTH_URL is missing. Add it in Vercel, then redeploy.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mr-2 inline h-4 w-4" />{error}
        </div>
      )}
      {info && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />{info}
        </div>
      )}
      {diagnostic && <pre className="whitespace-pre-wrap rounded-lg border border-gold/10 bg-navy/60 p-3 text-xs text-muted-foreground">{diagnostic}</pre>}

      <Button type="submit" className="w-full gold-glow bg-gold text-navy font-semibold hover:bg-gold-light" disabled={loading || !env.configured}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      {mode === "signin" && <div className="text-right"><Link to="/forgot-password" className="text-xs text-gold hover:text-gold-light">Forgot password?</Link></div>}
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-md border border-glass-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <button
          type="button"
          className="rounded-md border border-glass-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={runDiagnostics}
          disabled={checking}
        >
          {checking ? "Checking…" : "Run auth check"}
        </button>
      </div>
    </form>
  );
}
