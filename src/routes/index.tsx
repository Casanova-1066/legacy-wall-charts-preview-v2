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
import { ArrowRight, Trophy, Palette, FileText, Zap, Star, Search, PenTool, Printer, Users } from "lucide-react";

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

const TESTIMONIALS = [
  { quote: "Finally a wall chart that looks as good as the football itself. The gold theme is stunning.", name: "James M." },
  { quote: "Used this for our pub's World Cup sweepstake. Everyone wanted to keep it after the tournament.", name: "Sarah K." },
  { quote: "The custom background upload made it personal. Gave one to my dad for Father's Day.", name: "Daniel R." },
];

function Home() {
  const { src } = useAssets();
  const competitions = useCompetitions();

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
      {/* Hero */}
      <section className="hero-gradient texture-overlay relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,67,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src={src("logos/blood-oath-legacy.png")}
                  alt="Blood Oath Legacy"
                  className="h-14 w-14 rounded-full object-cover border-2 border-gold/40 gold-glow"
                />
                <div>
                  <Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold text-xs mb-1">
                    Powered by Blood Oath Legacy
                  </Badge>
                  <p className="text-xs text-copper/80 italic">Wear Your Legacy</p>
                </div>
              </div>
              <h1 className="font-display text-4xl font-black tracking-tight lg:text-6xl">
                Create Your{" "}
                <span className="gold-gradient">Legacy</span>
                <br />
                <span className="text-2xl lg:text-3xl font-semibold text-muted-foreground">Premium Football Wall Charts</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Browse real tournaments, customise every detail, and export stunning print-ready wall charts. Built for the true football fan.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/editor/new" search={{ tournament: undefined, season: undefined }}>
                  <Button size="lg" className="gold-glow bg-gold text-navy font-semibold hover:bg-gold-light font-display text-lg">
                    Create Wall Chart <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/tournaments">
                  <Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                    Browse Tournaments
                  </Button>
                </Link>
              </div>
            </div>
            <div className="glass-panel watermark-overlay relative rounded-xl p-1 aspect-[4/3] flex items-center justify-center overflow-hidden copper-glow">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-5xl lg:text-6xl font-black text-white/[0.04] tracking-[0.3em] -rotate-[20deg] whitespace-nowrap font-display">BLOOD OATH LEGACY</span>
              </div>
              <div className="relative z-10 w-full h-full bg-navy-light/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <img src={src("logos/blood-oath-legacy.png")} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-gold/20 mx-auto opacity-60" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Sample Wall Chart Preview</p>
                  <div className="grid grid-cols-2 gap-2 px-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-7 rounded bg-navy border border-gold/10" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-glass-border bg-navy/30">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to your perfect wall chart</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 copper-glow">
                  <s.icon className="h-8 w-8 text-gold" />
                </div>
                <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold">{i + 1}</div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">Tournament Library</h2>
          <p className="mt-2 text-muted-foreground">Choose from verified football tournaments with real documented results</p>
        </div>
        {competitions.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {competitions.map((t) => (
              <Link key={t.id} to="/tournaments/$tournamentId" params={{ tournamentId: t.slug }}>
                <Card className="glass-panel h-full cursor-pointer border-gold/10 transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                      <Trophy className="h-7 w-7 text-gold" />
                    </div>
                    <h3 className="font-semibold text-sm">{t.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">{t.type} &middot; {t.country}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="border-t border-glass-border bg-navy/30">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight">What Fans Say</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="glass-panel border-gold/10">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-xs font-semibold text-gold">&mdash; {t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-glass-border bg-navy/50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need</h2>
            <p className="mt-2 text-muted-foreground">Professional wall chart creation tools at your fingertips</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="glass-panel border-gold/10">
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                    <f.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Themes Preview */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Premium Themes</h2>
          <p className="mt-2 text-muted-foreground">Stunning built-in themes to make your chart stand out</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(themes ?? []).slice(0, 4).map((t) => (
            <Card key={t.id} className="glass-panel overflow-hidden border-gold/10">
              <div className="aspect-[16/10] bg-navy-light flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{t.name}</span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                  {t.is_premium && (
                    <Badge variant="outline" className="border-gold/30 text-gold text-[10px]">Premium</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/themes">
            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
              View All Themes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-glass-border">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
          <h2 className="font-display text-4xl font-bold tracking-tight">Create Your Legacy</h2>
          <p className="mt-3 text-muted-foreground text-lg">Start with a tournament, pick a theme, and make it yours. Wear your legacy.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/editor/new" search={{ tournament: undefined, season: undefined }}>
              <Button size="lg" className="gold-glow bg-gold text-navy font-semibold hover:bg-gold-light font-display text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
