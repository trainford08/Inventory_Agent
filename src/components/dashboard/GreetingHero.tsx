export function GreetingHero({
  name,
  nowMs,
  actionItemCount,
  teamTotal,
}: {
  name: string;
  nowMs: number;
  actionItemCount: number;
  teamTotal: number;
}) {
  const now = new Date(nowMs);
  const greeting = greetingFor(now);
  const firstName = name.split(" ")[0];
  const dateLine = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <header className="mb-[28px]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
            {dateLine}
          </div>
          <h1 className="mb-1.5 text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
            {greeting}, {firstName}
          </h1>
          <p className="text-[14.5px] leading-[1.5] text-ink-soft">
            {actionItemCount > 0 ? (
              <>
                <span className="font-semibold text-ink">
                  {actionItemCount} {actionItemCount === 1 ? "item" : "items"}
                </span>{" "}
                need your attention across {teamTotal}{" "}
                {teamTotal === 1 ? "team" : "teams"} in your program.
              </>
            ) : (
              <>
                All clear across {teamTotal}{" "}
                {teamTotal === 1 ? "team" : "teams"} in your program.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <HeroButton variant="secondary">
            <WeeklyReportIcon />
            Weekly report
          </HeroButton>
          <HeroButton variant="primary">
            <PlusIcon />
            New intervention
          </HeroButton>
        </div>
      </div>
    </header>
  );
}

function HeroButton({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "bg-primary text-white border border-primary hover:bg-primary-hover"
      : "bg-bg-elevated text-ink-soft border border-border hover:bg-bg-subtle hover:border-border-strong";
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-md px-[14px] py-[8px] text-[13px] font-medium transition-colors ${classes}`}
    >
      {children}
    </button>
  );
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function WeeklyReportIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
