import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/integrations/neon/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, Database, FileWarning, ShieldCheck, Upload } from 'lucide-react';

export const Route = createFileRoute('/admin/historical-import')({ component: HistoricalImportAdmin });

type Batch = {
  id: string;
  label: string;
  status: string;
  total_records: number;
  accepted_records: number;
  rejected_records: number;
  warnings: number;
  created_at: string;
};

type Issue = { id: string; severity: string; message: string; field_path?: string | null; created_at: string };

function HistoricalImportAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { data, isLoading } = useQuery({
    queryKey: ['historical-import-dashboard'],
    enabled: isAdmin,
    queryFn: async () => {
      const batches = await db.from<Batch[]>('historical_import_batches').select('*').order('created_at', { ascending: false }).limit(20);
      const issues = await db.from<Issue[]>('verification_issues').select('*').eq('resolved', false).order('created_at', { ascending: false }).limit(20);
      if (batches.error) throw new Error(batches.error.message);
      if (issues.error) throw new Error(issues.error.message);
      return { batches: batches.data ?? [], issues: issues.data ?? [] };
    },
  });

  if (loading) return <main className="mx-auto max-w-7xl px-6 py-12"><Skeleton className="h-96 rounded-xl" /></main>;
  if (!isAdmin) return <main className="mx-auto max-w-4xl px-6 py-20 text-center"><ShieldCheck className="mx-auto mb-4 h-14 w-14 text-muted-foreground" /><h1 className="text-2xl font-bold">Admin access required</h1></main>;

  return <main className="mx-auto max-w-7xl px-6 py-12">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Badge variant="outline" className="mb-3 border-gold/30 text-gold">Verification first</Badge><h1 className="font-display text-4xl font-black">Historical Import Centre</h1><p className="mt-2 max-w-3xl text-muted-foreground">Incoming data stays in staging until names, seasons, results, sources and conflicts have been reviewed. Only approved records can populate public charts.</p></div><Link to="/admin"><Button variant="outline">Back to Admin Studio</Button></Link></div>

    <div className="mb-8 grid gap-4 md:grid-cols-4">{[
      { label: 'Staged batches', value: data?.batches.length ?? 0, icon: Database },
      { label: 'Open issues', value: data?.issues.length ?? 0, icon: AlertTriangle },
      { label: 'Published directly', value: 0, icon: CheckCircle2 },
      { label: 'Unsafe auto-imports', value: 0, icon: FileWarning },
    ].map((item) => <Card key={item.label} className="glass-panel border-gold/10"><CardContent className="flex items-center gap-3 p-5"><item.icon className="h-6 w-6 text-gold" /><div><p className="text-2xl font-black">{item.value}</p><p className="text-xs text-muted-foreground">{item.label}</p></div></CardContent></Card>)}</div>

    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="glass-panel border-gold/15"><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-gold" /> Import workflow</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-muted-foreground"><p>1. Upload or paste source data into a new staging batch.</p><p>2. Normalise competition, team and player names against aliases.</p><p>3. Reject malformed, duplicated, future-looking or contradictory records.</p><p>4. Attach trusted sources and resolve every blocker.</p><p>5. Approve summary outcomes and awards.</p><p>6. Publish only verified records to the Historical Library.</p><div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-amber-100">The supplied historical file is useful as staging input, but it contains truncated and contradictory records. It will not be published automatically.</div></CardContent></Card>

      <Card className="glass-panel border-gold/15"><CardHeader><CardTitle>Recent batches</CardTitle></CardHeader><CardContent>{isLoading ? <Skeleton className="h-48" /> : data?.batches.length ? <div className="space-y-3">{data.batches.map((batch) => <div key={batch.id} className="rounded-xl border border-white/10 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{batch.label}</p><Badge variant="outline">{batch.status}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{batch.accepted_records} accepted · {batch.warnings} warnings · {batch.rejected_records} rejected</p></div>)}</div> : <p className="text-sm text-muted-foreground">No import batches yet. The staging schema is ready for the first controlled import.</p>}</CardContent></Card>
    </div>

    <Card className="glass-panel mt-6 border-gold/15"><CardHeader><CardTitle>Open verification issues</CardTitle></CardHeader><CardContent>{data?.issues.length ? <div className="space-y-2">{data.issues.map((issue) => <div key={issue.id} className="rounded-lg border border-white/10 p-3"><div className="flex items-center gap-2"><Badge variant="outline">{issue.severity}</Badge><p className="text-sm font-medium">{issue.message}</p></div>{issue.field_path && <p className="mt-1 text-xs text-muted-foreground">Field: {issue.field_path}</p>}</div>)}</div> : <p className="text-sm text-muted-foreground">No unresolved issues recorded yet.</p>}</CardContent></Card>
  </main>;
}
