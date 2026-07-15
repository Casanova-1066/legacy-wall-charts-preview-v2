import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { authHealthCheck, getAuthDiagnostics, signIn, signUp } from "@/integrations/neon/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

type Props = {
  onDone?: () => void;
  defaultMode?: "signin" | "signup";
  lockMode?: boolean;
};

function passwordScore(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

export function AuthForm({ onDone, defaultMode = "signin", lockMode = false }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const env = useMemo(() => getAuthDiagnostics(), []);
  const strength = passwordScore(password);
  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (mode === "signup") {
      if (password !== confirmPassword) return setError("Passwords do not match.");
      if (!acceptedTerms) return setError("Please accept the Terms and Privacy Policy.");
      if (strength < 2) return setError("Please choose a stronger password.");
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        setInfo("Signed in successfully.");
      } else {
        await signUp(email.trim(), password, name.trim() || undefined);
        setInfo("Account created. Check your inbox if email verification is enabled, then continue to the Workshop.");
      }
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
          <Label htmlFor="auth-name">Full name</Label>
          <Input id="auth-name" required autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input id="auth-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="auth-password">Password</Label>
        <div className="relative">
          <Input id="auth-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {mode === "signup" && (
          <div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 4 }).map((_, index) => <span key={index} className={`h-1.5 rounded-full ${index < strength ? "bg-gold" : "bg-white/10"}`} />)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Password strength: {strengthLabels[strength]}</p>
          </div>
        )}
      </div>

      {mode === "signup" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="auth-confirm-password">Confirm password</Label>
            <Input id="auth-confirm-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 accent-amber-400" />
            <span>I agree to the <Link to="/terms" className="text-gold hover:text-gold-light">Terms</Link> and <Link to="/privacy" className="text-gold hover:text-gold-light">Privacy Policy</Link>.</span>
          </label>
        </>
      )}

      {!env.configured && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100"><AlertCircle className="mr-2 inline h-4 w-4" />VITE_NEON_AUTH_URL is missing. Add it in Vercel, then redeploy.</div>}
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
      {info && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100"><CheckCircle2 className="mr-2 inline h-4 w-4" />{info}</div>}
      {diagnostic && <pre className="whitespace-pre-wrap rounded-lg border border-gold/10 bg-navy/60 p-3 text-xs text-muted-foreground">{diagnostic}</pre>}

      <Button type="submit" className="w-full gold-glow bg-gold text-navy font-semibold hover:bg-gold-light" disabled={loading || !env.configured}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {mode === "signin" ? "Sign in" : "Create free account"}
      </Button>
      {mode === "signin" && <div className="text-right"><Link to="/forgot-password" className="text-xs text-gold hover:text-gold-light">Forgot password?</Link></div>}

      <div className="grid gap-2 sm:grid-cols-2">
        {!lockMode ? (
          <button type="button" className="rounded-md border border-glass-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}>
            {mode === "signin" ? "Create an account" : "Already have an account?"}
          </button>
        ) : (
          <Link to={mode === "signin" ? "/create-account" : "/login"} className="rounded-md border border-glass-border px-3 py-2 text-center text-sm text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Create an account" : "Sign in instead"}
          </Link>
        )}
        <button type="button" className="rounded-md border border-glass-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground" onClick={runDiagnostics} disabled={checking}>{checking ? "Checking…" : "Run auth check"}</button>
      </div>
    </form>
  );
}
