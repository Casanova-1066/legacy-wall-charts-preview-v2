import type { BracketColumn, BracketCell } from "@/lib/wallchart/types";
import { TeamBadge } from "./TeamBadge";

function ResultStatusBadge({ mode }: { mode: BracketCell["resultMode"] }) {
  const label = mode === "official" ? "Official" : mode === "manual" ? "Manual" : mode === "needs-data" ? "Needs data" : "Pending";
  const tone = mode === "official" ? "text-emerald-300 border-emerald-400/20 bg-emerald-400/10" : mode === "manual" ? "text-sky-300 border-sky-400/20 bg-sky-400/10" : mode === "needs-data" ? "text-amber-300 border-amber-400/20 bg-amber-400/10" : "text-muted-foreground border-gold/10 bg-navy/40";
  return <span className={`rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${tone}`}>{label}</span>;
}

function BracketCellView({ cell }: { cell: BracketCell }) {
  const homeWin = cell.winnerCode && cell.winnerCode === cell.homeCode;
  const awayWin = cell.winnerCode && cell.winnerCode === cell.awayCode;
  const hasScore = cell.homeScore != null && cell.awayScore != null;
  return (
    <div className="glass-panel rounded-lg border border-gold/20 px-3 py-2 min-w-[200px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <TeamBadge code={cell.homeCode} name={cell.homeName} size="sm" />
          <span className={`text-sm ${homeWin ? "text-gold font-bold" : "text-foreground"}`}>
            {cell.homeName}
          </span>
        </div>
        <span className={`text-sm font-bold ${hasScore ? "text-gold" : "text-muted-foreground"}`}>
          {hasScore ? cell.homeScore : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-2 flex-1">
          <TeamBadge code={cell.awayCode} name={cell.awayName} size="sm" />
          <span className={`text-sm ${awayWin ? "text-gold font-bold" : "text-foreground"}`}>
            {cell.awayName}
          </span>
        </div>
        <span className={`text-sm font-bold ${hasScore ? "text-gold" : "text-muted-foreground"}`}>
          {hasScore ? cell.awayScore : "—"}
        </span>
      </div>
      {cell.penaltiesHome != null && cell.penaltiesAway != null && (
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          (pen {cell.penaltiesHome}-{cell.penaltiesAway})
        </p>
      )}
      <div className="mt-1 flex items-center justify-center gap-2">
        <ResultStatusBadge mode={cell.resultMode} />
      </div>
      {cell.date && (
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          {cell.date}{cell.venue ? ` · ${cell.venue}` : ""}
        </p>
      )}
    </div>
  );
}

export function KnockoutBracket({ columns }: { columns: BracketColumn[] }) {
  if (columns.length === 0) return null;
  return (
    <div className="wallchart-bracket overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {columns.map((col, ci) => (
          <div key={col.roundSlug} className="flex flex-col">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold mb-3 text-center border-b border-gold/30 pb-1">
              {col.roundName}
            </h3>
            <div className="flex-1 flex flex-col justify-around gap-4">
              {col.cells.map((cell, i) => (
                <div key={i} className="bracket-cell-wrapper relative">
                  <BracketCellView cell={cell} />
                  {ci < columns.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-px bg-gold/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Mobile stacked view */}
      <div className="lg:hidden mt-6 space-y-6">
        {columns.map((col) => (
          <div key={`mobile-${col.roundSlug}`}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold mb-2">
              {col.roundName}
            </h3>
            <div className="space-y-2">
              {col.cells.map((cell, i) => (
                <BracketCellView key={i} cell={cell} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
