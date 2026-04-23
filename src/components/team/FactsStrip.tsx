import type { ReactNode } from "react";

export function FactsStrip({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function Fact({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-[10px] py-[4px] text-[12.5px] text-ink-soft">
      {icon ? (
        <span className="text-ink-muted [&_svg]:h-3 [&_svg]:w-3">{icon}</span>
      ) : null}
      {children}
    </span>
  );
}
