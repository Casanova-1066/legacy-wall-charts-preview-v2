import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";

export const Route = createFileRoute("/editor/$chartId/print")({ component: PrintPreview });

function PrintPreview() {
  const { chartId } = Route.useParams();
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState("landscape");
  const [colorMode, setColorMode] = useState("color");
  const [cropMarks, setCropMarks] = useState(false);
  const [bleed, setBleed] = useState(false);

  const { data: entitlement } = useQuery({
    queryKey: ["print-entitlement", chartId],
    queryFn: async () => {
      const { data, error } = await db.rpc<any>("check_watermark_entitlement", { p_chart_id: chartId });
      if (error || !data) return { can_remove_watermark: false };
      return data;
    },
  });

  const canRemoveWatermark = entitlement?.can_remove_watermark ?? false;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link to="/editor/$chartId" params={{ chartId }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Editor
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Print Preview</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            <div className="watermark-overlay relative aspect-[4/3] bg-navy-light rounded-lg flex items-center justify-center">
              {!canRemoveWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                  <span className="text-4xl lg:text-5xl font-black text-white/[0.06] tracking-[0.3em] -rotate-[20deg] whitespace-nowrap">BLOOD OATH LEGACY</span>
                </div>
              )}
              <div className="text-center relative z-10">
                <Printer className="h-12 w-12 text-gold/40 mx-auto mb-3" />
                <p className="font-semibold text-lg">Wall Chart Preview</p>
                <p className="text-sm text-muted-foreground">{paperSize} &middot; {orientation} &middot; {colorMode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glass-panel border-gold/10">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Print Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Paper Size</Label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A4", "A3", "A2", "A1"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Orientation</Label>
                  <Select value={orientation} onValueChange={setOrientation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscape">Landscape</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Color Mode</Label>
                  <Select value={colorMode} onValueChange={setColorMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="bw">Black & White</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Crop Marks</Label>
                  <Switch checked={cropMarks} onCheckedChange={setCropMarks} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Bleed</Label>
                  <Switch checked={bleed} onCheckedChange={setBleed} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-gold/10">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Export</h2>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Resolution: 300 DPI</p>
                {!canRemoveWatermark && (
                  <p className="text-xs text-gold/70">Pro subscribers can remove the watermark — upgrade to Pro to print a clean export.</p>
                )}
                <Button onClick={() => window.print()} className="w-full gold-glow bg-gold text-navy font-semibold hover:bg-gold-light">
                  <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
                <Link to="/checkout" search={{ plan: "single" }}>
                  <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10">
                    <FileText className="mr-2 h-4 w-4" /> Purchase Single PDF (&pound;2.99)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}