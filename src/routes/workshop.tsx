import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, Globe2, Grid3X3, LayoutTemplate, Newspaper, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/workshop")({ component: Workshop });

const templates = [
  { title: "Legacy Modern", description: "Dark premium flagship design with metallic gold accents and a full front/back World Cup 2026 layout.", status: "Recommended", icon: Sparkles, search: { template: "world-cup-2026-modern", tournament: "world-cup", season: "2026" } },
  { title: "Legacy Classic", description: "A familiar newspaper-inspired layout with clear writing areas and strong stage hierarchy.", status: "Classic", icon: Newspaper, search: { template: "world-cup-2026-classic", tournament: "world-cup", season: "2026" } },
  { title: "Tournament Poster", description: "A presentation-led wall poster with a dominant knockout bracket and large champion panel.", status: "Poster", icon: Trophy, search: { template: "world-cup-2026-poster", tournament: "world-cup", season: "2026" } },
  { title: "Minimal Print", description: "Clean light design for home, school and office printers with reduced ink usage.", status: "Ink friendly", icon: LayoutTemplate, search: { template: "world-cup-2026-minimal", tournament: "world-cup", season: "2026" } },
  { title: "Collector's Edition", description: "Premium layout with more room for notes, awards, venues and tournament facts.", status: "Collector", icon: Globe2, search: { template: "world-cup-2026-collector", tournament: "world-cup", season: "2026" } },
  { title: "Custom blank chart", description: "Start with a flexible group-and-knockout canvas and build your own sports wall chart.", status: "Builder", icon: Grid3X3, search: { template: "generic-group-knockout" } },
];

function Workshop() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section className="mb-10 rounded-3xl border border-gold/15 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,.96),rgba(2,6,23,.94))] p-8 shadow-2xl">
        <Badge className="mb-4 border-gold/30 bg-gold/10 text-gold" variant="outline">World Cup 2026 first release</Badge>
        <h1 className="font-display text-4xl font-black tracking-tight lg:text-6xl">Choose a design, then make it yours.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">Start from one of five original wall-chart styles or create a bespoke layout. Every option supports movable blocks, front/back pages, custom backgrounds, DPI checks and large-format printing.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/editor/new" search={{ template: "world-cup-2026-modern", tournament: "world-cup", season: "2026" }}><Button className="bg-gold text-navy hover:bg-gold-light">Open recommended design <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link to="/historical-builder"><Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10"><Bot className="mr-2 h-4 w-4" /> AI historical fill</Button></Link><Link to="/editor/new" search={{ template: "generic-group-knockout" }}><Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">Create blank chart</Button></Link></div>
      </section>

      <div className="mb-6 flex items-center gap-2"><Grid3X3 className="h-5 w-5 text-gold" /><h2 className="font-display text-2xl font-bold">World Cup 2026 template collection</h2></div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return <Card key={template.title} className="glass-panel border-gold/10 transition hover:border-gold/35"><CardHeader><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10"><Icon className="h-6 w-6 text-gold" /></div><div className="flex items-center justify-between gap-3"><CardTitle className="font-display">{template.title}</CardTitle><Badge variant="outline" className="border-gold/25 text-gold">{template.status}</Badge></div></CardHeader><CardContent><p className="mb-5 min-h-12 text-sm text-muted-foreground">{template.description}</p><Link to="/editor/new" search={template.search as any}><Button variant="outline" className="w-full border-gold/25 text-gold hover:bg-gold/10">Use this design <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent></Card>;
        })}
      </div>
    </main>
  );
}
