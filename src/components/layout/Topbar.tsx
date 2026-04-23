import type { ReactNode } from "react";

export function Topbar({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-border bg-bg-elevated px-[28px] py-[14px]">
      <div className="flex items-center gap-2 text-[13px] text-ink-muted">
        {children}
      </div>
      <div className="flex-1" />
      <div className="flex min-w-[280px] cursor-pointer items-center gap-2 rounded-md border border-border bg-bg-subtle px-3 py-[6px] text-[13px] text-ink-muted">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search teams, risks, JTBDs
        <span className="ml-auto rounded border border-border bg-bg-elevated px-1.5 py-px font-mono text-[10.5px]">
          ⌘K
        </span>
      </div>
    </div>
  );
}
