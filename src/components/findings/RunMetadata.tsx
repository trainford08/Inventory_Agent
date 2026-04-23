export type RunMetaFields = {
  agentName: string;
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  triggeredBy: string;
};

export function RunMetadata({ run }: { run: RunMetaFields }) {
  const items: Array<{ key: string; value: string }> = [
    { key: "Agent", value: run.agentName },
    { key: "Started", value: formatDateTime(run.startedAt) },
    {
      key: "Completed",
      value: run.completedAt ? formatDateTime(run.completedAt) : "—",
    },
    {
      key: "Duration",
      value: run.durationMs !== null ? formatDuration(run.durationMs) : "—",
    },
    { key: "Triggered by", value: run.triggeredBy },
  ];

  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-[18px_22px]">
      <div className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-ink">
        About this scan
      </div>
      <dl className="grid grid-cols-1 gap-x-[28px] gap-y-[14px] sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col gap-0.5">
            <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              {item.key}
            </dt>
            <dd className="font-mono text-[12px] text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  return remSec === 0 ? `${minutes}m` : `${minutes}m ${remSec}s`;
}
