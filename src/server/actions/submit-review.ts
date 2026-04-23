"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db";

const AnswerSchema = z.object({
  findingId: z.string().min(1),
  value: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  teamSlug: z.string().min(1),
  answers: z.array(AnswerSchema).min(1).max(10),
});

export type SubmitReviewState = {
  ok: boolean;
  error?: string;
  submittedCount?: number;
};

export async function submitReview(
  _prev: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    return { ok: false, error: "Missing payload" };
  }

  let parsed;
  try {
    parsed = InputSchema.parse(JSON.parse(raw));
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not parse review submission",
    };
  }

  const team = await prisma.team.findUnique({
    where: { slug: parsed.teamSlug },
    select: { id: true, championId: true },
  });

  if (!team) {
    return { ok: false, error: `Team ${parsed.teamSlug} not found` };
  }
  if (team.championId === null) {
    return {
      ok: false,
      error: "Team has no Champion assigned; cannot attribute review",
    };
  }

  const findings = await prisma.finding.findMany({
    where: { id: { in: parsed.answers.map((a) => a.findingId) } },
    select: { id: true, agentRun: { select: { scopeTeamId: true } } },
  });

  const foreign = findings.filter((f) => f.agentRun.scopeTeamId !== team.id);
  if (foreign.length > 0) {
    return {
      ok: false,
      error: "Some findings do not belong to this team",
    };
  }

  await prisma.$transaction([
    ...parsed.answers.map((a) =>
      prisma.finding.update({
        where: { id: a.findingId },
        data: {
          value: a.value,
          status: "ACCEPTED",
          lastActor: "HUMAN",
          lastActorId: team.championId,
        },
      }),
    ),
  ]);

  // Recompute the AgentRun summary counts so the Findings summary cards
  // reflect live state (a NEEDS_INPUT finding that's been HUMAN-ACCEPTED
  // should no longer count as "needs input").
  const latestRun = await prisma.team.findUnique({
    where: { id: team.id },
    select: { latestFindingsId: true },
  });
  if (latestRun?.latestFindingsId) {
    const findings = await prisma.finding.findMany({
      where: { agentRunId: latestRun.latestFindingsId },
      select: { source: true, confidence: true, status: true, lastActor: true },
    });
    const autoPopulatedCount = findings.filter(
      (f) =>
        (f.source === "ADO_API" || f.source === "INFERRED") &&
        f.confidence !== "LOW",
    ).length;
    const needsInputCount = findings.filter(
      (f) =>
        f.source === "NEEDS_INPUT" &&
        !(f.lastActor === "HUMAN" && f.status !== "PENDING"),
    ).length;
    const anomalyCount = findings.filter((f) => f.confidence === "LOW").length;
    await prisma.agentRun.update({
      where: { id: latestRun.latestFindingsId },
      data: { autoPopulatedCount, needsInputCount, anomalyCount },
    });
  }

  revalidatePath("/teams");
  revalidatePath(`/teams/${parsed.teamSlug}`);
  revalidatePath(`/teams/${parsed.teamSlug}/review`);
  revalidatePath(`/teams/${parsed.teamSlug}/findings`);

  redirect(`/teams/${parsed.teamSlug}?reviewed=${parsed.answers.length}`);
}
