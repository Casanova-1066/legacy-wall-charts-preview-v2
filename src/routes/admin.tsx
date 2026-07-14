import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Users, FileText, TrendingUp, Settings, Lock, Activity, Database, Cpu, Globe } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });

type AdminSetting = { id: string; key: string; value: boolean };
type Tournament = { id: string; name: string };

function AdminDashboard() {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "admin";

  const { data: adminSettings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await db.from<AdminSetting[]>("admin_settings").select("*");
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
      return data ?? [];
    },
    enabled: isAdmin,
  });

  if (loading) return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-96 rounded-xl" /></main>;

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p className="mt-2 text-muted-foreground">You need admin privileges to access this page.</p>
        <p className="mt-4 text-sm text-muted-foreground">
          To become an admin: register on the site, then update the user role to admin in Neon Auth/database using your admin process.
        </p>
      </main>
    );
  }

  const toggleKeys = [
    { key: "paywall_enabled", label: "Enable Paywall", icon: Lock },
    { key: "subscriptions_enabled", label: "Enable Subscriptions", icon: CreditCard },
    { key: "single_pdf_purchases_enabled", label: "Single PDF Purchases", icon: FileText },
    { key: "free_trial_enabled", label: "Free Trial", icon: TrendingUp },
    { key: "premium_themes_enabled", label: "Premium Themes", icon: Settings },
    { key: "custom_background_uploads_enabled", label: "Custom Background Uploads", icon: ImageIcon },
    { key: "pdf_export_enabled", label: "PDF Export", icon: FileText },
    { key: "public_sharing_enabled", label: "Public Sharing", icon: Globe },
    { key: "registrations_enabled", label: "Enable Registrations", icon: Users },
    { key: "auto_result_filling_enabled", label: "Auto Result Filling", icon: TrendingUp },
    { key: "ai_historical_data_enabled", label: "AI Historical Data", icon: Database },
    { key: "ai_result_updates_enabled", label: "AI Result Updates", icon: Cpu },
    { key: "maintenance_mode", label: "Maintenance Mode", icon: AlertTriangle },
  ];

  function ImageIcon() { return <Settings className="h-4 w-4" />; }
  function CreditCard() { return <TrendingUp className="h-4 w-4" />; }
  function AlertTriangle() { return <Shield className="h-4 w-4" />; }

  async function persistSetting(key: string, value: boolean) {
    if (!user) return;
    const previous = settings[key] ?? false;
    setSettings((p) => ({ ...p, [key]: value }));
    setSavingKey(key);
    try {
      const updated = await db.from<AdminSetting[]>("admin_settings")
        .update({ value, updated_by: user.id, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select("*");

      if (updated.error) throw new Error(updated.error.message);

      if (!updated.data || updated.data.length === 0) {
        const inserted = await db.from("admin_settings")
          .insert({ key, value, updated_by: user.id })
          .select("*")
          .single();
        if (inserted.error) throw new Error(inserted.error.message);
      }

      await db.from("audit_logs").insert({
        user_id: user.id,
        action: "admin_setting_updated",
        resource_type: "admin_settings",
        resource_id: key,
        details: { value },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success(`${key.replace(/_/g, " ")} saved`);
    } catch (err: any) {
      setSettings((p) => ({ ...p, [key]: previous }));
      toast.error(err?.message ?? "Could not save setting");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-gold" />
        <div><h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Manage your platform</p></div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: "-", icon: Users },
          { label: "Charts Created", value: "-", icon: FileText },
          { label: "Tournaments", value: "5", icon: Activity },
          { label: "Revenue", value: "-", icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="glass-panel border-gold/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10"><stat.icon className="h-5 w-5 text-gold" /></div>
              <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings className="h-5 w-5 text-gold" /> Feature Toggles</h2>
            {isLoading ? <Skeleton className="h-64 rounded" /> : (
              <div className="space-y-4">
                {toggleKeys.map((t) => (
                  <div key={t.key} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                    <div className="flex items-center gap-2">
                      <t.icon />
                      <Label className="text-sm cursor-pointer">{t.label}</Label>
                    </div>
                    <Switch
                      checked={settings[t.key] ?? false}
                      disabled={savingKey === t.key}
                      onCheckedChange={(v) => persistSetting(t.key, v)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glass-panel border-gold/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Management</h2>
              <div className="grid gap-2">
                {[
                  { label: "Manage Tournaments", to: "/tournaments" },
                  { label: "Manage Themes", to: "/themes" },
                  { label: "AI Data Logs", to: "/admin/ai-logs" },
                  { label: "Security Audit Logs", to: "/admin/security-logs" },
                ].map((item) => (
                  <Link key={item.to} to={item.to}>
                    <Button variant="ghost" className="w-full justify-start text-sm">{item.label}</Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-gold/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-gold" /> Admin Onboarding</h2>
              <p className="text-sm text-muted-foreground">
                To grant admin access to a user: they must first register on the site, then update their role to admin in Neon Auth/database.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
