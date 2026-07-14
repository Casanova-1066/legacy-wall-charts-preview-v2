import type { BuilderBlock, BuilderPage, BuilderProject } from "@/lib/builder/types";
import { getCanvasDimensions } from "@/lib/printSizes";

function groupLetters(startGroup: string, groupCount: number) {
  const start = Math.max(0, startGroup.toUpperCase().charCodeAt(0) - 65);
  return Array.from({ length: groupCount }, (_, index) => String.fromCharCode(65 + start + index));
}

function BlockContent({ block }: { block: BuilderBlock }) {
  if (block.type === "title") {
    return <div className="flex h-full flex-col items-center justify-center p-3 text-center"><div className="text-[clamp(14px,2.4vw,34px)] font-black uppercase tracking-[.08em] text-white">{String(block.config?.text ?? block.label)}</div><div className="mt-1 text-[clamp(8px,1vw,14px)] uppercase tracking-[.24em] text-white/70">{String(block.config?.subtitle ?? "")}</div></div>;
  }
  if (block.type === "notes" || block.type === "text") {
    return <div className="flex h-full items-center justify-center p-3 text-center text-[clamp(7px,.9vw,13px)] text-white/85">{String(block.config?.text ?? "Editable text")}</div>;
  }
  if (block.type === "group-stage") {
    const startGroup = String(block.config?.startGroup ?? "A");
    const groupCount = Number(block.config?.groupCount ?? 4);
    const teamsPerGroup = Number(block.config?.teamsPerGroup ?? 4);
    const teamsMap = (block.config?.teams as Record<string, string[]> | undefined) ?? {};
    return <div className="grid h-full gap-2 overflow-hidden p-2" style={{ gridTemplateRows: `repeat(${groupCount}, minmax(0, 1fr))` }}>
      {groupLetters(startGroup, groupCount).map((group) => {
        const teams = teamsMap[group] ?? Array.from({ length: teamsPerGroup }, (_, index) => `Team ${group}${index + 1}`);
        return <section key={group} className="min-h-0 overflow-hidden rounded border border-white/35 bg-black/35">
          <div className="bg-white/10 px-2 py-1 text-center text-[clamp(8px,.8vw,12px)] font-black uppercase tracking-[.16em] text-amber-300">Group {group}</div>
          <div className="grid grid-cols-[1fr_repeat(8,minmax(14px,24px))] border-t border-white/25 text-[clamp(5px,.55vw,8px)] font-semibold text-white/70"><span className="px-1">Team</span>{["P","W","D","L","GF","GA","GD","Pts"].map((heading) => <span key={heading} className="border-l border-white/20 text-center">{heading}</span>)}</div>
          {teams.slice(0, teamsPerGroup).map((team, index) => <div key={`${group}-${index}`} className="grid grid-cols-[1fr_repeat(8,minmax(14px,24px))] border-t border-white/20 text-[clamp(6px,.65vw,9px)]"><span className="truncate px-1 py-[2px]">{team}</span>{Array.from({ length: 8 }).map((_, cell) => <span key={cell} className="border-l border-white/15 text-center">&nbsp;</span>)}</div>)}
          {Boolean(block.config?.showFixtures ?? true) && <div className="border-t border-white/25 px-1 py-1 text-[clamp(5px,.55vw,8px)] text-white/60">Fixtures / scores: ______________________________________________</div>}
        </section>;
      })}
    </div>;
  }
  if (block.type === "knockout") {
    const rounds = (block.config?.rounds as string[] | undefined) ?? ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];
    const firstRoundMatches = Math.max(1, Number(block.config?.firstRoundMatches ?? 16));
    return <div className="grid h-full gap-2 overflow-hidden p-2" style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))` }}>
      {rounds.map((round, roundIndex) => {
        const matchCount = Math.max(1, Math.ceil(firstRoundMatches / Math.pow(2, roundIndex)));
        return <section key={round} className="flex min-w-0 flex-col"><div className="mb-2 text-center text-[clamp(7px,.75vw,11px)] font-black uppercase tracking-[.08em] text-amber-300">{round}</div><div className="flex flex-1 flex-col justify-around gap-1">{Array.from({ length: matchCount }).map((_, matchIndex) => <div key={matchIndex} className="rounded border border-white/30 bg-black/35 p-1 text-[clamp(5px,.55vw,8px)]"><div className="border-b border-white/20 pb-1">________________ <span className="float-right">__</span></div><div className="pt-1">________________ <span className="float-right">__</span></div><div className="mt-1 text-[.8em] text-white/50">Date / venue: __________</div></div>)}</div></section>;
      })}
    </div>;
  }
  if (block.type === "league-table") {
    return <div className="h-full overflow-hidden p-2 text-[clamp(6px,.65vw,9px)]"><div className="mb-2 text-center font-black uppercase text-amber-300">League table</div>{Array.from({ length: 12 }).map((_, index) => <div key={index} className="grid grid-cols-[1fr_repeat(8,22px)] border-b border-white/20"><span>{index + 1}. __________________</span>{Array.from({ length: 8 }).map((__, cell) => <span key={cell} className="border-l border-white/15 text-center">&nbsp;</span>)}</div>)}</div>;
  }
  if (block.type === "fixtures") {
    return <div className="h-full overflow-hidden p-2 text-[clamp(6px,.65vw,9px)]"><div className="mb-2 text-center font-black uppercase text-amber-300">Fixture list</div>{Array.from({ length: 12 }).map((_, index) => <div key={index} className="grid grid-cols-[45px_1fr_18px_1fr] gap-1 border-b border-white/20 py-1"><span>Match {index + 1}</span><span className="text-right">____________</span><span className="text-center">v</span><span>____________</span></div>)}</div>;
  }
  return <div className="flex h-full items-center justify-center text-white/50">Image / logo</div>;
}

function backgroundStyle(project: BuilderProject) {
  if (project.backgroundUrl) return undefined;
  if (project.theme === "gold") return "radial-gradient(circle at 72% 20%, rgba(234,179,8,.35), transparent 28%), linear-gradient(135deg,#140d02,#3b2705 55%,#080603)";
  if (project.theme === "light") return "linear-gradient(135deg,#f8fafc,#dbeafe 55%,#ffffff)";
  if (project.theme === "retro") return "radial-gradient(circle at 20% 20%, rgba(120,53,15,.18), transparent 30%), linear-gradient(135deg,#f2e7cf,#d8c39b 60%,#efe2c8)";
  return "radial-gradient(circle at 70% 75%, rgba(30,64,175,.55), transparent 26%), linear-gradient(135deg,#020617,#061a3a 55%,#020617)";
}

export function PrintableProject({ project, page, watermarked }: { project: BuilderProject; page: BuilderPage; watermarked: boolean }) {
  const dims = getCanvasDimensions(project.printSize, project.orientation);
  const blocks = project.blocks.filter((block) => (block.page ?? "front") === page && !block.hidden).sort((a, b) => a.zIndex - b.zIndex);
  return <div className="print-sheet relative overflow-hidden bg-slate-950 text-white" style={{ width: `${dims.widthMm}mm`, height: `${dims.heightMm}mm`, backgroundImage: backgroundStyle(project) }}>
    {project.backgroundUrl && <img src={project.backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: project.backgroundOpacity / 100 }} />}
    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />
    {blocks.map((block) => <div key={block.id} className="absolute overflow-hidden rounded-md border border-white/30 bg-black/30 shadow-sm" style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.width}%`, height: `${block.height}%`, zIndex: block.zIndex }}><BlockContent block={block} /></div>)}
    {watermarked && <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center"><div className="-rotate-12 whitespace-nowrap text-[7vw] font-black tracking-[.25em] text-white/[.08]">LEGACY WALL CHARTS</div></div>}
  </div>;
}
