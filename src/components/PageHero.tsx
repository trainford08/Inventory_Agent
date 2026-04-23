import type { ReactNode } from "react";

export function PageHero({
  subjectPill,
  eyebrow,
  title,
  description,
  meta,
  right,
}: {
  subjectPill?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-border pb-5">
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1">
          {subjectPill ? <div className="mb-2.5">{subjectPill}</div> : null}
          {eyebrow ? (
            <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mb-1.5 text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[640px] text-[15px] leading-[1.55] text-ink-soft">
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-3 flex items-center gap-2 font-mono text-[11.5px] text-ink-muted">
              {meta}
            </div>
          ) : null}
        </div>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}

export function SubjectPill({
  label,
  children,
  sub,
}: {
  label?: string;
  children: ReactNode;
  sub?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary-mid bg-primary-soft px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.04em] text-primary">
      {label ? (
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          {label}
        </span>
      ) : null}
      {children}
      {sub ? (
        <>
          <span className="font-normal text-ink-faint">/</span>
          <span className="font-medium text-ink-muted">{sub}</span>
        </>
      ) : null}
    </span>
  );
}
