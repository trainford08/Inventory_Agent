export type PhaseState = "complete" | "active" | "pending";

export type Phase = {
  label: string;
  state: PhaseState;
  progress?: number;
};

export function PhaseTracker({
  phases,
  title,
  progressLabel,
}: {
  phases: Phase[];
  title?: string;
  progressLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-[18px_22px]">
      {(title || progressLabel) && (
        <div className="mb-4 flex items-baseline justify-between">
          {title ? (
            <div className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
              {title}
            </div>
          ) : null}
          {progressLabel ? (
            <div className="font-mono text-[12px] text-ink-soft">
              {progressLabel}
            </div>
          ) : null}
        </div>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${phases.length}, 1fr)` }}
      >
        {phases.map((phase, i) => (
          <PhaseStep key={i} phase={phase} />
        ))}
      </div>
    </div>
  );
}

function PhaseStep({ phase }: { phase: Phase }) {
  const progressPct =
    phase.state === "complete"
      ? 100
      : phase.state === "active"
        ? (phase.progress ?? 50)
        : 0;
  const fillBg = phase.state === "complete" ? "bg-success" : "bg-primary";

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center gap-2">
        <PhaseDot state={phase.state} />
        <span
          className={`text-[12px] font-medium tracking-[-0.005em] ${
            phase.state === "complete"
              ? "text-success-ink"
              : phase.state === "active"
                ? "font-semibold text-primary"
                : "text-ink-muted"
          }`}
        >
          {phase.label}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-sm bg-bg-muted">
        <div
          className={`h-full rounded-sm ${fillBg} transition-[width] duration-300`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function PhaseDot({ state }: { state: PhaseState }) {
  if (state === "complete") {
    return (
      <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-success text-white">
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_0_0_3px_var(--color-primary-mid)]">
        <span className="h-[5px] w-[5px] rounded-full bg-white" />
      </span>
    );
  }
  return (
    <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full bg-bg-muted" />
  );
}
