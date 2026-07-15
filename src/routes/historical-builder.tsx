import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HISTORICAL_COMPETITIONS, getCatalogSeasons } from '@/lib/catalog';
import { useAuth } from '@/hooks/use-auth';
import { getAccessToken } from '@/integrations/neon/auth';
import { createHistoricalAiDraft } from '@/lib/builder/historicalAi';
import { saveBuilderDraft } from '@/lib/builder/localDrafts';
import { Bot, CheckCircle2, Database, Loader2, LockKeyhole, Sparkles } from 'lucide-react';

export const Route = createFileRoute('/historical-builder')({ component: HistoricalBuilder });

function HistoricalBuilder() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [competition, setCompetition] = useState('fifa-world-cup');
  const seasons = useMemo(() => getCatalogSeasons(competition), [competition]);
  const [season, setSeason] = useState('2022');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!user) {
      setStatus('Sign in first. AI Historical Fill is available to Pro Monthly, Pro Yearly and Lifetime accounts.');
      return;
    }
    setBusy(true);
    setStatus('Checking subscription and preparing verified historical data…');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Your session could not be verified. Sign in again.');
      const response = await fetch('/api/ai/historical-fill', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ competition, season }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'AI Historical Fill could not start.');
      const project = createHistoricalAiDraft(competition, season);
      saveBuilderDraft(project);
      setStatus('Draft prepared. Opening the editor…');
      await navigate({ to: '/editor/new', search: { projectId: project.id } });
    } catch (error: any) {
      setStatus(error?.message || 'AI Historical Fill could not start.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-8 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,.98),rgba(2,6,23,.96))] p-8">
        <Badge className="mb-4 border-gold/30 bg-gold/10 text-gold" variant="outline"><Sparkles className="mr-1 h-3.5 w-3.5" /> Pro AI feature</Badge>
        <h1 className="font-display text-4xl font-black tracking-tight lg:text-5xl">AI Historical Chart Builder</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">Choose a competition and season. Legacy maps verified catalogue data into an editable wall-chart draft, then flags anything that still needs human review before publishing.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <Card className="glass-panel border-gold/15">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-gold" /> Build a historical draft</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <label className="block text-sm font-medium">Competition
              <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" value={competition} onChange={(event) => { const next = event.target.value; setCompetition(next); setSeason(getCatalogSeasons(next)[0]?.slug || ''); }}>
                {HISTORICAL_COMPETITIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Season
              <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" value={season} onChange={(event) => setSeason(event.target.value)}>
                {seasons.map((item) => <option key={item.slug} value={item.slug}>{item.name}{item.verified ? ' · verified summary' : ''}</option>)}
              </select>
            </label>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-muted-foreground">
              AI Fill creates a reviewable draft from data already held by Legacy. It does not silently invent missing match results. Unverified sections remain clearly marked for review.
            </div>
            <Button className="w-full bg-gold text-navy hover:bg-gold-light" disabled={busy || loading || !season} onClick={generate}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} AI Fill historical chart
            </Button>
            {status && <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm">{status}</p>}
            {!user && !loading && <Link to="/login"><Button variant="outline" className="w-full border-gold/25 text-gold"><LockKeyhole className="mr-2 h-4 w-4" /> Sign in to continue</Button></Link>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glass-panel border-gold/10"><CardContent className="p-5"><Database className="mb-3 h-6 w-6 text-gold" /><h2 className="font-semibold">Verified-data first</h2><p className="mt-2 text-sm text-muted-foreground">Competition, season, winner, runner-up and available result summaries come from the curated catalogue before AI lays out the chart.</p></CardContent></Card>
          <Card className="glass-panel border-gold/10"><CardContent className="p-5"><CheckCircle2 className="mb-3 h-6 w-6 text-emerald-400" /><h2 className="font-semibold">Included plans</h2><p className="mt-2 text-sm text-muted-foreground">AI Historical Fill is included with Pro Monthly, Pro Yearly and Lifetime. Free and one-off customers can still buy completed historical charts individually.</p><Link to="/pricing"><Button variant="link" className="mt-2 h-auto p-0 text-gold">View pricing</Button></Link></CardContent></Card>
        </div>
      </div>
    </main>
  );
}
