import type { ReactNode } from "react";

export function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-bg-elevated">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <h2 className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {title}
        </h2>
        {badge ? (
          <span className="font-mono text-[11px] text-ink-muted">{badge}</span>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
