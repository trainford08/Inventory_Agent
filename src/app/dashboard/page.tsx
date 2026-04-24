import { AttentionQueue } from "@/components/dashboard/AttentionQueue";
import { DashboardDirectory } from "@/components/dashboard/DashboardDirectory";
import { ProgramPulse } from "@/components/dashboard/ProgramPulse";
import { getDashboardData } from "@/server/dashboard";
import { listTeams } from "@/server/teams";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, teams] = await Promise.all([getDashboardData(), listTeams()]);

  // eslint-disable-next-line react-hooks/purity -- server component renders once per request
  const nowMs = Date.now();
  const dateLine = new Date(nowMs).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1100px] px-[32px] py-[32px]">
      <header className="mb-[36px]">
        <h1 className="mb-[6px] text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
          Program dashboard
        </h1>
        <p className="font-mono text-[12px] font-medium tracking-[0.01em] text-ink-muted">
          {dateLine}
        </p>
      </header>

      <ProgramPulse
        teamTotal={data.teamTotal}
        lifecycle={data.lifecycle}
        health={data.health}
        waveCount={data.waves.filter((w) => w.key !== "unassigned").length}
        readyCount={data.readyToAdvance.count}
        refreshedLabel="just now"
      />

      <AttentionQueue
        blockers={data.blockers}
        adaHandoffs={data.adaHandoffs}
        cutoverSlips={data.cutoverSlips}
        readyToAdvance={data.readyToAdvance}
      />

      <DashboardDirectory teams={teams} nowMs={nowMs} />
    </div>
  );
}
