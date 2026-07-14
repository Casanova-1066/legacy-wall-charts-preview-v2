import type { StandingsRow } from "@/lib/wallchart/types";

function countryCodeToFlag(code: string | null): string | null {
  if (!code || code.length !== 2) return null;
  const cp = [0x1f1e6, 0x1f1e6];
  cp[0] += code.toUpperCase().charCodeAt(0) - 65;
  cp[1] += code.toUpperCase().charCodeAt(1) - 65;
  return String.fromCodePoint(...cp);
}

export function TeamBadge({
  code, name, flag, badgeUrl, primaryColor, size = "sm",
}: {
  code: string | null;
  name: string;
  flag?: string | null;
  badgeUrl?: string | null;
  primaryColor?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-8 w-8" : "h-5 w-5";
  const text = size === "md" ? "text-xs" : "text-[10px]";
  const flagStr = flag ? countryCodeToFlag(flag) : null;
  if (badgeUrl) {
    return <img src={badgeUrl} alt={name} className={`${dim} rounded-full object-cover`} />;
  }
  if (flagStr) {
    return <span className={size === "md" ? "text-xl" : "text-sm"}>{flagStr}</span>;
  }
  const initials = (code ?? name).slice(0, 3).toUpperCase();
  return (
    <span
      className={`${dim} ${text} flex items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: primaryColor ?? "#1e3a5f" }}
    >
      {initials}
    </span>
  );
}

export function StandingsTeam({ row, size = "sm" }: { row: StandingsRow; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-2">
      <TeamBadge
        code={row.teamCode} name={row.teamName} flag={row.flag}
        badgeUrl={row.badgeUrl} primaryColor={row.primaryColor} size={size}
      />
      <span className="font-semibold">{row.shortName ?? row.teamName}</span>
    </div>
  );
}
