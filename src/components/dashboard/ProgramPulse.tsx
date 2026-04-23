import type {
  HealthCounts,
  LifecycleCounts,
  WaveSummary,
} from "@/server/dashboard";

export function ProgramPulse({
  teamTotal,
  lifecycle,
  health,
  waves,
}: {
  teamTotal: number;
  lifecycle: LifecycleCounts;
  health: HealthCounts;
  waves: WaveSummary[];
}) {
  return (
    <section className="mb-[44px]">
      <div className="mb-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
          Program pulse
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <LifecycleCard teamTotal={teamTotal} lifecycle={lifecycle} />
        <HealthCard health={health} />
        <WavesCard waves={waves} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Lifecycle distribution (stacked bar + legend)
// ---------------------------------------------------------------------------

function LifecycleCard({
  teamTotal,
  lifecycle,
}: {
  teamTotal: number;
  lifecycle: LifecycleCounts;
}) {
  const segments: Array<{
    key: keyof LifecycleCounts;
    label: string;
    dot: string;
    bar: string;
  }> = [
    {
      key: "discovery",
      label: "Discovery",
      dot: "bg-ink-faint",
      bar: "bg-ink-faint",
    },
    {
      key: "planning",
      label: "Planning",
      dot: "bg-primary",
      bar: "bg-primary",
    },
    {
      key: "execution",
      label: "Execution",
      dot: "bg-purple",
      bar: "bg-purple",
    },
    { key: "cutover", label: "Cutover", dot: "bg-success", bar: "bg-success" },
    {
      key: "rolledBack",
      label: "Rolled back",
      dot: "bg-danger",
      bar: "bg-danger",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-[18px_22px]">
      <div className="mb-1 text-[13px] font-semibold tracking-[-0.005em] text-ink">
        Lifecycle distribution
      </div>
      <div className="mb-4 font-mono text-[11px] text-ink-muted">
        {teamTotal} {teamTotal === 1 ? "team" : "teams"} across the program
      </div>
      <div className="mb-4 flex h-2 overflow-hidden rounded-sm bg-bg-muted">
        {segments.map((s) => {
          const pct = teamTotal > 0 ? (lifecycle[s.key] / teamTotal) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={s.key}
              className={`h-full ${s.bar}`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-[12px]">
            <span className={`h-2 w-2 flex-shrink-0 rounded-[2px] ${s.dot}`} />
            <span className="font-mono font-semibold text-ink">
              {lifecycle[s.key]}
            </span>
            <span className="truncate text-ink-soft">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health breakdown (3 stats, no trend badges per user decision)
// ---------------------------------------------------------------------------

function HealthCard({ health }: { health: HealthCounts }) {
  const cells: Array<{
    label: string;
    value: number;
    color: string;
  }> = [
    { label: "On track", value: health.onTrack, color: "text-success-ink" },
    { label: "At risk", value: health.atRisk, color: "text-warn-ink" },
    { label: "Blocked", value: health.blocked, color: "text-danger-ink" },
  ];
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-[18px_22px]">
      <div className="mb-1 text-[13px] font-semibold tracking-[-0.005em] text-ink">
        Health breakdown
      </div>
      <div className="mb-4 font-mono text-[11px] text-ink-muted">
        From each team&apos;s current status
      </div>
      <div className="grid grid-cols-3 gap-4">
        {cells.map((c) => (
          <div key={c.label}>
            <div
              className={`text-[22px] font-bold leading-none tracking-[-0.02em] ${c.color}`}
            >
              {c.value}
            </div>
            <div className="mt-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {c.label}
            </div>
          </div>
        ))}
      </div>
      {health.done + health.unassigned > 0 ? (
        <div className="mt-3 border-t border-border-subtle pt-2 text-[11.5px] text-ink-muted">
          {health.done > 0 ? `${health.done} done · ` : ""}
          {health.unassigned > 0 ? `${health.unassigned} unassigned` : ""}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Waves timeline
// ---------------------------------------------------------------------------

function WavesCard({ waves }: { waves: WaveSummary[] }) {
  if (waves.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-[18px_22px] lg:col-span-2">
      <div className="mb-1 text-[13px] font-semibold tracking-[-0.005em] text-ink">
        Rollout waves
      </div>
      <div className="mb-4 font-mono text-[11px] text-ink-muted">
        Teams grouped by planned migration wave
      </div>
      <div className="flex flex-wrap gap-2.5">
        {waves.map((w) => (
          <WaveTile key={w.key} wave={w} />
        ))}
      </div>
    </div>
  );
}

function WaveTile({ wave }: { wave: WaveSummary }) {
  const classes =
    wave.status === "complete"
      ? "bg-success-soft border-[rgba(22,163,74,0.25)]"
      : wave.status === "active"
        ? "bg-primary-soft border-primary-mid"
        : wave.status === "unassigned"
          ? "bg-bg-subtle border-border"
          : "bg-bg-subtle border-border";
  const labelColor =
    wave.status === "complete"
      ? "text-success-ink"
      : wave.status === "active"
        ? "text-primary"
        : "text-ink-muted";
  return (
    <div className={`min-w-[110px] rounded-md border p-[11px_12px] ${classes}`}>
      <div
        className={`mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${labelColor}`}
      >
        {wave.label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[18px] font-bold leading-none tracking-[-0.02em] text-ink">
          {wave.teamCount}
        </span>
        <span className="text-[11.5px] text-ink-muted">
          {wave.teamCount === 1 ? "team" : "teams"}
        </span>
      </div>
      <div className="mt-1 font-mono text-[10.5px] text-ink-muted">
        {wave.completedCount} complete ·{" "}
        {wave.status === "complete"
          ? "delivered"
          : wave.status === "active"
            ? "in flight"
            : wave.status === "unassigned"
              ? "parked"
              : "upcoming"}
      </div>
    </div>
  );
}
