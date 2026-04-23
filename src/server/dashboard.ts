import "server-only";
import type { MigrationState } from "@/generated/prisma/enums";
import { completionPercent } from "@/lib/completion";
import { prisma } from "./db";

export type DashboardTeamRef = {
  slug: string;
  name: string;
  cohort: string;
  wave: number | null;
};

export type TriageItem = DashboardTeamRef & {
  subtitle: string;
  age: string;
};

export type LifecycleCounts = {
  discovery: number;
  planning: number;
  execution: number;
  cutover: number;
  done: number;
  rolledBack: number;
};

export type HealthCounts = {
  onTrack: number;
  atRisk: number;
  blocked: number;
  done: number;
  unassigned: number;
};

export type WaveSummary = {
  key: string;
  label: string;
  teamCount: number;
  completedCount: number;
  status: "complete" | "active" | "upcoming" | "unassigned";
};

export type DashboardData = {
  championName: string;
  teamTotal: number;
  blockers: { count: number; items: TriageItem[] };
  adaHandoffs: { count: number; items: TriageItem[] };
  cutoverSlips: { count: number; items: TriageItem[] };
  readyToAdvance: { count: number; items: TriageItem[] };
  lifecycle: LifecycleCounts;
  health: HealthCounts;
  waves: WaveSummary[];
  actionItemCount: number;
};

const LIFECYCLE_BUCKET: Record<MigrationState, keyof LifecycleCounts | null> = {
  NOT_STARTED: "discovery",
  DISCOVERING: "discovery",
  REVIEWING: "planning",
  READY: "planning",
  IN_PROGRESS: "execution",
  COMPLETED: "done",
  ROLLED_BACK: "rolledBack",
};

export async function getDashboardData(): Promise<DashboardData> {
  const teams = await prisma.team.findMany({
    orderBy: [{ wave: "asc" }, { name: "asc" }],
    include: {
      risks: { where: { status: "OPEN" }, select: { id: true } },
      champion: { select: { name: true } },
      latestFindings: {
        include: {
          findings: { select: { status: true, lastActor: true } },
        },
      },
    },
  });

  // Seed champion = the one representative champion we surface in the greeting.
  // In a real program the logged-in user would be threaded through auth.
  const championName =
    teams.find((t) => t.slug === "charlie")?.champion?.name ??
    teams.find((t) => t.champion?.name)?.champion?.name ??
    "Champion";

  const blockers: TriageItem[] = [];
  const cutoverSlips: TriageItem[] = [];
  const readyToAdvance: TriageItem[] = [];

  const lifecycle: LifecycleCounts = {
    discovery: 0,
    planning: 0,
    execution: 0,
    cutover: 0,
    done: 0,
    rolledBack: 0,
  };
  const health: HealthCounts = {
    onTrack: 0,
    atRisk: 0,
    blocked: 0,
    done: 0,
    unassigned: 0,
  };

  for (const t of teams) {
    const bucket = LIFECYCLE_BUCKET[t.migrationState];
    if (bucket) lifecycle[bucket] += 1;

    switch (t.healthStatus) {
      case "ON_TRACK":
        health.onTrack += 1;
        break;
      case "AT_RISK":
        health.atRisk += 1;
        break;
      case "BLOCKED":
        health.blocked += 1;
        break;
      case "DONE":
        health.done += 1;
        break;
      default:
        health.unassigned += 1;
    }

    const findings = t.latestFindings?.findings ?? [];
    const pct = completionPercent(findings);

    if (t.risks.length > 0 && t.healthStatus !== "DONE") {
      blockers.push({
        slug: t.slug,
        name: t.name,
        cohort: t.cohort,
        wave: t.wave,
        subtitle: `${t.risks.length} open ${t.risks.length === 1 ? "risk" : "risks"}`,
        age: t.healthStatus === "BLOCKED" ? "blocker" : "review",
      });
    }

    if (t.slackWeeks !== null && t.slackWeeks < 0) {
      cutoverSlips.push({
        slug: t.slug,
        name: t.name,
        cohort: t.cohort,
        wave: t.wave,
        subtitle: `${Math.abs(t.slackWeeks)}w behind · ${pct}% reviewed`,
        age: `${t.slackWeeks}w`,
      });
    }

    if (t.migrationState === "READY") {
      readyToAdvance.push({
        slug: t.slug,
        name: t.name,
        cohort: t.cohort,
        wave: t.wave,
        subtitle: `${pct}% reviewed · ready for cutover`,
        age: "ready",
      });
    }
  }

  // Waves
  const byWave = new Map<number | null, typeof teams>();
  for (const t of teams) {
    const key = t.wave;
    const list = byWave.get(key) ?? [];
    list.push(t);
    byWave.set(key, list);
  }
  const wavesSorted = Array.from(byWave.entries()).sort(([a], [b]) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  });
  const waves: WaveSummary[] = wavesSorted.map(([wave, teamsInWave]) => {
    const completed = teamsInWave.filter(
      (t) => t.migrationState === "COMPLETED",
    ).length;
    const inProgress = teamsInWave.some(
      (t) =>
        t.migrationState === "IN_PROGRESS" || t.migrationState === "REVIEWING",
    );
    const allComplete =
      teamsInWave.length > 0 && completed === teamsInWave.length;
    const status: WaveSummary["status"] =
      wave === null
        ? "unassigned"
        : allComplete
          ? "complete"
          : inProgress
            ? "active"
            : "upcoming";
    return {
      key: wave === null ? "unassigned" : `w${wave}`,
      label:
        wave === null ? "Unassigned" : `Wave ${String(wave).padStart(2, "0")}`,
      teamCount: teamsInWave.length,
      completedCount: completed,
      status,
    };
  });

  const actionItemCount =
    blockers.length + cutoverSlips.length + readyToAdvance.length;

  return {
    championName,
    teamTotal: teams.length,
    blockers: {
      count: blockers.length,
      items: blockers.slice(0, 4),
    },
    adaHandoffs: { count: 0, items: [] },
    cutoverSlips: {
      count: cutoverSlips.length,
      items: cutoverSlips.slice(0, 4),
    },
    readyToAdvance: {
      count: readyToAdvance.length,
      items: readyToAdvance.slice(0, 4),
    },
    lifecycle,
    health,
    waves,
    actionItemCount,
  };
}
