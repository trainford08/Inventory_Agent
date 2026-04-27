"use server";

import type { UIMessage } from "ai";
import { z } from "zod";
import { prisma } from "@/server/db";

const SlugInput = z.object({ slug: z.string().min(1) });
const SaveInput = SlugInput.extend({
  // We trust the client-side useChat shape. Stored as Json blob.
  messages: z.array(z.unknown()),
});

type LoadResult =
  | { ok: true; messages: UIMessage[] }
  | { ok: false; error: string };

export async function loadAdaConversation(input: {
  slug: string;
}): Promise<LoadResult> {
  const parsed = SlugInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  try {
    const team = await prisma.team.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (!team) return { ok: true, messages: [] };
    const conv = await prisma.adaConversation.findUnique({
      where: { teamId: team.id },
      select: { messages: true },
    });
    return {
      ok: true,
      messages: (conv?.messages as UIMessage[] | null) ?? [],
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "load failed",
    };
  }
}

type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveAdaConversation(input: {
  slug: string;
  messages: unknown[];
}): Promise<SaveResult> {
  const parsed = SaveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  try {
    const team = await prisma.team.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (!team) return { ok: false, error: "team not found" };
    if (parsed.data.messages.length === 0) {
      await prisma.adaConversation
        .delete({ where: { teamId: team.id } })
        .catch(() => null);
      return { ok: true };
    }
    await prisma.adaConversation.upsert({
      where: { teamId: team.id },
      create: {
        teamId: team.id,
        messages: parsed.data.messages as object,
      },
      update: {
        messages: parsed.data.messages as object,
      },
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "save failed",
    };
  }
}
