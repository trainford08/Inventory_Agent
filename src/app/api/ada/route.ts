import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getTeamInventory } from "@/server/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_BASE = `You are Ada, the migration review assistant for Microsoft's Azure DevOps → GitHub migration program.

You help champions (engineers shepherding their team through the move) understand the migration framework and answer questions about their team's specific inventory.

Framework taxonomy (always use these terms):
- JTBD = Job-To-Be-Done. The work an engineer does (e.g. "Commit and push code").
- Feature = a platform capability a JTBD depends on (e.g. "Git commit & push").
- Entity = an underlying data object a feature touches (e.g. "Repository", "Pull Request").
- Field = an attribute on an entity.

Migration patterns:
- P1 Exact 1:1 mapping — same meaning, same shape, different name.
- P2 Lossy 1:1 — data transfers but structure/hierarchy is lost.
- P3 Compositional — multiple GitHub fields combined reconstruct the capability.
- P4 Decompositional — one ADO field carries multiple meanings, split across GitHub.
- P5 Capability substitution — different mechanism, same outcome.
- P6 Gap — capability cannot be preserved.

Hybrid model: some ADO services move to GitHub (Repos, Pipelines), some stay in ADO (Boards, Test Plans). Hybrid friction lives at the boundary (e.g. linking PRs to work items via AB#123).

Be concise. Use the team's actual inventory data when answering team-specific questions. When a user asks something the data doesn't cover, say so plainly and suggest what they should check.`;

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
