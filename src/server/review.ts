import "server-only";
import {
  getSpecForFieldPath,
  type ReviewQuestionSpec,
} from "@/lib/review-questions";
import { prisma } from "./db";

export type ReviewQuestion = {
  findingId: string;
  fieldPath: string;
  fieldLabel: string;
  category: string;
  triedNote: string | null;
  currentValue: string | null;
  alreadyAnswered: boolean;
  spec: ReviewQuestionSpec;
};

export type ReviewBundle = {
  teamId: string;
  teamName: string;
  championName: string | null;
  questions: ReviewQuestion[];
  totalNeedsInput: number;
};

export async function getReviewForTeam(
  slug: string,
): Promise<ReviewBundle | null> {
  const team = await prisma.team.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      champion: { select: { name: true } },
      latestFindings: {
        select: {
          findings: {
            where: { source: "NEEDS_INPUT" },
            select: {
              id: true,
              fieldPath: true,
              fieldLabel: true,
              category: true,
              triedNote: true,
              value: true,
              status: true,
              lastActor: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: "asc" },
          },
        },
      },
    },
  });

  if (!team) return null;

  const findings = team.latestFindings?.findings ?? [];

  const withSpec = findings.map((f) => {
    const spec = getSpecForFieldPath(f.fieldPath) ?? {
      kind: "text" as const,
      label: f.fieldLabel,
      helpText: f.triedNote ?? undefined,
    };
    return {
      findingId: f.id,
      fieldPath: f.fieldPath,
      fieldLabel: f.fieldLabel,
      category: f.category,
      triedNote: f.triedNote,
      currentValue: f.value,
      alreadyAnswered: f.lastActor === "HUMAN" && f.status !== "PENDING",
      spec,
    };
  });

  return {
    teamId: team.id,
    teamName: team.name,
    championName: team.champion?.name ?? null,
    questions: withSpec.slice(0, 3),
    totalNeedsInput: findings.length,
  };
}
