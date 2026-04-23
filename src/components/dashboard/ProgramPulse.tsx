import type { HealthCounts, LifecycleCounts } from "@/server/dashboard";

export function ProgramPulse({
  teamTotal,
  lifecycle,
  health,
  waveCount,
  readyCount,
}: {
  teamTotal: number;
  lifecycle: LifecycleCounts;
  health: HealthCounts;
  waveCount: number;
  readyCount: number;
}) {
  const { onTrack, atRisk, blocked, done } = health;
  const active = teamTotal - done;
  const pct = (n: number) => (active > 0 ? Math.round((n / active) * 100) : 0);

  return (
    <section className="mb-[36px] overflow-hidden rounded-md border border-border bg-bg-elevated">
      <header className="flex items-baseline justify-between border-b border-border px-6 py-[14px]">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
            Program pulse
          </h2>
          <span className="font-mono text-[11px] font-medium text-ink-muted">
            {teamTotal.toLocaleString()} {teamTotal === 1 ? "team" : "teams"} ·{" "}
            {waveCount} {waveCount === 1 ? "wave" : "waves"}
          </span>
        </div>
        <a className="inline-flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-primary">
          Full metrics
          <ChevronRight />
        </a>
      </header>

      <div className="px-7 py-[22px]">
        {/* Hero health bar */}
        <div className="mb-[18px] flex h-[14px] overflow-hidden rounded-[7px] bg-bg-muted shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          {onTrack > 0 ? (
            <div className="h-full bg-success" style={{ flex: onTrack }} />
          ) : null}
          {atRisk > 0 ? (
            <div className="h-full bg-warn" style={{ flex: atRisk }} />
          ) : null}
          {blocked > 0 ? (
            <div className="h-full bg-danger" style={{ flex: blocked }} />
          ) : null}
        </div>

        {/* 4-col number legend */}
        <div className="grid grid-cols-4 gap-6">
          <HealthCol
            dotClass="bg-success"
            numClass="text-success-ink"
            label="On track"
            n={onTrack}
            pct={pct(onTrack)}
          />
          <HealthCol
            dotClass="bg-warn"
            numClass="text-warn-ink"
            label="At risk"
            n={atRisk}
            pct={pct(atRisk)}
          />
          <HealthCol
            dotClass="bg-danger"
            numClass="text-danger-ink"
            label="Blocked"
            n={blocked}
            pct={pct(blocked)}
          />
          <HealthCol
            dotClass="bg-ink-faint"
            numClass="text-ink-muted"
            label="Done"
            n={done}
            muted
          />
        </div>

        {/* Support: where teams stand (chevron flow) + trends */}
        <div className="mt-[22px] border-t border-border pt-5">
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Where teams stand
          </div>
          <div className="flex items-center gap-[14px]">
            <div className="flex min-w-0 flex-1 items-stretch gap-[3px]">
              <PhasePill count={lifecycle.discovery} name="Discovery" first />
              <PhasePill count={lifecycle.planning} name="Planning" />
              <PhasePill count={lifecycle.execution} name="Execution" />
              <PhasePill count={lifecycle.cutover} name="Cut over" />
              <PhasePill count={lifecycle.done} name="Done" done last />
            </div>
            <div className="ml-auto flex items-center gap-[14px]">
              {readyCount > 0 ? (
                <TrendPill
                  tone="up"
                  delta={readyCount}
                  label="ready to advance"
                />
              ) : null}
              {atRisk > 0 ? (
                <TrendPill tone="down" delta={atRisk} label="at risk" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HealthCol({
  dotClass,
  numClass,
  label,
  n,
  pct,
  muted,
}: {
  dotClass: string;
  numClass: string;
  label: string;
  n: number;
  pct?: number;
  muted?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${muted ? "opacity-65" : ""}`}>
      <div className="flex items-center gap-[7px] text-[13px] font-medium text-ink-soft">
        <span
          className={`h-[9px] w-[9px] flex-shrink-0 rounded-full ${dotClass}`}
        />
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-[28px] font-bold leading-none tracking-[-0.025em] ${numClass}`}
        >
          {n}
        </span>
        {pct !== undefined ? (
          <span className="font-mono text-[11.5px] font-semibold text-ink-muted">
            {pct}%
          </span>
        ) : null}
      </div>
    </div>
  );
}

function PhasePill({
  count,
  name,
  first,
  last,
  done,
}: {
  count: number;
  name: string;
  first?: boolean;
  last?: boolean;
  done?: boolean;
}) {
  const bg = done
    ? "bg-bg-muted border-border-strong"
    : "bg-primary-soft border-primary-mid";
  const countColor = done ? "text-ink-muted" : "text-primary";
  const clip = first
    ? "[clip-path:polygon(0_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,0_100%)]"
    : last
      ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,10px_50%)]"
      : "[clip-path:polygon(0_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,0_100%,10px_50%)]";
  const padding = first
    ? "pl-3 pr-[18px]"
    : last
      ? "pl-[14px] pr-[14px]"
      : "pl-[14px] pr-[18px]";

  return (
    <div
      className={`relative flex min-w-0 flex-1 flex-col gap-[1px] border py-[9px] ${bg} ${clip} ${padding}`}
    >
      <span
        className={`text-[16px] font-bold leading-none tracking-[-0.015em] ${countColor}`}
      >
        {count}
      </span>
      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
        {name}
      </span>
    </div>
  );
}

function TrendPill({
  tone,
  delta,
  label,
}: {
  tone: "up" | "down";
  delta: number;
  label: string;
}) {
  const color = tone === "up" ? "text-success-ink" : "text-danger-ink";
  return (
    <span
      className={`inline-flex items-center gap-[5px] font-mono text-[11.5px] ${color}`}
    >
      {tone === "up" ? <ArrowUp /> : <ArrowDown />}
      <span className="font-bold">+{delta}</span>
      <span className="text-ink-soft">{label}</span>
    </span>
  );
}

function ChevronRight() {
  return (
    <svg
      className="h-[11px] w-[11px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg
      className="h-[11px] w-[11px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg
      className="h-[11px] w-[11px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
