import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type {
  Cohort,
  HealthStatus,
  MigrationState,
} from "@/generated/prisma/enums";
import { completionPercent } from "@/lib/completion";
import { prisma } from "./db";

export type TeamListItem = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  cohort: Cohort;
  wave: number | null;
  migrationState: MigrationState;
  healthStatus: HealthStatus | null;
  engineerCount: number | null;
  targetCutoverAt: Date | null;
  slackWeeks: number | null;
  openBlockerCount: number;
  completionPercent: number;
  findingCounts: {
    total: number;
    auto: number;
    needsInput: number;
    anomalies: number;
  };
};

const teamProfileInclude = {
  org: true,
  champion: true,
  members: { orderBy: { name: "asc" } },
  codebase: {
    include: {
      repos: { orderBy: { name: "asc" } },
    },
  },
  workflows: { orderBy: { name: "asc" } },
  jtbds: { orderBy: { jtbdCode: "asc" } },
  customizations: { orderBy: { category: "asc" } },
  risks: { orderBy: [{ confidence: "desc" }, { title: "asc" }] },
  ownership: true,
  adoProjects: { orderBy: { name: "asc" } },
  serviceConnections: { orderBy: { name: "asc" } },
  releaseDefinitions: { orderBy: { name: "asc" } },
  extensions: { orderBy: { name: "asc" } },
  latestFindings: {
    include: {
      findings: {
        select: {
          id: true,
          status: true,
          lastActor: true,
          fieldLabel: true,
          fieldPath: true,
          category: true,
          source: true,
          confidence: true,
          value: true,
          triedNote: true,
          updatedAt: true,
          evidence: {
            select: {
              id: true,
              kind: true,
              path: true,
              snippet: true,
              metadata: true,
              sourceUrl: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.TeamInclude;

export type TeamProfile = Prisma.TeamGetPayload<{
  include: typeof teamProfileInclude;
}>;

export const getTeamBySlug = cache(
  async (slug: string): Promise<TeamProfile | null> => {
    return prisma.team.findUnique({
      where: { slug },
      include: teamProfileInclude,
    });
  },
);

export async function listTeams(): Promise<TeamListItem[]> {
  const teams = await prisma.team.findMany({
    orderBy: [{ cohort: "asc" }],
    include: {
      risks: { where: { status: "OPEN" }, select: { id: true } },
      latestFindings: {
        include: {
          findings: {
            select: { status: true, lastActor: true },
          },
        },
      },
    },
  });

  return teams.map((t) => {
    const findings = t.latestFindings?.findings ?? [];
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline,
      description: t.description,
      cohort: t.cohort,
      wave: t.wave,
      migrationState: t.migrationState,
      healthStatus: t.healthStatus,
      engineerCount: t.engineerCount,
      targetCutoverAt: t.targetCutoverAt,
      slackWeeks: t.slackWeeks,
      openBlockerCount: t.risks.length,
      completionPercent: completionPercent(findings),
      findingCounts: {
        total: findings.length,
        auto: t.latestFindings?.autoPopulatedCount ?? 0,
        needsInput: t.latestFindings?.needsInputCount ?? 0,
        anomalies: t.latestFindings?.anomalyCount ?? 0,
      },
    };
  });
}
