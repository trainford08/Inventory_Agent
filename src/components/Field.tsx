import type { ReactNode } from "react";

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </dt>
      <dd className="text-[13px] text-ink">{value ?? "—"}</dd>
    </div>
  );
}
