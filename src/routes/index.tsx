import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { useAssets } from "@/lib/asset";
import { useCompetitions } from "@/lib/hooks/useTournamentEngine";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, Palette, FileText, Zap, Star, Search, PenTool, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

type Theme = { id: string; slug: string; name: string; description: string; preview_path: string | null; is_premium: boolean };

const FEATURES = [
  { icon: Palette, title: "Customise Everything", desc: "Edit team names, scores, dates, titles, colours and fonts. Every element is yours to control." },
  { icon: FileText, title: "Export Print-Ready PDFs", desc: "High-resolution PDFs in A3 to A1 sizes. Portrait or landscape, with bleed and crop marks." },
  { icon: Zap, title: "Auto-fill Results", desc: "Enable automatic result filling from documented tournament data. Winners progress automatically." },
  { icon: Star, title: "Premium Themes", desc: "Seven built-in themes from Stadium Lights to Heritage. Upload your own background too." },
];

const STEPS = [
  { icon: Search, title: "Browse", desc: "Pick from verified football tournaments with real documented results." },
  { icon: PenTool, title: "Customise", desc: "Choose a theme, edit names & scores, upload backgrounds. Make it yours." },
  { icon: Printer, title: "Print", desc: "Export high-resolution PDFs in A3, A2 or A1 sizes. Print-ready quality." },
];

const SHOWCASE = [
  { title: "FIFA World Cup", sport: "Football", format: "Groups + knockout", theme: "from-emerald-950 via-slate-950 to-sky-950", accent: "border-emerald-400/35" },
  { title: "Premier League", sport: "Football", format: "League table + fixtures", theme: "from-purple-950 via-slate-950 to-fuchsia-950", accent: "border-fuchsia-400/35" },
  { title: "Wimbledon", sport: "Tennis", format: "128-player knockout draw", theme: "from-green-950 via-slate-950 to-lime-950", accent: "border-lime-400/35" },
  { title: "Rugby World Cup", sport: "Rugby Union", format: "Pools + knockout", theme: "from-red-950 via-slate-950 to-amber-950", accent: "border-red-400/35" },
  { title: "Cricket World Cup", sport: "Cricket", format: "League + finals", theme: "from-blue-950 via-slate-950 to-cyan-950", accent: "border-cyan-400/35" },
];

const TESTIMONIALS = [
  { quote: "Finally a wall chart that looks as good as the football itself. The gold theme is stunning.", name: "James M." },
  { quote: "Used this for our pub's World Cup sweepstake. Everyone wanted to keep it after the tournament.", name: "Sarah K." },
  { quote: "The custom background upload made it personal. Gave one to my dad for Father's Day.", name: "Daniel R." },
];

function Home() {
  const { src } = useAssets();
  const competitions = useCompetitions();
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setShowcaseIndex((current) => (current + 1) % SHOWCASE.length), 4500);
    return () => window.clearInterval(timer);
  }, []);
  const showcase = SHOWCASE[showcaseIndex];

  const { data: themes } = useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await db.from<Theme[]>("themes").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  return (
    <main className="page-transition">
      <section className="hero-gradient texture-overlay relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,67,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src="/legacy-mark.svg" alt="Blood Oath Legacy" className="h-14 w-14 rounded-full object-cover border-2 border-gold/40 gold-glow" />
                <div><Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold text-xs mb-1">Powered by Blood Oath Legacy</Badge><p className="text-xs text-copper/80 italic">Wear Your Legacy</p></div>
              </div>
              <h1 className="font-display text-4xl font-black tracking-tight lg:text-6xl">Create Your <span className="gold-gradient">Legacy</span><br /><span className="text-2xl lg:text-3xl font-semibold text-muted-foreground">Premium Football Wall Charts</span></h1>
              <p className="text-lg text-muted-foreground max-w-lg">Browse real tournaments, customise every detail, and export stunning print-ready wall charts. Built for the true football fan.</p>
              <div className="flex flex-wrap gap-3"><Link to="/editor/new" search={{ tournament: undefined, season: undefined }}><Button size="lg" className="gold-glow bg-gold text-navy font-semibold hover:bg-gold-light font-display text-lg">Create Wall Chart <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link to="/tournaments"><Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">Browse Tournaments</Button></Link></div>
            </div>
            <div className="glass-panel relative aspect-[4/3] overflow-hidden rounded-xl border border-gold/20 p-2 copper-glow">
              <div className={`relative h-full overflow-hidden rounded-lg bg-gradient-to-br ${showcase.theme} p-5 transition-all duration-700`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.12),transparent_45%)]" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.28em] text-white/55">{showcase.sport}</p><h3 className="mt-1 font-display text-2xl font-black text-white">{showcase.title}</h3><p className="mt-1 text-xs text-white/60">{showcase.format}</p></div><img src="/legacy-mark.svg" alt="Legacy Wall Charts" className="h-12 w-12 rounded-full border border-gold/30 bg-slate-950/70 p-1" /></div>
                  <div className="my-5 grid flex-1 grid-cols-4 gap-2">{Array.from({ length: 12 }).map((_, i) => <div key={i} className={`rounded-md border ${showcase.accent} bg-black/25 p-1.5`}><div className="mb-1 h-1.5 w-2/3 rounded bg-white/35"/><div className="h-1.5 w-1/2 rounded bg-white/15"/></div>)}</div>
                  <div className="flex items-center justify-between"><button type="button" aria-label="Previous preview" onClick={() => setShowcaseIndex((showcaseIndex - 1 + SHOWCASE.length) % SHOWCASE.length)} className="rounded-full border border-white/15 bg-black/25 p-2 text-white hover:bg-black/40"><ChevronLeft className="h-4 w-4"/></button><div className="flex gap-1.5">{SHOWCASE.map((item, i) => <button type="button" key={item.title} aria-label={`Show ${item.title}`} onClick={() => setShowcaseIndex(i)} className={`h-1.5 rounded-full transition-all ${i === showcaseIndex ? "w-7 bg-gold" : "w-2 bg-white/25"}`} />)}</div><button type="button" aria-label="Next preview" onClick={() => setShowcaseIndex((showcaseIndex + 1) % SHOWCASE.length)} className="rounded-full border border-white/15 bg-black/25 p-2 text-white hover:bg-black/40"><ChevronRight className="h-4 w-4"/></button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-glass-border bg-navy/30"><div className="mx-auto max-w-7xl px-6 py-16 lg:py-24"><div className="mb-12 text-center"><h2 className="font-display text-4xl font-bold tracking-tight">How It Works</h2><p className="mt-2 text-muted-foreground">Three simple steps to your perfect wall chart</p></div><div className="grid gap-8 sm:grid-cols-3">{STEPS.map((s, i) => <div key={s.title} className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 copper-glow"><s.icon className="h-8 w-8 text-gold" /></div><div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold">{i + 1}</div><h3 className="font-display text-xl font-bold">{s.title}</h3><p className="mt-2 text-sm text-muted-foreground">{s.desc}</p></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24"><div className="mb-10 text-center"><h2 className="font-display text-4xl font-bold tracking-tight">Tournament Library</h2><p className="mt-2 text-muted-foreground">Choose from verified football tournaments with real documented results</p></div>{competitions.length === 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{competitions.map((t) => <Link key={t.id} to="/tournaments/$tournamentId" params={{ tournamentId: t.slug }}><Card className="glass-panel h-full cursor-pointer border-gold/10 transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"><CardContent className="flex flex-col items-center justify-center p-6 text-center h-full"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10"><Trophy className="h-7 w-7 text-gold" /></div><h3 className="font-semibold text-sm">{t.name}</h3><p className="mt-1 text-xs text-muted-foreground capitalize">{t.type} &middot; {t.country}</p></CardContent></Card></Link>)}</div>}</section>

      <section className="border-t border-glass-border bg-navy/30"><div className="mx-auto max-w-7xl px-6 py-16 lg:py-24"><div className="mb-10 text-center"><h2 className="font-display text-4xl font-bold tracking-tight">What Fans Say</h2></div><div className="grid gap-6 sm:grid-cols-3">{TESTIMONIALS.map((t) => <Card key={t.name} className="glass-panel border-gold/10"><CardContent className="p-6"><div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div><p className="text-sm italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p><p className="mt-4 text-xs font-semibold text-gold">&mdash; {t.name}</p></CardContent></Card>)}</div></div></section>

      <section className="border-t border-glass-border bg-navy/50"><div className="mx-auto max-w-7xl px-6 py-16 lg:py-24"><div className="mb-10 text-center"><h2 className="text-3xl font-bold tracking-tight">Everything You Need</h2><p className="mt-2 text-muted-foreground">Professional wall chart creation tools at your fingertips</p></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{FEATURES.map((f) => <Card key={f.title} className="glass-panel border-gold/10"><CardContent className="p-6"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10"><f.icon className="h-5 w-5 text-gold" /></div><h3 className="font-semibold">{f.title}</h3><p className="mt-1 text-sm text-muted-foreground">{f.desc}</p></CardContent></Card>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24"><div className="mb-10 text-center"><h2 className="text-3xl font-bold tracking-tight">Premium Themes</h2><p className="mt-2 text-muted-foreground">Stunning built-in themes to make your chart stand out</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(themes ?? []).slice(0, 4).map((t) => <Card key={t.id} className="glass-panel overflow-hidden border-gold/10"><div className="aspect-[16/10] bg-navy-light flex items-center justify-center"><span className="text-xs text-muted-foreground">{t.name}</span></div><CardContent className="p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{t.name}</h3>{t.is_premium && <Badge variant="outline" className="border-gold/30 text-gold text-[10px]">Premium</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{t.description}</p></CardContent></Card>)}</div><div className="mt-6 text-center"><Link to="/themes"><Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">View All Themes <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div></section>

      <section className="border-t border-glass-border"><div className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24"><h2 className="font-display text-4xl font-bold tracking-tight">Create Your Legacy</h2><p className="mt-3 text-muted-foreground text-lg">Start with a tournament, pick a theme, and make it yours. Wear your legacy.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/editor/new" search={{ tournament: undefined, season: undefined }}><Button size="lg" className="gold-glow bg-gold text-navy font-semibold hover:bg-gold-light font-display text-lg">Get Started Free</Button></Link><Link to="/pricing"><Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">View Plans</Button></Link></div></div></section>
    </main>
  );
}
