import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brackets, CalendarDays, Globe2, Layers3, Trophy } from "lucide-react";

export const Route = createFileRoute("/competition-wizard")({ component: CompetitionWizard });

type CompetitionProfile = { id: string; slug: string; sport: string; section: string; name: string; scope: string; region: string; formatSummary: string; typicalParticipants: string; frequency: string; knockoutStructure: string; finalFormat: string; layoutEngine: string; templateSlug: string; priority: string; };

const engineLabels: Record<string, string> = {
  league: "League table",
  "league-playoffs": "League + playoffs",
  "league-final": "League + final",
  knockout: "Knockout",
  "knockout-large": "Large knockout draw",
  "groups-knockout": "Groups + knockout",
  "swiss-knockout": "League phase + knockout",
  "single-match": "Single match",
  "two-leg-tie": "Two-leg tie",
  series: "Series",
  custom: "Custom",
};

function CompetitionWizard() {
  const navigate = useNavigate();
  const { data: profiles = [], isLoading } = useQuery<CompetitionProfile[]>({
    queryKey: ["competition-catalogue"],
    queryFn: async () => {
      const response = await fetch("/competition-catalogue.json");
      if (!response.ok) throw new Error("Competition catalogue could not load.");
      return response.json();
    },
    staleTime: Infinity,
  });
  const sports = useMemo(() => Array.from(new Set(profiles.map((item) => item.sport))), [profiles]);
  const [sport, setSport] = useState("");
  const competitions = useMemo(() => profiles.filter((item) => item.sport === sport), [profiles, sport]);
  const [slug, setSlug] = useState("");
  useEffect(() => { if (!sport && sports[0]) setSport(sports[0]); }, [sport, sports]);
  useEffect(() => { if (!competitions.some((item) => item.slug === slug)) setSlug(competitions[0]?.slug ?? ""); }, [competitions, slug]);
  const selected = profiles.find((item) => item.slug === slug) ?? competitions[0];

  const chooseSport = (next: string) => {
    setSport(next);
    setSlug(profiles.find((item) => item.sport === next)?.slug ?? "");
  };

  const openTemplate = async () => {
    if (!selected) return;
    await navigate({
      to: "/editor/new",
      search: { tournament: selected.slug, template: selected.templateSlug, name: selected.name },
    });
  };

  return <main className="mx-auto max-w-7xl px-6 py-12">
    <section className="mb-8 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,.2),transparent_34%),linear-gradient(135deg,rgba(15,23,42,.98),rgba(2,6,23,.96))] p-8 lg:p-10">
      <Badge variant="outline" className="mb-4 border-gold/30 bg-gold/10 text-gold">83 competition profiles</Badge>
      <h1 className="font-display text-4xl font-black tracking-tight lg:text-5xl">Competition Wizard</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">Choose a sport and competition. Legacy selects the best reusable layout engine, creates an editable draft and opens it in Tournament Studio.</p>
    </section>

    <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <Card className="glass-panel border-gold/15">
        <CardHeader><CardTitle>Choose competition</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <label className="block text-sm font-medium">Sport
            <select value={sport} onChange={(event) => chooseSport(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
              {sports.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Competition
            <select value={selected?.slug ?? ""} onChange={(event) => setSlug(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
              {competitions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <Button className="w-full bg-gold text-navy hover:bg-gold-light" onClick={openTemplate} disabled={!selected || isLoading}>Create editable chart <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Link to="/workshop"><Button variant="outline" className="w-full border-gold/25">Browse generic templates</Button></Link>
        </CardContent>
      </Card>

      {selected && <Card className="glass-panel border-gold/15">
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[.2em] text-gold/70">{selected.sport}</p><CardTitle className="mt-1 font-display text-2xl">{selected.name}</CardTitle></div><Badge variant="outline" className="border-gold/25 text-gold">{engineLabels[selected.layoutEngine] ?? selected.layoutEngine}</Badge></div></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/15 p-4"><Globe2 className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Region</p><p className="font-semibold">{selected.region}</p></div>
            <div className="rounded-xl border border-white/10 bg-black/15 p-4"><Trophy className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Scope</p><p className="font-semibold">{selected.scope}</p></div>
            <div className="rounded-xl border border-white/10 bg-black/15 p-4"><Layers3 className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Typical field</p><p className="font-semibold">{selected.typicalParticipants}</p></div>
            <div className="rounded-xl border border-white/10 bg-black/15 p-4"><CalendarDays className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Frequency</p><p className="font-semibold">{selected.frequency}</p></div>
          </div>
          <div className="rounded-xl border border-gold/15 bg-gold/5 p-4"><Brackets className="mb-2 h-5 w-5 text-gold" /><p className="font-semibold">Format</p><p className="mt-1 text-sm text-muted-foreground">{selected.formatSummary}</p></div>
          <div className="grid gap-3 md:grid-cols-2"><div><p className="text-sm font-semibold">Knockout path</p><p className="mt-1 text-sm text-muted-foreground">{selected.knockoutStructure}</p></div><div><p className="text-sm font-semibold">Final format</p><p className="mt-1 text-sm text-muted-foreground">{selected.finalFormat}</p></div></div>
          <p className="text-xs text-muted-foreground">This profile is planning data. Historical or paid charts must verify the rules for the selected season before publication.</p>
        </CardContent>
      </Card>}
    </div>
  </main>;
}
