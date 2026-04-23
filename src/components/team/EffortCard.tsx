import type { Confidence } from "@/generated/prisma/enums";

export function EffortCard({
  lowWeeks,
  highWeeks,
  confidence,
  progressWeeks,
  targetCutoverAt,
  slackWeeks,
}: {
  lowWeeks: number | null;
  highWeeks: number | null;
  confidence: Confidence | null;
  progressWeeks: number | null;
  targetCutoverAt: Date | null;
  slackWeeks: number | null;
}) {
  const hasEstimate = lowWeeks !== null && highWeeks !== null;
  const progressDen = hasEstimate && highWeeks !== null ? highWeeks : null;
  const progressPct =
    progressDen !== null && progressWeeks !== null
      ? Math.min(100, Math.max(0, (progressWeeks / progressDen) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-bg-elevated p-[22px_24px]">
      <div>
        <div className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Effort & timeline
        </div>
        <div className="text-[12px] text-ink-muted">
          Estimate and progress toward cutover
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-[44px] font-bold leading-none tracking-[-0.03em] text-ink">
          {hasEstimate ? `${lowWeeks}–${highWeeks}` : "—"}
        </div>
        <div className="text-[14px] font-medium text-ink-muted">FTE-weeks</div>
      </div>

      {confidence ? (
        <div className="-mt-3 text-[12.5px] text-ink-muted">
          {confidenceLabel(confidence)} confidence
        </div>
      ) : null}

      {progressWeeks !== null && progressDen !== null ? (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Progress
            </span>
            <span className="font-mono text-[11.5px] text-ink-soft">
              {progressWeeks} / {progressDen} wk
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-sm bg-bg-muted">
            <div
              className="h-full rounded-sm bg-primary"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-[14px] border-t border-border pt-4">
        <DateBlock
          label="Target cutover"
          value={
            targetCutoverAt
              ? targetCutoverAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"
          }
          sub={
            targetCutoverAt
              ? relativeDays(targetCutoverAt)
              : "not yet scheduled"
          }
        />
        <DateBlock
          label="Slack"
          value={slackLabel(slackWeeks)}
          sub={slackSub(slackWeeks)}
          warn={slackWeeks !== null && slackWeeks < 0}
        />
      </div>
    </div>
  );
}

function DateBlock({
  label,
  value,
  sub,
  warn = false,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </div>
      <div
        className={`text-[14px] font-semibold tracking-[-0.005em] ${
          warn ? "text-warn-ink" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="text-[11.5px] text-ink-muted">{sub}</div> : null}
    </div>
  );
}

function confidenceLabel(c: Confidence) {
  return c === "HIGH" ? "High" : c === "MEDIUM" ? "Medium" : "Low";
}

function slackLabel(weeks: number | null) {
  if (weeks === null) return "—";
  if (weeks === 0) return "On target";
  return weeks > 0 ? `+${weeks} weeks` : `${weeks} weeks`;
}

function slackSub(weeks: number | null) {
  if (weeks === null) return "no plan yet";
  if (weeks === 0) return "no buffer, no slip";
  return weeks > 0 ? "buffer to spare" : "behind plan";
}

function relativeDays(d: Date) {
  const delta = Math.round((d.getTime() - Date.now()) / (24 * 3600 * 1000));
  if (delta === 0) return "today";
  if (delta > 0) return `${delta} day${delta === 1 ? "" : "s"} from now`;
  return `${Math.abs(delta)} day${Math.abs(delta) === 1 ? "" : "s"} ago`;
}
