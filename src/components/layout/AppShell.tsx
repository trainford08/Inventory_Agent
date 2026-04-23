import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  children,
  breadcrumbs,
}: {
  children: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-[248px_1fr]">
      <Sidebar />
      <div className="flex min-w-0 min-h-screen flex-col bg-bg">
        <Topbar>{breadcrumbs}</Topbar>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
