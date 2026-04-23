"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";

const FindingIdInput = z.object({ findingId: z.string().min(1) });
const EditInput = FindingIdInput.extend({ value: z.string().min(1).max(4000) });

type Result = { ok: true } | { ok: false; error: string };

async function getTeamForFinding(findingId: string) {
  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    select: {
      id: true,
      agentRun: {
        select: {
          scopeTeamId: true,
          runOf: { select: { slug: true, championId: true } },
        },
      },
    },
  });
  if (!finding) return null;
  return {
    findingId: finding.id,
    teamSlug: finding.agentRun.runOf?.slug ?? null,
    championId: finding.agentRun.runOf?.championId ?? null,
  };
}

function invalidate(slug: string | null) {
  if (slug) {
    revalidatePath(`/teams/${slug}/review`);
    revalidatePath(`/teams/${slug}/complete`);
    revalidatePath(`/teams/${slug}`);
    revalidatePath(`/teams/${slug}/findings`);
  }
  revalidatePath("/teams");
}

export async function acceptFinding(
  input: z.infer<typeof FindingIdInput>,
): Promise<Result> {
  const { findingId } = FindingIdInput.parse(input);
  const ctx = await getTeamForFinding(findingId);
  if (!ctx || !ctx.championId) {
    return { ok: false, error: "Finding or Champion not found" };
  }
  await prisma.finding.update({
    where: { id: findingId },
    data: {
      status: "ACCEPTED",
      lastActor: "HUMAN",
      lastActorId: ctx.championId,
    },
  });
  invalidate(ctx.teamSlug);
  return { ok: true };
}

export async function editFinding(
  input: z.infer<typeof EditInput>,
): Promise<Result> {
  const { findingId, value } = EditInput.parse(input);
  const ctx = await getTeamForFinding(findingId);
  if (!ctx || !ctx.championId) {
    return { ok: false, error: "Finding or Champion not found" };
  }
  await prisma.finding.update({
    where: { id: findingId },
    data: {
      status: "CORRECTED",
      lastActor: "HUMAN",
      lastActorId: ctx.championId,
      value,
    },
  });
  invalidate(ctx.teamSlug);
  return { ok: true };
}

export async function flagFinding(
  input: z.infer<typeof FindingIdInput>,
): Promise<Result> {
  const { findingId } = FindingIdInput.parse(input);
  const ctx = await getTeamForFinding(findingId);
  if (!ctx || !ctx.championId) {
    return { ok: false, error: "Finding or Champion not found" };
  }
  await prisma.finding.update({
    where: { id: findingId },
    data: {
      status: "OVERRIDDEN",
      lastActor: "HUMAN",
      lastActorId: ctx.championId,
    },
  });
  invalidate(ctx.teamSlug);
  return { ok: true };
}

export async function undoFinding(
  input: z.infer<typeof FindingIdInput>,
): Promise<Result> {
  const { findingId } = FindingIdInput.parse(input);
  const ctx = await getTeamForFinding(findingId);
  if (!ctx) {
    return { ok: false, error: "Finding not found" };
  }
  await prisma.finding.update({
    where: { id: findingId },
    data: {
      status: "PENDING",
      lastActor: null,
      lastActorId: null,
    },
  });
  invalidate(ctx.teamSlug);
  return { ok: true };
}
