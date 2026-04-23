export function AtAGlanceCounters({
  autoPopulated,
  needHumanInput,
  judgmentCalls,
  profileComplete,
}: {
  autoPopulated: number;
  needHumanInput: number;
  judgmentCalls: number;
  profileComplete: number;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
          At a glance
        </h2>
        <div className="text-[12px] text-ink-muted">
          Where things stand right now, across the whole profile
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Counter
          label="Auto-populated"
          value={String(autoPopulated)}
          hint="Pulled from ADO · 3 hrs ago"
          badge={{ text: "100%", tone: "success" }}
        />
        <Counter
          label="Need human input"
          value={String(needHumanInput)}
          hint="Agent flagged these for you"
          badge={{ text: "1-2 clicks each", tone: "warn" }}
        />
        <Counter
          label="Judgment calls"
          value={String(judgmentCalls)}
          hint="Only a human can answer"
          badge={{ text: "Your call", tone: "neutral-warn" }}
        />
        <Counter
          label="Profile complete"
          value={`${profileComplete}%`}
          hint="Partial sign-off is fine"
        />
      </div>
    </section>
  );
}

function Counter({
  label,
  value,
  hint,
  badge,
}: {
  label: string;
  value: string;
  hint: string;
  badge?: { text: string; tone: "success" | "warn" | "neutral-warn" };
}) {
  const badgeClasses = badge
    ? badge.tone === "success"
      ? "bg-success-soft text-success-ink"
      : badge.tone === "warn"
        ? "bg-warn-soft text-warn-ink"
        : "bg-warn-soft text-warn-ink"
    : "";
  return (
    <div className="rounded-md border border-border bg-bg-elevated p-[18px_20px]">
      <div className="mb-2.5 text-[12.5px] font-medium text-ink-muted">
        {label}
      </div>
      <div className="flex items-baseline gap-2.5">
        <div className="text-[30px] font-bold leading-none tracking-[-0.025em] text-ink">
          {value}
        </div>
        {badge ? (
          <span
            className={`inline-flex items-center rounded px-2 py-[2px] font-mono text-[10.5px] font-semibold ${badgeClasses}`}
          >
            {badge.text}
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-[11.5px] text-ink-muted">{hint}</div>
    </div>
  );
}
