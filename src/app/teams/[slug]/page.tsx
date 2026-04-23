import { notFound } from "next/navigation";
import { PhaseTracker } from "@/components/PhaseTracker";
import { EffortCard } from "@/components/team/EffortCard";
import {
  OutstandingWork,
  type OutstandingItem,
} from "@/components/team/OutstandingWork";
import { ReadinessCard } from "@/components/team/ReadinessCard";
import { ScopeCard } from "@/components/team/ScopeCard";
import { TeamMakeupCard } from "@/components/team/TeamMakeupCard";
import { TeamProfileHeader } from "@/components/team/TeamProfileHeader";
import type { MigrationApproach } from "@/generated/prisma/enums";
import { PHASE_STEPS, phaseSnapshot } from "@/lib/phase";
import { relativeTime } from "@/lib/time";
import { getTeamBySlug } from "@/server/teams";

export const dynamic = "force-dynamic";

export default async function TeamOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reviewed?: string }>;
}) {
  const { slug } = await params;
  const { reviewed } = await searchParams;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const reviewedCount = reviewed ? Number(reviewed) : null;
  const showBanner =
    reviewedCount !== null &&
    Number.isFinite(reviewedCount) &&
    reviewedCount > 0;

  const phase = phaseSnapshot(team.migrationState);
  const scopeCounts = countByApproach(team.jtbds);
  const outstanding = buildOutstanding(team);

  // eslint-disable-next-line react-hooks/purity -- server component renders once per request
  const nowMs = Date.now();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-[32px] py-[28px]">
      <TeamProfileHeader team={team} nowMs={nowMs} />

      {showBanner ? (
        <div className="rounded-md border border-success-soft bg-success-soft px-4 py-3 text-[13px] text-success-ink">
          ✓ Submitted {reviewedCount}{" "}
          {reviewedCount === 1 ? "answer" : "answers"}. Champion review progress
          updated below.
        </div>
      ) : null}

      <PhaseTracker
        title="Migration phase"
        progressLabel={`${phase.overallPercent}% overall · ${phase.currentStep} ${phase.currentStepPercent}%`}
        phases={PHASE_STEPS.map((label, i) => ({
          label,
          state: phase.stepStates[i],
          progress:
            phase.stepStates[i] === "active"
              ? phase.currentStepPercent
              : undefined,
        }))}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ScopeCard total={team.jtbds.length} counts={scopeCounts} />
        <EffortCard
          lowWeeks={team.effortEstimateLowWeeks}
          highWeeks={team.effortEstimateHighWeeks}
          confidence={team.effortConfidence}
          progressWeeks={team.effortProgressWeeks}
          targetCutoverAt={team.targetCutoverAt}
          slackWeeks={team.slackWeeks}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ReadinessCard team={team} />
        <TeamMakeupCard team={team} />
      </div>

      <OutstandingWork items={outstanding} />
    </div>
  );
}

function countByApproach(
  jtbds: { migrationApproach: MigrationApproach | null }[],
): Record<MigrationApproach, number> {
  const counts: Record<MigrationApproach, number> = {
    MOVES: 0,
    STAYS: 0,
    BOTH: 0,
    MIXED: 0,
  };
  for (const j of jtbds) {
    if (j.migrationApproach !== null) counts[j.migrationApproach] += 1;
  }
  return counts;
}

function buildOutstanding(team: {
  risks: Array<{
    title: string;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    status: "OPEN" | "MITIGATED" | "ACCEPTED" | "CLOSED";
    category: string;
    mitigation: string | null;
  }>;
  latestFindings: {
    findings: Array<{
      fieldLabel: string;
      source: "ADO_API" | "INFERRED" | "NEEDS_INPUT";
      status: "PENDING" | "ACCEPTED" | "CORRECTED" | "OVERRIDDEN";
      lastActor: "AGENT" | "HUMAN" | null;
      category: string;
      updatedAt: Date;
      triedNote: string | null;
    }>;
  } | null;
}): OutstandingItem[] {
  const items: OutstandingItem[] = [];

  for (const r of team.risks) {
    if (r.status !== "OPEN") continue;
    items.push({
      kind: r.confidence === "HIGH" ? "blocker" : "review",
      title: r.title,
      meta: `${r.category}${r.mitigation === null ? " · no mitigation" : ""}`,
      age: r.confidence === "HIGH" ? "urgent" : undefined,
      urgent: r.confidence === "HIGH",
    });
  }

  // Filter out findings that have already been human-verified — these are
  // "done" and shouldn't clutter the outstanding list.
  const needsInput =
    team.latestFindings?.findings.filter(
      (f) =>
        f.source === "NEEDS_INPUT" &&
        !(f.lastActor === "HUMAN" && f.status !== "PENDING"),
    ) ?? [];
  for (const f of needsInput) {
    items.push({
      kind: "flag",
      title: f.fieldLabel,
      meta: f.triedNote ?? f.category,
      age: relativeTime(f.updatedAt),
    });
  }

  const priority = { blocker: 0, review: 1, flag: 2 };
  items.sort((a, b) => priority[a.kind] - priority[b.kind]);
  return items.slice(0, 4);
}
