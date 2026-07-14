import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/integrations/neon/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ImageUpload } from "@/components/image-upload";
import { ArrowLeft, Image, Upload, Shield, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/editor/$chartId/background")({ component: BackgroundUpload });

function BackgroundUpload() {
  const { chartId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [opacity, setOpacity] = useState(80);
  const [scale, setScale] = useState(100);
  const [blur, setBlur] = useState(0);
  const [bgUrl, setBgUrl] = useState("");

  const { data: chart } = useQuery({
    queryKey: ["chart", chartId],
    queryFn: async () => {
      const { data, error } = await db.from<any>("wall_charts").select("*").eq("id", chartId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!chartId,
  });

  useEffect(() => {
    const background = chart?.pdf_config?.background ?? {};
    if (background.url) setBgUrl(background.url);
    if (typeof background.opacity === "number") setOpacity(background.opacity);
    if (typeof background.scale === "number") setScale(background.scale);
    if (typeof background.blur === "number") setBlur(background.blur);
  }, [chart]);

  const saveBackground = async () => {
    if (!user) { toast.error("Sign in to save backgrounds"); return; }
    const pdf_config = {
      ...(chart?.pdf_config ?? {}),
      background: { url: bgUrl, opacity, scale, blur },
    };
    const { error } = await db.from("wall_charts").update({ pdf_config }).eq("id", chartId).select("*").single();
    if (error) { toast.error(error.message || "Could not save background"); return; }
    if (bgUrl) {
      await db.from("uploaded_backgrounds").insert({ owner_id: user.id, chart_id: chartId, file_path: bgUrl, file_name: bgUrl.split("/").pop() || "background", crop_settings: { opacity, scale, blur } }).select("*").single();
    }
    await queryClient.invalidateQueries({ queryKey: ["chart", chartId] });
    toast.success("Background saved");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/editor/$chartId" params={{ chartId }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Editor
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Background</h1>
      <p className="text-muted-foreground mb-8">Add a custom background image to your wall chart</p>

      <div className="space-y-6">
        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Upload className="h-5 w-5 text-gold" /> Upload Image</h2>
            <ImageUpload value={bgUrl} onChange={setBgUrl} label="Choose background image" />
            <p className="mt-3 text-xs text-muted-foreground">Accepted formats: JPG, PNG, WebP. Max size: 10MB.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Image className="h-5 w-5 text-gold" /> Adjustments</h2>
            {bgUrl ? (
              <div className="mb-6 aspect-[4/3] rounded-lg overflow-hidden border border-gold/10 bg-navy-light">
                <img
                  src={bgUrl}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                  style={{ opacity: opacity / 100, transform: `scale(${scale / 100})`, filter: `blur(${blur}px)` }}
                />
              </div>
            ) : (
              <div className="mb-6 aspect-[4/3] rounded-lg border border-dashed border-gold/10 bg-navy-light flex items-center justify-center text-sm text-muted-foreground">Upload an image to preview it here.</div>
            )}
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-sm">Opacity ({opacity}%)</Label><Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={0} max={100} step={1} /></div>
              <div className="space-y-2"><Label className="text-sm">Scale ({scale}%)</Label><Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={10} max={200} step={1} /></div>
              <div className="space-y-2"><Label className="text-sm">Blur ({blur}px)</Label><Slider value={[blur]} onValueChange={([v]) => setBlur(v)} min={0} max={20} step={1} /></div>
            </div>
            <Button onClick={saveBackground} className="mt-6 gold-glow bg-gold text-navy font-semibold hover:bg-gold-light"><Save className="mr-2 h-4 w-4" /> Save Background</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-gold/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-gold" /> Security</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Uploaded images should be stored securely and only accessible by the owning user.</li>
              <li>For launch, replace temporary in-browser data URL storage with Supabase Storage, UploadThing or Cloudflare R2.</li>
              <li>Files must be validated for type and size before launch.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
