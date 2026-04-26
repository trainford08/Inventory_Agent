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
  computeProgramOverview,
  computeTeamFriction,
} from "@/server/program-overview";
import { prisma } from "@/server/db";
import {
  ENTITY_BY_ID,
  FEATURE_BY_ID,
  FEATURES,
  JTBDS,
  JTBDS_BY_FEATURE,
  FEATURES_BY_ENTITY,
} from "@/lib/inventory-framework";
import { getTeamInventory } from "@/server/inventory";
import { getTeamBySlug, listTeams } from "@/server/teams";

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

You have tools available to query the framework, the active team's inventory, and program-wide rollups across ALL teams. Use them whenever the user asks anything specific — never guess numbers or names. For program/portfolio questions ("how many teams scanned?", "what % of features stay in ADO across the program?", "what migration approaches are most common?"), call getProgramOverview. For cross-team comparisons or rankings ("which team has the most friction?", "rank teams by complexity"), call listTeamsByFriction. For cohort-level patterns ("which cohort has the most gaps?"), call getCohortBreakdown. For "what did the agent find?" or evidence questions, call searchFindings. For "how far along are we / what's left to review?", call getReviewProgress. For team-specific questions, use the team-scoped tools. If you can answer from general knowledge of the framework alone, you can skip the tools.

Response style:
- Default to 2–4 sentences. Only go longer when the user asks "explain", "walk me through", or follows up.
- Markdown renders. Use **bold** sparingly and bullet lists when listing >3 items. Avoid headers (##) and emojis.
- Cite IDs inline: "Pull Request linking (J16)" or "Repository (E15)". They render as clickable chips.
- Numbers must come from tool results. If the data doesn't have what's needed, say so plainly.`;

type Body = {
  messages: UIMessage[];
  teamSlug?: string | null;
  fieldId?: string | null;
  fieldLabel?: string | null;
  fieldValue?: string | null;
};

export async function POST(req: Request) {
  const { messages, teamSlug, fieldId, fieldLabel, fieldValue } =
    (await req.json()) as Body;

  const fieldContext = fieldLabel
    ? `\n\nThe champion is currently reviewing the field "${fieldLabel}"${
        fieldValue ? ` (current value: ${fieldValue})` : ""
      }${fieldId ? ` (id: ${fieldId})` : ""}. Tailor your first response to that field. When you have a confident, specific answer for this field, call the proposeAnswer tool so the champion can accept it with one click.`
    : "";

  const teamHint = teamSlug
    ? `\n\nActive team slug: ${teamSlug}. Use this slug when calling team-scoped tools.`
    : "\n\nNo active team. Team-scoped tools will not be available.";

  const tools = {
    getTeamSummary: tool({
      description:
        "Get totals, schedule, AND ownership for a team: JTBDs in scope, features touched, entities touched, customization counts, orphan features, cohort, wave, migration state, health, target cutover date, engineer count, the team's Champion (lead engineer shepherding the migration), and team members. Use this for any 'when does X cutover', 'what wave is Y in', 'who is the Champion for Z', 'who's on the team' question.",
      inputSchema: z.object({
        slug: z.string().describe("Team slug, e.g. 'echo'"),
      }),
      execute: async ({ slug }) => {
        const [inv, teams, profile] = await Promise.all([
          getTeamInventory(slug),
          listTeams(),
          getTeamBySlug(slug),
        ]);
        if (!inv) return { error: `Team '${slug}' not found.` };
        const t = teams.find((x) => x.slug === slug);
        const champion = profile?.champion
          ? {
              name: profile.champion.name,
              email: profile.champion.email ?? null,
              role: profile.champion.role ?? null,
            }
          : null;
        const members =
          profile?.members?.map((m) => ({
            name: m.name,
            email: m.email ?? null,
            role: m.role ?? null,
          })) ?? [];
        return {
          team: inv.team,
          champion,
          members,
          totals: inv.totals,
          customizations: {
            total: inv.customizations.total,
            cataloged: inv.customizations.cataloged,
            teamSpecific: inv.customizations.teamSpecific,
          },
          orphanFeatures: inv.coverage.orphanFeatures.length,
          schedule: t
            ? {
                cohort: t.cohort,
                wave: t.wave,
                migrationState: t.migrationState,
                healthStatus: t.healthStatus,
                targetCutoverAt: t.targetCutoverAt
                  ? t.targetCutoverAt.toISOString()
                  : null,
                slackWeeks: t.slackWeeks,
                engineerCount: t.engineerCount,
                openBlockerCount: t.openBlockerCount,
                completionPercent: t.completionPercent,
              }
            : null,
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
    searchFindings: tool({
      description:
        "Search the agent's discovery findings for a team — the structured evidence rows the agent produced (field label, value, source, confidence, triedNote). Use this when the user asks 'what did the agent find about X?', 'what's the evidence for Y?', or wants to see raw discovery data. Returns findings where the field label, path, value, or triedNote matches the query (case-insensitive substring).",
      inputSchema: z.object({
        slug: z
          .string()
          .describe("Team slug. Falls back to the active team if omitted."),
        query: z
          .string()
          .describe(
            "Substring to match against fieldLabel/fieldPath/value/triedNote.",
          ),
        limit: z.number().int().positive().max(25).optional(),
      }),
      execute: async ({ slug, query, limit }) => {
        const team = await prisma.team.findUnique({
          where: { slug },
          select: { id: true, latestFindingsId: true },
        });
        if (!team) return { error: `Team '${slug}' not found.` };
        if (!team.latestFindingsId)
          return { count: 0, findings: [], note: "No agent run on file." };
        const q = query.toLowerCase();
        const findings = await prisma.finding.findMany({
          where: { agentRunId: team.latestFindingsId },
          select: {
            fieldLabel: true,
            fieldPath: true,
            category: true,
            value: true,
            source: true,
            confidence: true,
            status: true,
            triedNote: true,
          },
        });
        const matches = findings
          .filter(
            (f) =>
              f.fieldLabel.toLowerCase().includes(q) ||
              f.fieldPath.toLowerCase().includes(q) ||
              (f.value ?? "").toLowerCase().includes(q) ||
              (f.triedNote ?? "").toLowerCase().includes(q),
          )
          .slice(0, limit ?? 10);
        return { count: matches.length, findings: matches };
      },
    }),
    getReviewProgress: tool({
      description:
        "Get a team's review progress — how many findings are PENDING vs ACCEPTED vs CORRECTED vs OVERRIDDEN, broken down by category (Code & repos, Pipelines, Organization, etc). Use this for 'what's left to review?', 'how far along are we?', 'which sections are done?'.",
      inputSchema: z.object({ slug: z.string() }),
      execute: async ({ slug }) => {
        const team = await prisma.team.findUnique({
          where: { slug },
          select: { latestFindingsId: true },
        });
        if (!team?.latestFindingsId)
          return { error: `No agent run for team '${slug}'.` };
        const findings = await prisma.finding.findMany({
          where: { agentRunId: team.latestFindingsId },
          select: { category: true, status: true },
        });
        const total = findings.length;
        const byStatus: Record<string, number> = {};
        const byCategory: Record<
          string,
          { total: number; reviewed: number; pending: number }
        > = {};
        for (const f of findings) {
          byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
          const c = (byCategory[f.category] ??= {
            total: 0,
            reviewed: 0,
            pending: 0,
          });
          c.total++;
          if (f.status === "PENDING") c.pending++;
          else c.reviewed++;
        }
        const reviewed = (byStatus.ACCEPTED ?? 0) + (byStatus.CORRECTED ?? 0);
        return {
          total,
          reviewed,
          pending: byStatus.PENDING ?? 0,
          completionPct: total > 0 ? Math.round((reviewed / total) * 100) : 0,
          byStatus,
          byCategory,
        };
      },
    }),
    getCohortBreakdown: tool({
      description:
        "Aggregate friction metrics across teams grouped by cohort (Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, Unassigned). Use this when the user asks about cohort-level patterns, e.g. 'which cohort has the most friction?', 'are mobile-heavy teams (Echo) different from data teams (Delta)?'.",
      inputSchema: z.object({}),
      execute: async () => {
        const all = await computeTeamFriction();
        const byCohort = new Map<
          string,
          {
            cohort: string;
            teamCount: number;
            avgFrictionScore: number;
            totalCustomizations: number;
            totalGapCustomizations: number;
            totalIntegrations: number;
            highestFrictionTeam: string;
            highestFrictionScore: number;
          }
        >();
        for (const t of all) {
          let entry = byCohort.get(t.cohort);
          if (!entry) {
            entry = {
              cohort: t.cohort,
              teamCount: 0,
              avgFrictionScore: 0,
              totalCustomizations: 0,
              totalGapCustomizations: 0,
              totalIntegrations: 0,
              highestFrictionTeam: t.name,
              highestFrictionScore: t.frictionScore,
            };
            byCohort.set(t.cohort, entry);
          }
          entry.teamCount++;
          entry.avgFrictionScore += t.frictionScore;
          entry.totalCustomizations += t.customizationsTotal;
          entry.totalGapCustomizations += t.customizationsGap;
          entry.totalIntegrations += t.integrations;
          if (t.frictionScore > entry.highestFrictionScore) {
            entry.highestFrictionScore = t.frictionScore;
            entry.highestFrictionTeam = t.name;
          }
        }
        const result = [...byCohort.values()]
          .map((c) => ({
            ...c,
            avgFrictionScore: Math.round(c.avgFrictionScore / c.teamCount),
          }))
          .sort((a, b) => b.avgFrictionScore - a.avgFrictionScore);
        return { count: result.length, cohorts: result };
      },
    }),
    listTeamsByFriction: tool({
      description:
        "Get every team ranked by migration friction (composite score: gap-parity customizations weighted 5x, customizations needing decisions 3x, plus high-risk entities, ADO-staying features, integrations, total customizations). Use this for ANY question that compares teams ('which team has the most friction?', 'which teams have the most gap customizations?', 'rank teams by complexity'). Returns the full sorted list — you can pick the top N from the result.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .positive()
          .max(50)
          .optional()
          .describe("Optional cap on how many top teams to return."),
      }),
      execute: async ({ limit }) => {
        const all = await computeTeamFriction();
        return { count: all.length, teams: limit ? all.slice(0, limit) : all };
      },
    }),
    getProgramOverview: tool({
      description:
        "Get program-wide rollup numbers across ALL teams scanned (not scoped to a single team). Use this when the user asks about the program/portfolio overview, totals across teams, hybrid split, parity breakdown, migration approach distribution, vendors, or customization decision counts. This is the source of truth for the /inventory/program-overview page.",
      inputSchema: z.object({}),
      execute: async () => computeProgramOverview(),
    }),
    proposeAnswer: tool({
      description:
        "Propose a final answer for the field the champion is currently reviewing. Only call this when you have a specific, defensible value for that field. The UI will render Accept / Tell me more / Still not sure buttons; the champion clicks Accept to fill the field.",
      inputSchema: z.object({
        value: z
          .string()
          .describe(
            "The proposed value to fill into the field. Concise, no markdown.",
          ),
        confidence: z
          .enum(["high", "medium", "low"])
          .describe("Your confidence in this answer."),
        reasoning: z
          .string()
          .describe(
            "One short sentence on why this answer is right (cited evidence, framework rule, etc).",
          ),
      }),
      execute: async (args) => args,
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
