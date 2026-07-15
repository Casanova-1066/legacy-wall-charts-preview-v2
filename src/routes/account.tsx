import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { authHealthCheck, signOut } from "@/integrations/neon/auth";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { User, Key, CreditCard, Trash2, LogOut, ArrowRight, ShieldCheck, FileText, History, Activity } from "lucide-react";
import { productById } from "@/lib/commerce/products";
import { creditText, fetchAccountSummary, type AccountSummary } from "@/lib/account-summary";
import { openCustomerPortal } from "@/lib/commerce/api";
import { fetchPlatformHealth, type PlatformHealth } from "@/lib/platform-health";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"profile" | "password" | "billing" | "diagnostics" | "danger">("profile");
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth | null>(null);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);

  useEffect(() => {
    if (!user) { setAccountSummary(null); return; }
    setAccountLoading(true);
    setAccountError(null);
    fetchAccountSummary()
      .then(setAccountSummary)
      .catch((error: any) => setAccountError(error?.message || "Account details could not be loaded."))
      .finally(() => setAccountLoading(false));
  }, [user]);

  if (loading) return <main className="mx-auto max-w-4xl px-6 py-12"><Skeleton className="h-96 rounded-xl" /></main>;

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="mt-2 text-muted-foreground">Sign in to manage your account, purchases and PDF credits.</p>
        <Link to="/login"><Button className="mt-4 gold-glow bg-gold text-navy font-semibold">Sign In</Button></Link>
      </main>
    );
  }

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Key },
    { id: "billing", label: "Billing & Credits", icon: CreditCard },
    { id: "diagnostics", label: "Auth Diagnostics", icon: Activity },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  async function runDiagnostics() {
    setChecking(true);
    try {
      const [result, platform] = await Promise.all([authHealthCheck(), fetchPlatformHealth().catch(() => null)]);
      setPlatformHealth(platform);
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
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
      <p className="mb-8 text-muted-foreground">Manage your Legacy Wall Charts profile, credits and purchases.</p>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1 lg:border-r lg:border-glass-border lg:pr-4">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${tab === t.id ? "bg-gold/10 text-gold" : "text-muted-foreground hover:bg-navy-light hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <hr className="my-2 border-glass-border" />
          <Link to="/pricing" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-gold"><CreditCard className="h-4 w-4" /> Upgrade Plan</Link>
          <button type="button" onClick={() => signOut().then(() => navigate({ to: "/" }))} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive"><LogOut className="h-4 w-4" /> Sign Out</button>
        </nav>

        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            {tab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Profile</h2>
                <div className="space-y-2"><Label>Profile Photo</Label><ImageUpload label="Upload avatar" onChange={() => {}} /></div>
                <div className="space-y-2"><Label>Name</Label><Input defaultValue={user.name ?? user.email?.split("@")[0]} /></div>
                <div className="space-y-2"><Label>Email</Label><Input defaultValue={user.email ?? ""} disabled /></div>
                <Button className="bg-gold text-navy font-semibold hover:bg-gold-light">Save Changes</Button>
              </div>
            )}
            {tab === "password" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Password</h2>
                <p className="text-sm text-muted-foreground">Password reset/change endpoints will be wired when the final Neon Auth flow is confirmed. For now, use Neon Auth's recovery flow or create a new test account if locked out.</p>
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" disabled placeholder="Coming in Stripe/Auth integration sprint" /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" disabled placeholder="Coming soon" /></div>
              </div>
            )}
            {tab === "billing" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="text-lg font-semibold">Billing & Credits</h2><p className="text-sm text-muted-foreground">Verified purchases and memberships are loaded securely from Neon after Stripe confirms payment.</p></div>
                  <div className="flex gap-2"><Button variant="outline" size="sm" className="border-gold/30 text-gold text-xs" onClick={async () => { try { const { url } = await openCustomerPortal(); window.location.assign(url); } catch (e: any) { toast.error(e?.message || "Billing portal unavailable"); } }}>Manage billing</Button><Link to="/pricing"><Button variant="outline" size="sm" className="border-gold/30 text-gold text-xs">Upgrade <ArrowRight className="ml-1 h-3 w-3" /></Button></Link></div>
                </div>
                {accountLoading && <div className="h-28 animate-pulse rounded-lg bg-navy-light" />}
                {accountError && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{accountError}</div>}
                {accountSummary && (<>
                  <Card className="border-gold/15 bg-navy/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current plan</p>
                    <p className="mt-1 text-lg font-semibold text-gold">{accountSummary.plan?.label ?? "Free"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{accountSummary.plan ? `${accountSummary.plan.status}${accountSummary.plan.currentPeriodEnd ? ` · renews/ends ${new Date(accountSummary.plan.currentPeriodEnd).toLocaleDateString()}` : ""}` : "No paid membership is active."}</p>
                  </Card>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border-gold/10 bg-navy/50 p-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-gold" /><div><p className="font-semibold">PDF credits</p><p className="text-sm text-muted-foreground">{creditText(accountSummary.credits.pdf)}</p></div></div></Card>
                    <Card className="border-gold/10 bg-navy/50 p-4"><div className="flex items-center gap-3"><History className="h-5 w-5 text-gold" /><div><p className="font-semibold">Historical credits</p><p className="text-sm text-muted-foreground">{creditText(accountSummary.credits.historical)}</p></div></div></Card>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Owned products</h3>
                    {accountSummary.purchases.length ? (
                      <div className="space-y-2">
                        {accountSummary.purchases.map((purchase) => { const product = productById(purchase.product_key); return <div key={purchase.id} className="flex items-center justify-between rounded-lg border border-gold/10 bg-navy/40 p-3 text-sm"><div><span>{product.name}</span>{purchase.resource_id && <p className="text-xs text-muted-foreground">{purchase.resource_id}</p>}</div><span className="text-emerald-400">Owned</span></div>; })}
                      </div>
                    ) : <p className="text-sm text-muted-foreground">No verified purchases yet.</p>}
                  </div>
                </>)}
              </div>
            )}
            {tab === "diagnostics" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Auth Diagnostics</h2>
                <p className="text-sm text-muted-foreground">Use this if sign-in fails on Vercel. It checks whether the deployed app can reach the configured Neon Auth URL from the current origin.</p>
                <Button onClick={runDiagnostics} disabled={checking} className="bg-gold text-navy font-semibold hover:bg-gold-light">{checking ? "Checking…" : "Run auth diagnostics"}</Button>
                {diagnostic && <pre className="whitespace-pre-wrap rounded-lg border border-gold/10 bg-navy/60 p-4 text-xs text-muted-foreground">{diagnostic}</pre>}
                {platformHealth && <div className="grid gap-2 sm:grid-cols-2">{Object.entries(platformHealth.checks).map(([key, check]: [string, { ok: boolean; detail?: string }]) => <div key={key} className={`rounded-lg border p-3 text-xs ${check.ok ? "border-emerald-500/25 bg-emerald-500/5" : "border-destructive/25 bg-destructive/5"}`}><div className="flex items-center justify-between gap-2"><span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</span><span className={check.ok ? "text-emerald-400" : "text-destructive"}>{check.ok ? "Ready" : "Missing"}</span></div>{check.detail && <p className="mt-1 text-muted-foreground">{check.detail}</p>}</div>)}</div>}
                <div className="rounded-lg border border-gold/10 bg-navy/40 p-4 text-sm text-muted-foreground"><ShieldCheck className="mr-2 inline h-4 w-4 text-gold" />Trusted origins should include https://www.legacywallcharts.com, https://legacywallcharts.com and any active Vercel preview domain you test from. Stripe webhook readiness only turns green after STRIPE_WEBHOOK_SECRET is added.</div>
              </div>
            )}
            {tab === "danger" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
                <Card className="border-destructive/30 bg-destructive/5 p-4"><p className="text-sm font-semibold">Delete Account</p><p className="text-xs text-muted-foreground mt-1">Permanent deletion will be connected after the account data model is finalized.</p><Button variant="destructive" size="sm" className="mt-3" disabled><Trash2 className="mr-1 h-3 w-3" /> Delete Account</Button></Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
