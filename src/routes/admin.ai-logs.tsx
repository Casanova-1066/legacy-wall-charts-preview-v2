import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, Database, ExternalLink } from "lucide-react";
import { VERIFIED_SOURCES } from "@/lib/verifiedSources";

export const Route = createFileRoute("/admin/ai-logs")({ component: AILogs });

type AILog = { id: string; tournament_id: string | null; season_id: string | null; action: string; source_url: string | null; status: string; details: any; created_at: string };

function AILogs() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["ai-logs"],
    queryFn: async () => {
      const { data } = await db.from<AILog[]>("ai_update_logs").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
    enabled: isAdmin,
  });

  if (loading) return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-64 rounded-xl" /></main>;
  if (!isAdmin) return <main className="mx-auto max-w-4xl px-6 py-20 text-center"><Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h1 className="text-2xl font-bold">Admin Access Required</h1></main>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">AI Data Logs</h1>
      <p className="text-muted-foreground mb-8">Track verified imports, AI-assisted data gathering, and result update activities. Use only official/licensed data sources for production imports.</p>
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {VERIFIED_SOURCES.map((source) => (
          <Card key={source.sourceKey} className="glass-panel border-gold/10">
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gold" />
                  <Badge variant="outline" className="text-[10px] uppercase">{source.competitionSlug}</Badge>
                </div>
                <Badge variant="outline" className="text-[10px]">Trust {source.trustLevel}</Badge>
              </div>
              <h2 className="text-sm font-semibold leading-snug">{source.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{source.type === "official" ? "Official verified source" : source.type}</p>
              <a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold hover:underline">Open source <ExternalLink className="h-3 w-3" /></a>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? <Skeleton className="h-64 rounded-xl" /> : (
        <Card className="glass-panel border-gold/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(data ?? []).length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No AI update logs yet.</td></tr>
                  ) : (
                    (data ?? []).map((log) => (
                      <tr key={log.id} className="border-b border-glass-border/50 hover:bg-navy-light/30">
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">{log.action}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{log.source_url ?? "-"}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{log.status}</Badge></td>
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
