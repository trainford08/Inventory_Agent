import type { ReactNode } from "react";
import { GlobalAda } from "@/components/ada/GlobalAda";
import { listAllTeamProgress } from "@/server/complete-profile-sidebar";
import { listTeams } from "@/server/teams";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export async function AppShell({
  children,
  breadcrumbs,
}: {
  children: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  // eslint-disable-next-line react-hooks/purity -- server component renders once per request
  const nowMs = Date.now();
  const [teams, progressByTeam] = await Promise.all([
    listTeams(),
    listAllTeamProgress(nowMs),
  ]);
  const defaultTeamSlug = teams[0]?.slug ?? null;

  return (
    <div className="grid min-h-screen grid-cols-[248px_1fr]">
      <Sidebar
        defaultTeamSlug={defaultTeamSlug}
        progressByTeam={progressByTeam}
      />
      <div className="flex min-w-0 min-h-screen flex-col bg-bg">
        <Topbar>{breadcrumbs}</Topbar>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <GlobalAda />
    </div>
  );
}
