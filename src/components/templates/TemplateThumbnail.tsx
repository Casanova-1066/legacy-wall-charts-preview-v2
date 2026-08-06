import { cn } from "@/lib/utils";

type TemplateThumbnailProps = {
  styleId: string;
  sport?: string;
  className?: string;
};

const sportBackground: Record<string, string> = {
  football: "/backgrounds/football-stadium.svg",
  soccer: "/backgrounds/football-stadium.svg",
  tennis: "/backgrounds/tennis-court.svg",
  rugby: "/backgrounds/rugby-stadium.svg",
  cricket: "/backgrounds/cricket-ground.svg",
};

function backgroundForSport(sport = "") {
  const normalized = sport.toLowerCase();
  const key = Object.keys(sportBackground).find((candidate) => normalized.includes(candidate));
  return key ? sportBackground[key] : "/backgrounds/football-stadium.svg";
}

export function TemplateThumbnail({ styleId, sport, className }: TemplateThumbnailProps) {
  const photoStyle = styleId === "stadium" || styleId === "collector";
  const minimal = styleId === "minimal";
  const newspaper = styleId === "newspaper";
  const retro = styleId === "retro" || styleId === "classic";
  const dark = styleId === "dark";

  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden rounded-lg border border-gold/15 p-3",
        minimal && "bg-slate-100 text-slate-900",
        newspaper && "bg-[#e7dfc8] text-slate-950",
        retro && "bg-[#5b321d] text-amber-50",
        dark && "bg-gradient-to-br from-slate-950 via-[#101b30] to-black text-white",
        !minimal && !newspaper && !retro && !dark && "bg-gradient-to-br from-[#11233d] to-[#08111f] text-white",
        className,
      )}
      style={photoStyle ? {
        backgroundImage: `linear-gradient(rgba(5,12,24,.48), rgba(5,12,24,.72)), url(${backgroundForSport(sport)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : undefined}
    >
      <div className="mb-2 flex items-center justify-between text-[7px] font-black uppercase tracking-[0.18em] opacity-80">
        <span>Legacy Wall Charts</span>
        <span>{styleId}</span>
      </div>
      <div className={cn("grid h-[calc(100%-1rem)] gap-1", styleId === "collector" ? "grid-cols-4" : "grid-cols-3")}>
        {Array.from({ length: styleId === "collector" ? 8 : 6 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "rounded border",
              minimal && "border-slate-400 bg-white/75",
              newspaper && "border-slate-700/50 bg-white/35",
              retro && "border-amber-300/35 bg-black/15",
              !minimal && !newspaper && !retro && "border-white/15 bg-black/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
