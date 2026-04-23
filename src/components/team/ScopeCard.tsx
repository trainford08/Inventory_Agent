import type { MigrationApproach } from "@/generated/prisma/enums";

const SEGMENTS: Array<{
  approach: MigrationApproach;
  label: string;
  swatch: string;
  bar: string;
}> = [
  {
    approach: "MOVES",
    label: "Moves to GitHub",
    swatch: "bg-primary",
    bar: "bg-primary",
  },
  {
    approach: "STAYS",
    label: "Stays on ADO",
    swatch: "bg-warn",
    bar: "bg-warn",
  },
  {
    approach: "BOTH",
    label: "Runs on both",
    swatch: "bg-info",
    bar: "bg-info",
  },
  {
    approach: "MIXED",
    label: "Mixed approach",
    swatch: "bg-purple",
    bar: "bg-purple",
  },
];

export function ScopeCard({
  total,
  counts,
}: {
  total: number;
  counts: Record<MigrationApproach, number>;
}) {
  const classified = SEGMENTS.reduce((n, s) => n + counts[s.approach], 0);
  const unassigned = Math.max(0, total - classified);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-[22px_24px]">
      <div className="mb-5">
        <div className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Scope
        </div>
        <div className="text-[12px] text-ink-muted">
          Jobs-to-be-done by migration approach
        </div>
      </div>

      <div className="mb-4 flex items-baseline gap-2">
        <div className="text-[44px] font-bold leading-none tracking-[-0.03em] text-ink">
          {total}
        </div>
        <div className="text-[13px] text-ink-muted">
          {total === 1 ? "JTBD" : "JTBDs"}
          {unassigned > 0 ? ` · ${unassigned} unassigned` : ""}
        </div>
      </div>

      <div className="mb-5 flex h-[10px] overflow-hidden rounded-full bg-bg-subtle">
        {SEGMENTS.map((s) => {
          const pct = total > 0 ? (counts[s.approach] / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={s.approach}
              className={`h-full ${s.bar}`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {SEGMENTS.map((s) => (
          <div
            key={s.approach}
            className="flex items-center gap-2 text-[12.5px]"
          >
            <span
              className={`h-[10px] w-[10px] flex-shrink-0 rounded-[3px] ${s.swatch}`}
            />
            <span className="mr-1 font-mono font-semibold text-ink">
              {counts[s.approach]}
            </span>
            <span className="font-medium text-ink-soft">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
