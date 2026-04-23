import type { ReactNode } from "react";

export type StatTone = "default" | "success" | "warn" | "primary" | "danger";

export function StatCounter({
  label,
  value,
  trend,
  hint,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  trend?: ReactNode;
  hint?: ReactNode;
  tone?: StatTone;
}) {
  const valueColor = {
    default: "text-ink",
    success: "text-success-ink",
    warn: "text-warn-ink",
    primary: "text-primary",
    danger: "text-danger-ink",
  }[tone];

  return (
    <div className="rounded-md border border-border bg-bg-elevated p-[18px_20px]">
      <div className="mb-2 text-[12.5px] font-medium text-ink-muted">
        {label}
      </div>
      <div className="flex items-baseline gap-2.5">
        <div
          className={`text-[30px] font-bold leading-none tracking-[-0.025em] ${valueColor}`}
        >
          {value}
        </div>
        {trend}
      </div>
      {hint ? (
        <div className="mt-1.5 text-[11.5px] text-ink-muted">{hint}</div>
      ) : null}
    </div>
  );
}

export function StatTrend({
  tone = "neutral",
  children,
}: {
  tone?: "up" | "attention" | "neutral";
  children: ReactNode;
}) {
  const classes = {
    up: "bg-success-soft text-success-ink",
    attention: "bg-warn-soft text-warn-ink",
    neutral: "bg-bg-subtle text-ink-muted",
  }[tone];
  return (
    <span
      className={`whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold ${classes}`}
    >
      {children}
    </span>
  );
}
