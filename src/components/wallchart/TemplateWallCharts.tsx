import type { BracketCell, GroupTable, WallChartViewModel } from "@/lib/wallchart/types";

type BackgroundConfig = {
  url?: string;
  opacity?: number;
  scale?: number;
  blur?: number;
};

function scoreText(home: number | null, away: number | null) {
  return home == null || away == null ? "__:__" : `${home}:${away}`;
}

function shortTeam(name: string) {
  if (!name || name === "TBD") return "";
  return name.length > 18 ? `${name.slice(0, 16)}…` : name;
}

const groupColors = ["#1d4ed8", "#f97316", "#7c3aed", "#16a34a", "#0ea5e9", "#dc2626", "#eab308", "#db2777", "#2563eb", "#059669", "#f59e0b", "#be185d"];

function PosterBackground({ background }: { background?: BackgroundConfig | null }) {
  const opacity = typeof background?.opacity === "number" ? background.opacity / 100 : 0.38;
  const scale = typeof background?.scale === "number" ? background.scale / 100 : 1;
  const blur = typeof background?.blur === "number" ? background.blur : 0;
  return (
    <>
      {background?.url ? (
        <img
          src={background.url}
          alt="Custom wall chart background"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_78%,rgba(59,130,246,.55),transparent_24%),radial-gradient(circle_at_40%_20%,rgba(15,23,42,.2),transparent_35%),linear-gradient(135deg,#020617,#082f66_45%,#020617)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#03152d]/70 to-black/80" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,.25),transparent_65%)]" />
    </>
  );
}

function GroupCard({ group, index, compact = false }: { group: GroupTable; index: number; compact?: boolean }) {
  const color = groupColors[index % groupColors.length];
  const fixtures = group.matchdays.flatMap((m) => m.fixtures).slice(0, compact ? 3 : 6);
  const rows = [...group.standings];
  while (rows.length < 4) rows.push({
    teamCode: `blank-${rows.length}`, teamName: "", shortName: null, flag: null, badgeUrl: null, primaryColor: null,
    played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
  });
  return (
    <div className="overflow-hidden rounded-md border border-white/30 bg-white/90 text-[8px] text-slate-950 shadow-md">
      <div className="flex items-center text-white" style={{ backgroundColor: color }}>
        <div className="flex h-7 w-8 items-center justify-center text-lg font-black">{String.fromCharCode(65 + index)}</div>
        <div className="flex-1 text-center text-xs font-black uppercase tracking-wide">{group.groupName}</div>
      </div>
      <div className="grid grid-cols-[1.12fr_.95fr] divide-x divide-slate-400">
        <div>
          <div className="grid grid-cols-[1fr_1fr_34px] border-b border-slate-400 bg-slate-100 text-center text-[6px] font-bold uppercase">
            <span>Home</span><span>Away</span><span>Score</span>
          </div>
          {(fixtures.length ? fixtures : Array.from({ length: compact ? 3 : 6 })).map((f: any, i) => (
            <div key={f?.id ?? i} className="grid grid-cols-[1fr_1fr_34px] border-b border-slate-300 last:border-b-0 leading-4">
              <span className="truncate border-r border-slate-300 px-1">{shortTeam(f?.homeName ?? "")}</span>
              <span className="truncate border-r border-slate-300 px-1">{shortTeam(f?.awayName ?? "")}</span>
              <span className="text-center font-bold">{f ? scoreText(f.homeScore, f.awayScore) : "__:__"}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="grid grid-cols-[1fr_repeat(7,16px)] border-b border-slate-400 bg-slate-100 text-center text-[6px] font-bold uppercase">
            <span>Team</span><span>P</span><span>W</span><span>D</span><span>GF</span><span>GA</span><span>GD</span><span>Pts</span>
          </div>
          {rows.slice(0, 4).map((r, i) => (
            <div key={`${r.teamCode}-${i}`} className="grid grid-cols-[1fr_repeat(7,16px)] border-b border-slate-300 last:border-b-0 leading-4 text-center">
              <span className="truncate px-1 text-left">{i + 1}. {shortTeam(r.teamName)}</span>
              <span>{r.played || "-"}</span><span>{r.won || "-"}</span><span>{r.drawn || "-"}</span><span>{r.goalsFor || "-"}</span><span>{r.goalsAgainst || "-"}</span><span>{r.goalDifference || "-"}</span><span className="font-black">{r.points || "-"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TieBox({ label, cell }: { label: string; cell?: BracketCell }) {
  return (
    <div className="rounded border border-white/45 bg-white/90 p-1 text-[7px] text-slate-950 shadow">
      <div className="mb-1 font-black uppercase text-slate-800">{label}</div>
      <div className="grid grid-cols-[1fr_34px] border border-slate-300 leading-4">
        <span className="truncate border-r border-slate-300 px-1">{shortTeam(cell?.homeName ?? "")}</span><span className="text-center font-bold">{cell ? scoreText(cell.homeScore, cell.awayScore) : "__:__"}</span>
        <span className="truncate border-r border-t border-slate-300 px-1">{shortTeam(cell?.awayName ?? "")}</span><span className="border-t border-slate-300 text-center font-bold">{cell ? scoreText(null, null) : "__:__"}</span>
      </div>
      <div className="mt-1 text-center text-[6px] font-bold uppercase text-slate-700">Agg. __:__ · ET/Pens</div>
    </div>
  );
}

function BracketArea({ vm, worldCup = false }: { vm: WallChartViewModel; worldCup?: boolean }) {
  const columns = vm.bracketColumns;
  const cells = columns.flatMap((c) => c.cells);
  const round16 = columns.find((c) => /16|round/i.test(c.roundName))?.cells ?? cells.slice(0, 8);
  const quarters = columns.find((c) => /quarter/i.test(c.roundName))?.cells ?? cells.slice(8, 12);
  const semis = columns.find((c) => /semi/i.test(c.roundName))?.cells ?? cells.slice(12, 14);
  const final = columns.find((c) => /final/i.test(c.roundName))?.cells ?? cells.slice(-1);
  return (
    <div className="grid h-full grid-cols-[1.15fr_.9fr_.75fr_.75fr] gap-3 text-white">
      <div className="space-y-2"><h3 className="text-center text-xs font-black uppercase">{worldCup ? "Round of 32 / 16" : "Round of 16"}</h3>{Array.from({ length: worldCup ? 8 : 8 }).map((_, i) => <TieBox key={i} label={`Tie ${i + 1}`} cell={round16[i]} />)}</div>
      <div className="space-y-8 pt-10"><h3 className="text-center text-xs font-black uppercase">Quarter-finals</h3>{Array.from({ length: 4 }).map((_, i) => <TieBox key={i} label={`QF ${i + 1}`} cell={quarters[i]} />)}</div>
      <div className="space-y-24 pt-24"><h3 className="text-center text-xs font-black uppercase">Semi-finals</h3>{Array.from({ length: 2 }).map((_, i) => <TieBox key={i} label={`SF ${i + 1}`} cell={semis[i]} />)}</div>
      <div className="flex flex-col justify-center gap-10"><h3 className="text-center text-xs font-black uppercase">Final</h3><TieBox label="Final" cell={final[0]} /><div className="rounded-lg border border-white/35 bg-black/40 p-4 text-center"><div className="text-lg font-black uppercase">Winner</div><div className="mx-auto my-3 flex h-24 w-20 items-center justify-center rounded-full border-4 border-white/50 text-4xl">🏆</div><div className="rounded bg-white/90 py-2 text-slate-900">________________</div></div></div>
    </div>
  );
}

function Notes({ worldCup = false }: { worldCup?: boolean }) {
  return <div className="grid grid-cols-4 gap-3 text-[9px] text-white"><div className="rounded border border-white/25 bg-black/35 p-3"><b>FORMAT NOTES</b><br />{worldCup ? "Expanded World Cup wall chart template with group stage and knockout path." : "Top 2 teams from each group qualify for the knockout stage."}</div><div className="rounded border border-white/25 bg-black/35 p-3"><b>LEGEND</b><br />__:__ Score · AGG Aggregate · ET Extra Time · PENS Penalties</div><div className="rounded border border-white/25 bg-black/35 p-3"><b>HOW TIES ARE DECIDED</b><br />Aggregate score, then extra time, then penalty shoot-out where required.</div><div className="rounded border border-white/25 bg-black/35 p-3"><b>CUSTOM BACKGROUND</b><br />Use the Background tab to upload your own stadium/image and save opacity/scale/blur.</div></div>;
}

export function ChampionsLeagueClassicTemplate({ vm, background }: { vm: WallChartViewModel; background?: BackgroundConfig | null }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/20 bg-slate-950 p-3 font-sans shadow-2xl">
      <PosterBackground background={background} />
      <div className="relative z-10 flex h-full flex-col gap-2">
        <header className="text-center text-white"><h1 className="text-3xl font-black uppercase tracking-[.16em]">UEFA Champions League</h1><p className="text-sm font-bold uppercase tracking-[.18em]">{vm.seasonName} · Old format – group stage to final</p></header>
        <main className="grid flex-1 grid-cols-[.92fr_1.28fr] gap-3 overflow-hidden">
          <section className="rounded-md border border-white/25 bg-black/30 p-2"><h2 className="mb-2 rounded bg-blue-950/85 py-1 text-center text-sm font-black uppercase text-white">Group Stage</h2><div className="grid grid-cols-2 gap-2">{vm.groupTables.slice(0, 8).map((g, i) => <GroupCard key={g.groupName} group={g} index={i} />)}</div><div className="mt-2 rounded border border-white/25 bg-black/35 p-2 text-center text-[9px] font-black text-white">TOP 2 TEAMS FROM EACH GROUP QUALIFY</div></section>
          <section className="rounded-md border border-white/25 bg-black/25 p-2"><h2 className="mb-2 rounded bg-blue-950/85 py-1 text-center text-sm font-black uppercase text-white">Knockout Stage (Two-Leg Ties)</h2><BracketArea vm={vm} /></section>
        </main>
        <Notes />
      </div>
    </div>
  );
}

export function WorldCup2026Template({ vm, background }: { vm: WallChartViewModel; background?: BackgroundConfig | null }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/20 bg-slate-950 p-3 font-sans shadow-2xl">
      <PosterBackground background={background} />
      <div className="relative z-10 flex h-full flex-col gap-2">
        <header className="text-center text-white"><h1 className="text-3xl font-black uppercase tracking-[.12em]">FIFA World Cup</h1><p className="text-sm font-bold uppercase tracking-[.18em]">{vm.seasonName} tournament wall chart</p></header>
        <main className="grid flex-1 grid-cols-[.82fr_1.18fr_.82fr] gap-3 overflow-hidden">
          <section className="space-y-2 overflow-hidden">{vm.groupTables.slice(0, 6).map((g, i) => <GroupCard key={g.groupName} group={g} index={i} compact />)}</section>
          <section className="rounded-md border border-white/25 bg-black/25 p-2"><h2 className="mb-2 rounded bg-blue-950/85 py-1 text-center text-sm font-black uppercase text-white">Knockout Stage</h2><BracketArea vm={vm} worldCup /></section>
          <section className="space-y-2 overflow-hidden">{vm.groupTables.slice(6, 12).map((g, i) => <GroupCard key={g.groupName} group={g} index={i + 6} compact />)}</section>
        </main>
        <Notes worldCup />
      </div>
    </div>
  );
}
