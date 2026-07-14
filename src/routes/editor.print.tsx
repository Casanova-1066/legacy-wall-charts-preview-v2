import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, LockKeyhole, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrintableProject } from "@/components/builder/PrintableProject";
import { loadBuilderDrafts } from "@/lib/builder/localDrafts";
import { loadCommerceEntitlements } from "@/lib/commerce/entitlements";
import type { BuilderPage, BuilderProject } from "@/lib/builder/types";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/editor/print")({
  validateSearch: (search: Record<string, unknown>): { projectId?: string } => ({ projectId: typeof search.projectId === "string" ? search.projectId : undefined }),
  component: BuilderPrint,
});

function BuilderPrint() {
  const { projectId } = Route.useSearch();
  const { user } = useAuth();
  const [side, setSide] = useState<BuilderPage | "both">("both");
  const [entitled, setEntitled] = useState(false);
  const project = useMemo<BuilderProject | null>(() => loadBuilderDrafts().find((draft) => draft.id === projectId) ?? null, [projectId]);

  useEffect(() => {
    let active = true;
    if (!user || !project) { setEntitled(false); return; }
    loadCommerceEntitlements().then(({ purchases, subscriptions }) => {
      if (!active) return;
      const subscriptionActive = subscriptions.some((subscription) => ["active", "trialing"].includes(subscription.status));
      const lifetime = purchases.some((purchase) => purchase.product_id === "lifetime" && purchase.status === "active");
      const templateOwned = purchases.some((purchase) => purchase.product_id === "blank-template" && purchase.status === "active" && (!purchase.resource_id || purchase.resource_id === project.templateSlug));
      setEntitled(subscriptionActive || lifetime || templateOwned);
    }).catch(() => setEntitled(false));
    return () => { active = false; };
  }, [project, user]);

  if (!project) return <main className="mx-auto max-w-3xl px-6 py-14"><h1 className="text-3xl font-bold">Project not found</h1><p className="mt-3 text-muted-foreground">Save the project as a local draft before opening print preview.</p><Link to="/my-charts"><Button className="mt-6">Back to My Charts</Button></Link></main>;

  const pages: BuilderPage[] = side === "both" ? ["front", "back"] : [side];
  const printNow = () => window.print();

  return <main className="min-h-screen bg-navy px-4 py-6 print:bg-white print:p-0">
    <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-4 print:hidden"><div><Link to="/editor/new" search={{ template: project.templateSlug }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Back to workshop</Link><h1 className="mt-2 text-3xl font-bold">Print & PDF preview</h1><p className="text-sm text-muted-foreground">{project.name} · {project.printSize.toUpperCase()} · {project.orientation}</p></div><Button onClick={printNow} className="bg-gold text-navy hover:bg-gold-light"><Download className="mr-2 h-4 w-4" /> Print / Save as PDF</Button></div>

    <div className="mx-auto mb-6 grid max-w-6xl gap-4 md:grid-cols-[1fr_320px] print:hidden"><Card className="glass-panel border-gold/10"><CardContent className="p-5"><label className="text-xs text-muted-foreground">Pages to export</label><Select value={side} onValueChange={(value) => setSide(value as BuilderPage | "both")}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="both">Front and back</SelectItem><SelectItem value="front">Front only</SelectItem><SelectItem value="back">Back only</SelectItem></SelectContent></Select></CardContent></Card><Card className="glass-panel border-gold/10"><CardContent className="p-5">{entitled ? <div className="flex gap-3 text-sm"><Printer className="h-5 w-5 text-emerald-400" /><div><p className="font-semibold text-emerald-300">Clean export unlocked</p><p className="text-muted-foreground">This account owns the template or has an active plan.</p></div></div> : <div className="flex gap-3 text-sm"><LockKeyhole className="h-5 w-5 text-gold" /><div><p className="font-semibold text-gold">Watermarked preview</p><p className="text-muted-foreground">Buy this template once for £3.99, or use an active membership.</p><Link to="/checkout" search={{ product: "blank-template", resource: project.templateSlug } as any}><Button size="sm" variant="outline" className="mt-3 border-gold/30 text-gold">Unlock clean exports</Button></Link></div></div>}</CardContent></Card></div>

    <div className="print-pages mx-auto flex max-w-full flex-col items-center gap-8 overflow-auto print:block print:overflow-visible">
      {pages.map((page) => <PrintableProject key={page} project={project} page={page} watermarked={!entitled} />)}
    </div>
  </main>;
}
