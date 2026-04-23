import type { HealthStatus } from "@/generated/prisma/enums";

type HealthMeta = {
  label: string;
  classes: string;
};

const META: Record<HealthStatus, HealthMeta> = {
  ON_TRACK: {
    label: "On track",
    classes: "bg-success-soft text-success-ink border-[rgba(22,163,74,0.2)]",
  },
  AT_RISK: {
    label: "At risk",
    classes: "bg-warn-soft text-warn-ink border-[rgba(217,119,6,0.2)]",
  },
  BLOCKED: {
    label: "Blocked",
    classes: "bg-danger-soft text-danger-ink border-[rgba(220,38,38,0.2)]",
  },
  DONE: {
    label: "Done",
    classes: "bg-bg-subtle text-ink-muted border-border",
  },
};

export function HealthChip({
  status,
  sub,
}: {
  status: HealthStatus;
  sub?: string;
}) {
  const meta = META[status];
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-[14px] py-[8px] text-[13px] font-semibold tracking-[-0.005em] ${meta.classes}`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {meta.label}
      </span>
      {sub ? (
        <span className="font-mono text-[12px] text-ink-muted">{sub}</span>
      ) : null}
    </div>
  );
}
