import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "warn"
  | "danger"
  | "success"
  | "primary"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-bg-subtle text-ink-soft ring-border",
  warn: "bg-warn-soft text-warn-ink ring-warn-soft",
  danger: "bg-danger-soft text-danger-ink ring-danger-soft",
  success: "bg-success-soft text-success-ink ring-success-soft",
  primary: "bg-primary-soft text-primary ring-primary-mid",
  info: "bg-info-soft text-info-ink ring-info-soft",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
