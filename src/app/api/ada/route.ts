import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { FIELDS_BY_ENTITY } from "@/lib/inventory-fields";
import {
  ENTITY_BY_ID,
  FEATURE_BY_ID,
  FEATURES,
  JTBDS,
  JTBDS_BY_FEATURE,
  FEATURES_BY_ENTITY,
} from "@/lib/inventory-framework";
import { getTeamInventory } from "@/server/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_BASE = `You are Ada, the migration review assistant for Microsoft's Azure DevOps → GitHub migration program.

You help champions (engineers shepherding their team through the move) understand the framework and answer questions about their team's specific inventory.

Framework taxonomy:
- JTBD = Job-To-Be-Done. Work an engineer does. IDs look like J01, J16.
- Feature = a platform capability a JTBD depends on. IDs look like F01, F19.
- Entity = a data object a feature touches. IDs look like E15.
- Field = an attribute on an entity.

Migration patterns:
- P1 Exact 1:1 — same meaning, same shape, different name.
- P2 Lossy 1:1 — data transfers but structure/hierarchy is lost.
- P3 Compositional — multiple GitHub fields combined reconstruct the capability.
- P4 Decompositional — one ADO field carries multiple meanings, split across GitHub.
- P5 Capability substitution — different mechanism, same outcome.
- P6 Gap — capability cannot be preserved.

Hybrid model: some ADO services move to GitHub (Repos, Pipelines), some stay in ADO (Boards, Test Plans). Hybrid friction lives at the boundary (e.g. linking PRs to work items via AB#123 syntax).

You have tools available to query the framework and the active team's inventory. Use them whenever the user asks anything specific — never guess numbers or names. If you can answer from general knowledge of the framework alone, you can skip the tools.

Response style:
- Default to 2–4 sentences. Only go longer when the user asks "explain", "walk me through", or follows up.
- Markdown renders. Use **bold** sparingly and bullet lists when listing >3 items. Avoid headers (##) and emojis.
- Cite IDs inline: "Pull Request linking (J16)" or "Repository (E15)". They render as clickable chips.
- Numbers must come from tool results. If the data doesn't have what's needed, say so plainly.`;

type Body = {
  messages: UIMessage[];
  teamSlug?: string | null;
  fieldLabel?: string | null;
  fieldValue?: string | null;
};

export async function POST(req: Request) {
  const { messages, teamSlug, fieldLabel, fieldValue } =
    (await req.json()) as Body;

  const fieldContext = fieldLabel
    ? `\n\nThe champion is currently reviewing the field "${fieldLabel}"${
        fieldValue ? ` (current value: ${fieldValue})` : ""
      }. Tailor your first response to that field.`
    : "";

  const teamHint = teamSlug
    ? `\n\nActive team slug: ${teamSlug}. Use this slug when calling team-scoped tools.`
    : "\n\nNo active team. Team-scoped tools will not be available.";

  const tools = {
    getTeamSummary: tool({
      description:
        "Get totals for the active team: JTBDs in scope, features touched, entities touched, customization counts, orphan features.",
      inputSchema: z.object({
        slug: z.string().describe("Team slug, e.g. 'echo'"),
      }),
      execute: async ({ slug }) => {
        const inv = await getTeamInventory(slug);
        if (!inv) return { error: `Team '${slug}' not found.` };
        return {
          team: inv.team,
          totals: inv.totals,
          customizations: {
            total: inv.customizations.total,
            cataloged: inv.customizations.cataloged,
            teamSpecific: inv.customizations.teamSpecific,
          },
          orphanFeatures: inv.coverage.orphanFeatures.length,
        };
      },
    }),
    listJtbds: tool({
      description:
        "List the team's in-scope JTBDs. Optional filters narrow by hybrid approach (ado/gh/both/na), persona, or category.",
      inputSchema: z.object({
        slug: z.string(),
        staysInAdo: z.enum(["ado", "gh", "both", "na"]).optional(),
        persona: z.string().optional(),
        category: z.string().optional(),
      }),
      execute: async ({ slug, staysInAdo, persona, category }) => {
        const inv = await getTeamInventory(slug);
        if (!inv) return { error: `Team '${slug}' not found.` };
        const all = inv.groups.flatMap((g) =>
          g.jtbds.map((j) => ({
            id: j.id,
            name: j.name,
            category: g.categoryLabel,
            persona: j.persona,
            frequency: j.frequency,
            staysInAdo: j.staysInAdo,
            featureCount: j.featureNodes.length,
            featureIds: j.featureNodes.map((f) => f.id),
          })),
        );
        const filtered = all.filter(
          (j) =>
            (!staysInAdo || j.staysInAdo === staysInAdo) &&
            (!persona || j.persona.toLowerCase() === persona.toLowerCase()) &&
            (!category ||
              j.category.toLowerCase().includes(category.toLowerCase())),
        );
        return { count: filtered.length, jtbds: filtered };
      },
    }),
    listFeatures: tool({
      description:
        "List the team's in-scope features. Optional filters: pattern (P1-P6), staysInAdo.",
      inputSchema: z.object({
        slug: z.string(),
        pattern: z.enum(["P1", "P2", "P3", "P4", "P5", "P6"]).optional(),
        staysInAdo: z.enum(["ado", "gh", "both", "na"]).optional(),
      }),
      execute: async ({ slug, pattern, staysInAdo }) => {
        const inv = await getTeamInventory(slug);
        if (!inv) return { error: `Team '${slug}' not found.` };
        const fset = new Set<string>();
        for (const g of inv.groups)
          for (const j of g.jtbds)
            for (const f of j.featureNodes) fset.add(f.id);
        const all = [...fset]
          .map((fid) => FEATURE_BY_ID[fid])
          .filter(Boolean)
          .map((f) => ({
            id: f.id,
            name: f.name,
            pattern: f.pattern,
            staysInAdo: f.staysInAdo,
            category: f.category,
            sharedAcrossJtbds: (JTBDS_BY_FEATURE[f.id] ?? []).length,
            entityIds: f.entities,
          }));
        const filtered = all.filter(
          (f) =>
            (!pattern || f.pattern === pattern) &&
            (!staysInAdo || f.staysInAdo === staysInAdo),
        );
        return { count: filtered.length, features: filtered };
      },
    }),
    listEntities: tool({
      description:
        "List the team's in-scope entities. Optional filters: pattern, staysInAdo, dataPreservation, risk.",
      inputSchema: z.object({
        slug: z.string(),
        pattern: z.enum(["P1", "P2", "P3", "P4", "P5", "P6"]).optional(),
        staysInAdo: z.enum(["ado", "gh", "both", "na"]).optional(),
        dataPreservation: z
          .enum(["high", "medium", "low", "gap", "na"])
          .optional(),
        risk: z.enum(["trivial", "low", "medium", "high", "na"]).optional(),
      }),
      execute: async ({
        slug,
        pattern,
        staysInAdo,
        dataPreservation,
        risk,
      }) => {
        const inv = await getTeamInventory(slug);
        if (!inv) return { error: `Team '${slug}' not found.` };
        const eset = new Set<string>();
        for (const g of inv.groups)
          for (const j of g.jtbds)
            for (const f of j.featureNodes)
              for (const e of f.entityNodes) eset.add(e.id);
        const all = [...eset]
          .map((eid) => ENTITY_BY_ID[eid])
          .filter(Boolean)
          .map((e) => ({
            id: e.id,
            name: e.name,
            pattern: e.pattern,
            staysInAdo: e.staysInAdo,
            dataPreservation: e.dataPreservation,
            capabilityPreservation: e.capabilityPreservation,
            risk: e.risk,
            sharedAcrossFeatures: (FEATURES_BY_ENTITY[e.id] ?? []).length,
            fieldCount: (FIELDS_BY_ENTITY[e.id] ?? []).length,
          }));
        const filtered = all.filter(
          (e) =>
            (!pattern || e.pattern === pattern) &&
            (!staysInAdo || e.staysInAdo === staysInAdo) &&
            (!dataPreservation || e.dataPreservation === dataPreservation) &&
            (!risk || e.risk === risk),
        );
        return { count: filtered.length, entities: filtered };
      },
    }),
    getItem: tool({
      description:
        "Get full detail for a single JTBD/Feature/Entity by its ID (e.g. 'J16', 'F19', 'E15').",
      inputSchema: z.object({
        id: z.string().describe("Item ID like J01, F19, or E15"),
      }),
      execute: async ({ id }) => {
        const kind = id[0];
        if (kind === "J") {
          const j = JTBDS.find((x) => x.id === id);
          if (!j) return { error: `JTBD ${id} not found` };
          return { kind: "jtbd", ...j };
        }
        if (kind === "F") {
          const f = FEATURES.find((x) => x.id === id);
          if (!f) return { error: `Feature ${id} not found` };
          return { kind: "feature", ...f };
        }
        if (kind === "E") {
          const e = ENTITY_BY_ID[id];
          if (!e) return { error: `Entity ${id} not found` };
          return {
            kind: "entity",
            ...e,
            fields: FIELDS_BY_ENTITY[id] ?? [],
          };
        }
        return { error: `Unknown ID prefix: ${id}` };
      },
    }),
    getCustomizations: tool({
      description:
        "Get the team's customizations (cataloged + team-specific). Use when the user asks about custom workflows, gates, or anything outside the standard framework.",
      inputSchema: z.object({ slug: z.string() }),
      execute: async ({ slug }) => {
        const inv = await getTeamInventory(slug);
        if (!inv) return { error: `Team '${slug}' not found.` };
        return {
          total: inv.customizations.total,
          rows: inv.customizations.byCategory.flatMap((g) =>
            g.rows.map((c) => ({
              name: c.name,
              category: c.category,
              parity: c.parity,
              strategy: c.strategy,
              hybridPlacement: c.hybridPlacement,
              status: c.status,
            })),
          ),
        };
      },
    }),
  };

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: SYSTEM_BASE + teamHint + fieldContext,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(6),
  });

  return result.toUIMessageStreamResponse();
}
