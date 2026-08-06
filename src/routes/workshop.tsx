import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, Brackets, Grid3X3, LayoutDashboard, Medal, School, Sparkles, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/workshop")({ component: Workshop });

const communityTemplates = [
  { title: "School Knockout 16", description: "Sixteen movable match cards for school, workplace or friends tournaments. Duplicate or remove any match.", badge: "Most flexible", icon: School, search: { template: "school-knockout-16" } },
  { title: "5-a-side League", description: "League table, fixture list, semi-finals and final for local 5-a-side competitions.", badge: "League + finals", icon: Users, search: { template: "five-a-side-league" } },
  { title: "Group + Knockout", description: "Four editable groups plus individually movable quarter-final, semi-final and final cards.", badge: "All-rounder", icon: Grid3X3, search: { template: "generic-group-knockout-v2" } },
  { title: "Round Robin Board", description: "A clean standings and fixtures board for clubs, classrooms and social leagues.", badge: "Simple", icon: LayoutDashboard, search: { template: "round-robin-board" } },
];

const premiumTemplates = [
  { title: "Legacy Modern World Cup", description: "Dark Blood Oath Legacy styling, group-stage back page and a premium knockout front page.", badge: "Flagship", icon: Sparkles, search: { template: "world-cup-2026-modern", tournament: "world-cup", season: "2026" } },
  { title: "Legacy Classic World Cup", description: "A readable newspaper-inspired design with large score areas and traditional hierarchy.", badge: "Classic", icon: Brackets, search: { template: "world-cup-2026-classic", tournament: "world-cup", season: "2026" } },
  { title: "Collector Poster", description: "Presentation-led poster with champion, awards and tournament facts panels.", badge: "Collector", icon: Medal, search: { template: "world-cup-2026-collector", tournament: "world-cup", season: "2026" } },
];

function TemplateGrid({ items }: { items: typeof communityTemplates }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((template) => {
    const Icon = template.icon;
    return <Card key={template.title} className="glass-panel overflow-hidden border-gold/10 transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5">
      <div className="h-28 border-b border-gold/10 bg-[radial-gradient(circle_at_25%_20%,rgba(212,168,67,.22),transparent_35%),linear-gradient(135deg,#071126,#020617)] p-5"><Icon className="h-10 w-10 text-gold" /></div>
      <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="font-display">{template.title}</CardTitle><Badge variant="outline" className="border-gold/25 text-gold">{template.badge}</Badge></div></CardHeader>
      <CardContent><p className="mb-5 min-h-12 text-sm text-muted-foreground">{template.description}</p><Link to="/editor/new" search={template.search as any}><Button className="w-full bg-gold text-navy hover:bg-gold-light">Open editable template <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent>
    </Card>;
  })}</div>;
}

function Workshop() {
  return <main className="mx-auto max-w-7xl px-6 py-12">
    <section className="mb-12 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,.2),transparent_34%),linear-gradient(135deg,rgba(15,23,42,.98),rgba(2,6,23,.96))] p-8 shadow-2xl lg:p-12">
      <Badge className="mb-4 border-gold/30 bg-gold/10 text-gold" variant="outline">Fresh template workshop</Badge>
      <h1 className="font-display text-4xl font-black tracking-tight lg:text-6xl">Build any tournament board.</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">Start with a polished Blood Oath Legacy template, then move every match card, resize it, duplicate it or remove it. Designed for major tournaments, school competitions, friends leagues and 5-a-side football.</p>
      <div className="mt-7 flex flex-wrap gap-3"><Link to="/competition-wizard"><Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10"><Grid3X3 className="mr-2 h-4 w-4" /> Competition wizard</Button></Link><Link to="/editor/new" search={{ template: "school-knockout-16" }}><Button className="bg-gold text-navy hover:bg-gold-light"><Trophy className="mr-2 h-4 w-4" /> Start a tournament</Button></Link><Link to="/historical-builder"><Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10"><Bot className="mr-2 h-4 w-4" /> AI historical fill</Button></Link></div>
    </section>

    <div className="mb-5 flex items-center gap-2"><Grid3X3 className="h-5 w-5 text-gold" /><h2 className="font-display text-2xl font-bold">Create your own competition</h2></div>
    <TemplateGrid items={communityTemplates} />
    <div className="mb-5 mt-14 flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold" /><h2 className="font-display text-2xl font-bold">Premium tournament posters</h2></div>
    <TemplateGrid items={premiumTemplates as any} />
  </main>;
}
