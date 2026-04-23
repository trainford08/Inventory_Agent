export function ReviewProgress({
  percent,
  humanVerified,
  total,
}: {
  percent: number;
  humanVerified: number;
  total: number;
}) {
  const barColor =
    percent >= 80
      ? "bg-success"
      : percent >= 40
        ? "bg-primary"
        : percent > 0
          ? "bg-warn"
          : "bg-bg-muted";
  return (
    <div className="flex items-center gap-5 rounded-xl border border-border bg-bg-elevated p-[16px_22px]">
      <div className="flex-shrink-0">
        <div className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Champion review
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">
            {percent}%
          </span>
          <span className="text-[12px] text-ink-muted">human-verified</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 h-1.5 overflow-hidden rounded-sm bg-bg-muted">
          <div
            className={`h-full rounded-sm ${barColor} transition-[width] duration-300`}
            style={{ width: `${Math.max(percent, 2)}%` }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
          <span>
            {humanVerified} of {total} {total === 1 ? "finding" : "findings"}{" "}
            reviewed
          </span>
          {humanVerified > 0 ? (
            <span className="inline-flex items-center gap-1 text-success-ink">
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {humanVerified} verified by Champion
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
