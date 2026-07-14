import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/security-logs")({ component: SecurityLogs });

type AuditLog = { id: string; user_id: string | null; action: string; resource_type: string | null; resource_id: string | null; details: any; ip_address: string | null; created_at: string };

function SecurityLogs() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await db.from<AuditLog[]>("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
    enabled: isAdmin,
  });

  if (loading) return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-64 rounded-xl" /></main>;
  if (!isAdmin) return <main className="mx-auto max-w-4xl px-6 py-20 text-center"><Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h1 className="text-2xl font-bold">Admin Access Required</h1></main>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Security Audit Logs</h1>
      <p className="text-muted-foreground mb-8">Track admin actions and suspicious activity</p>
      {isLoading ? <Skeleton className="h-64 rounded-xl" /> : (
        <Card className="glass-panel border-gold/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Resource</th>
                    <th className="px-4 py-3 font-medium">IP</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(data ?? []).length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No audit logs yet.</td></tr>
                  ) : (
                    (data ?? []).map((log) => (
                      <tr key={log.id} className="border-b border-glass-border/50 hover:bg-navy-light/30">
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs">{log.user_id?.slice(0, 8) ?? "-"}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{log.action}</Badge></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{log.resource_type ?? "-"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{log.ip_address ?? "-"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{JSON.stringify(log.details ?? {})}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
