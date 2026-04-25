"use client";

import { useState } from "react";
import { AdaInventoryChat } from "./AdaInventoryChat";

export function AdaToggleableRail({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`grid min-h-full bg-bg ${
        open ? "grid-cols-[1fr_380px]" : "grid-cols-[1fr_0px]"
      }`}
    >
      <div className="min-w-0 overflow-x-hidden">{children}</div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Hide Ada" : "Show Ada"}
          className="absolute left-0 top-[16px] z-10 flex h-[28px] w-[28px] -translate-x-1/2 items-center justify-center rounded-full border border-border bg-bg-elevated text-ink-muted shadow-sm transition-colors hover:border-border-strong hover:text-ink"
        >
          <svg
            className="h-[14px] w-[14px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
        {open ? <AdaInventoryChat /> : null}
      </div>
    </div>
  );
}
