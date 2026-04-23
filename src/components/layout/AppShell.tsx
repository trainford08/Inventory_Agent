"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * /review pages own their full-bleed layout (their own left rail replaces
 * the app sidebar). Everywhere else uses the standard AppShell.
 */
const FULL_BLEED_PATTERNS = [/^\/teams\/[^/]+\/review(\/|$)/];

export function AppShell({
  children,
  breadcrumbs,
}: {
  children: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  const pathname = usePathname();
  const fullBleed = FULL_BLEED_PATTERNS.some((p) => p.test(pathname));

  if (fullBleed) {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen grid-cols-[248px_1fr]">
      <Sidebar />
      <div className="flex min-h-screen flex-col bg-bg">
        <Topbar>{breadcrumbs}</Topbar>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
