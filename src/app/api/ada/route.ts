import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getTeamInventory } from "@/server/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_BASE = `You are Ada, the migration review assistant for Microsoft's Azure DevOps → GitHub migration program.

You help champions (engineers shepherding their team through the move) understand the framework and answer questions about their team's specific inventory.

Framework taxonomy (always use these terms; cite IDs when referring to specific items):
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

Response style — IMPORTANT:
- Default to 2–4 sentences. Only go longer when the user asks "explain", "walk me through", or follows up.
- Markdown renders. Use **bold** sparingly for emphasis and bullet lists when listing >3 items. Avoid headers (##) and emojis — the panel is narrow and they feel heavy.
- When you cite a specific item, include its ID inline: "Pull Request linking (J16)" or "Repository entity (E15)". This lets the champion jump to it.
- Numbers must come from the inventory data below. NEVER invent counts ("35 of 88 JTBDs") — if you can't derive a number from the supplied data, say "I'd have to check" rather than guess.
- If the user asks something the data doesn't cover, say so and suggest where they'd find it.`;

type Body = {
  messages: UIMessage[];
  teamSlug?: string | null;
  fieldLabel?: string | null;
  fieldValue?: string | null;
};

export async function POST(req: Request) {
  const { messages, teamSlug, fieldLabel, fieldValue } =
    (await req.json()) as Body;

  let teamContext = "";
  if (teamSlug) {
    const inv = await getTeamInventory(teamSlug);
    if (inv) {
      const customizations = inv.customizations.byCategory.flatMap((g) =>
        g.rows.map((c) => ({
          name: c.name,
          category: c.category,
          parity: c.parity,
          strategy: c.strategy,
        })),
      );
      teamContext = `\n\nCURRENT TEAM CONTEXT (slug: ${teamSlug}):\n${JSON.stringify(
        {
          team: inv.team,
          totals: inv.totals,
          jtbds: inv.groups.flatMap((g) =>
            g.jtbds.map((j) => ({
              id: j.id,
              name: j.name,
              category: g.categoryLabel,
              persona: j.persona,
              frequency: j.frequency,
              staysInAdo: j.staysInAdo,
              features: j.featureNodes.map((f) => ({
                id: f.id,
                name: f.name,
                pattern: f.pattern,
                staysInAdo: f.staysInAdo,
              })),
            })),
          ),
          customizations,
        },
        null,
        2,
      )}`;
    }
  }

  let fieldContext = "";
  if (fieldLabel) {
    fieldContext = `\n\nThe champion is currently reviewing the field "${fieldLabel}"${
      fieldValue ? ` (current value: ${fieldValue})` : ""
    }. Tailor your first response to that field.`;
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: SYSTEM_BASE + teamContext + fieldContext,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
