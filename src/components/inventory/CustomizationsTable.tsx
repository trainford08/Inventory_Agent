"use client";

import type { CustomizationsBlock, CustomizationRow } from "@/server/inventory";

const CATEGORY_LABELS: Record<string, string> = {
  BOARDS: "Boards & Work Tracking",
  PIPELINES: "Pipelines & CI/CD",
  REPOS: "Repos & Branch Policy",
  DASHBOARDS: "Dashboards & Reporting",
  EXTENSIONS: "Extensions & Integrations",
  PROCESS: "Process & Workflow",
  SECURITY: "Security & Access",
};

const COMMONALITY_LABEL: Record<string, string> = {
  MOST: "Most teams",
  SOME: "Some teams",
  RARE: "Rare teams",
};

// Mirrors the framework HTML's commonality-chip palette:
// "very" (>50%) = orange, "common" (20–50%) = amber, "niche" (<20%) = neutral.
const COMMONALITY_TONE: Record<string, string> = {
  MOST: "border-orange-500/40 bg-orange-500/10 text-orange-700",
  SOME: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  RARE: "border-border bg-bg-muted text-ink-muted",
};

const PARITY_LABEL: Record<string, string> = {
  MATCH: "Match",
  PARTIAL: "Partial",
  GAP: "Gap",
  BETTER: "Better",
};

const PARITY_TONE: Record<string, string> = {
  MATCH: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  PARTIAL: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  GAP: "border-rose-500/40 bg-rose-500/10 text-rose-700",
  BETTER: "border-violet-500/40 bg-violet-500/10 text-violet-700",
};

const STRATEGY_LABEL: Record<string, string> = {
  S01_PROTECT_IN_PLACE: "S01",
  S02_TRANSLATE_TO_GITHUB: "S02",
  S03_RETIRE: "S03",
  S04_REBUILD_WITH_LOSS: "S04",
  S05_BUILD_GLUE: "S05",
  S06_UPSTREAM: "S06",
  S07_CONSOLIDATE_THIRD_PARTY: "S07",
};

const STRATEGY_TITLE: Record<string, string> = {
  S01_PROTECT_IN_PLACE: "Protect in Place (hybrid)",
  S02_TRANSLATE_TO_GITHUB: "Translate to GitHub",
  S03_RETIRE: "Retire During Discovery",
  S04_REBUILD_WITH_LOSS: "Rebuild with Accepted Loss",
  S05_BUILD_GLUE: "Build Glue",
  S06_UPSTREAM: "Upstream",
  S07_CONSOLIDATE_THIRD_PARTY: "Consolidate to Third-Party",
};

const STRATEGY_DESCRIPTION: Record<string, string> = {
  S01_PROTECT_IN_PLACE:
    "Too expensive or risky to migrate. Hybrid keeps it on ADO; zero migration engineering.",
  S02_TRANSLATE_TO_GITHUB:
    "Clean GitHub equivalent. Mechanical rebuild once per org, then forget.",
  S03_RETIRE:
    "Fossil — exists because it used to be needed. Migration is permission to delete.",
  S04_REBUILD_WITH_LOSS:
    "GitHub equivalent is thinner. Rebuild and accept the simplification.",
  S05_BUILD_GLUE:
    "No GitHub equivalent. Custom code (composite action, app, script) required.",
  S06_UPSTREAM:
    "Meta-strategy: build once centrally, reuse across teams instead of N rebuilds.",
  S07_CONSOLIDATE_THIRD_PARTY:
    "Meta-strategy: drop the sync and adopt a third-party tool already in the estate.",
};

const CATALOG_NOTES: Record<string, string> = {
  C01: "Process template is why Boards stays in the hybrid — not because GitHub has nothing, but because what it has doesn't compose.",
  C02: "Custom types now map cleanly; state transitions per type remain a gap.",
  C03: "Less fragmented than it was; reporting that depends on fields mostly portable.",
  C04: "Compliance-driven workflows need enforced states.",
  C05: "Rules owners often aren't developers.",
  C06: "Iteration work translates; area-path rollup reporting doesn't.",
  C07: "Boards stays — queries stay. If migrated, most translate.",
  C08: "Preserved by keeping Boards; if migrated, needs rework but not impossible.",
  C09: "Hybrid model protects this investment.",
  C10: "Conversion effort exists whether you migrate or modernize within ADO.",
  C11: "Pipelines staying preserves this.",
  C12: "Hybrid model preserves existing infra.",
  C13: "Pipeline source wiring does change (ADO Repos → GitHub).",
  C14: "Upgrade, but requires mapping work.",
  C15: "Not a platform concern.",
  C16: "Migration tooling can generate CODEOWNERS from ADO config.",
  C17: "Dashboards in ADO pull from Boards data — preserved by keeping Boards.",
  C18: "Retaining Boards preserves much of this; code-side reports need rebuild.",
  C19: "Niche but high emotional investment where present.",
  C20: "Audit required to identify replacements.",
  C21: "Niche but politically loaded — someone built these.",
  C22: "Tedious but straightforward for anything touching repos/PRs.",
  C23: "Need to re-point URLs and update event schemas.",
  C24: "Users typically set personal preferences — relatively quick to reconfigure.",
  C25: "Pattern conventions are code-level, not platform-level.",
  C26: "Often surfaces during migration, not before it.",
  C27: "Mapping is conceptual work, not capability work.",
  C28: "Teams who depend on this may split repos or stay on ADO.",
  C29: "Hybrid protects release gating.",
  C30: "Per-pipeline rewrites; classic-only tasks still need conversion if Pipelines ever moves.",
  C31: "Hybrid keeps these in Pipelines; rebuilds require deep ITSM API knowledge.",
  C32: "Translation is mechanical but pervasive; downstream consumers may rely on the format.",
  C33: "If Pipelines moves, redesign is significant — OIDC vs PAT decisions matter.",
  C34: "Concept maps cleanly; cross-pipeline artifact passing differs in syntax.",
  C35: "GEI handles LFS pointers but not all object storage; verify per repo. Submodule URL rewrites are mechanical.",
};

type MetaCandidate = {
  code: "S06" | "S07";
  trigger: string;
};

const META_CANDIDATES: Record<string, MetaCandidate[]> = {
  C01: [
    {
      code: "S07",
      trigger:
        "team is already syncing Boards to Jira, commit to Jira as source of truth.",
    },
  ],
  C02: [
    {
      code: "S07",
      trigger:
        "team is already managing work item types in Jira, commit to Jira types as source of truth.",
    },
    {
      code: "S06",
      trigger:
        "gaps in GitHub Issue Types affect many teams, escalate to GitHub product roadmap (Tier A).",
    },
  ],
  C03: [
    {
      code: "S07",
      trigger: "team is already using Jira custom fields, consolidate on Jira.",
    },
    {
      code: "S06",
      trigger:
        "many teams need the same fields (cost center, compliance tag), build an MS-shared Issue Field set (Tier B).",
    },
  ],
  C04: [
    {
      code: "S07",
      trigger:
        "workflow engine is the central pain, Jira's state machines are stronger than either platform's.",
    },
  ],
  C05: [
    {
      code: "S07",
      trigger:
        "team is already using Jira Automation, keep the rules where they live.",
    },
  ],
  C07: [
    {
      code: "S07",
      trigger:
        "team depends on complex JQL-style queries, Jira outclasses both ADO WIQL and GitHub search.",
    },
  ],
  C08: [
    {
      code: "S07",
      trigger:
        "team is Scrum/Kanban-heavy with Jira-style backlog planning, commit to Jira.",
    },
  ],
  C09: [
    {
      code: "S06",
      trigger:
        "the same steps (security scan, MS artefact publish) appear across 10+ teams, upstream to shared Actions (Tier B).",
    },
  ],
  C11: [
    {
      code: "S06",
      trigger:
        "internal pipeline tasks (auth, signing, compliance) are duplicated across teams, package as composite actions (Tier B).",
    },
  ],
  C14: [
    {
      code: "S06",
      trigger:
        "every team configures the same main-branch rules, ship template rulesets (Tier B).",
    },
  ],
  C16: [
    {
      code: "S06",
      trigger:
        "review-routing patterns repeat (security paths, compliance paths), publish a template CODEOWNERS repo (Tier B).",
    },
  ],
  C17: [
    {
      code: "S07",
      trigger:
        "dashboards are where the team lives, Jira dashboards beat both ADO and GitHub surfaces.",
    },
  ],
  C23: [
    {
      code: "S06",
      trigger:
        "many teams forward events to the same internal systems (Splunk, audit, dashboards), build a central webhook bridge (Tier B).",
    },
  ],
};

const PLACEMENT_LABEL: Record<string, string> = {
  STAYS: "Stays in ADO",
  MOVES: "Moves to GitHub",
  BOTH: "Both",
  MIXED: "N/A",
};

export function CustomizationsTable({ block }: { block: CustomizationsBlock }) {
  if (block.total === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center text-[13px] text-ink-muted">
        No customizations recorded for this team.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
        {block.total} customizations
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <Th className="w-[60px]">ID</Th>
              <Th className="w-[15%]">Customization</Th>
              <Th className="w-[22%]">Jobs to be done</Th>
              <Th>GitHub equivalent</Th>
              <Th className="w-[7%]">GitHub parity</Th>
              <Th className="w-[7%]">Migration strategy</Th>
              <Th className="w-[7%]">Hybrid approach</Th>
              <Th className="w-[14%]">Meta-strategy candidates</Th>
              <Th className="w-[14%]">Notes</Th>
            </tr>
          </thead>
          <tbody>
            {block.byCategory.map((group) => (
              <CategoryBlock
                key={group.category}
                category={group.category}
                rows={group.rows}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Legend />
    </div>
  );
}

function CategoryBlock({
  category,
  rows,
}: {
  category: string;
  rows: CustomizationRow[];
}) {
  return (
    <>
      <tr className="bg-bg-muted">
        <td
          colSpan={9}
          className="border-y border-border px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink"
        >
          {CATEGORY_LABELS[category] ?? category}
          <span className="ml-2 text-ink-muted">· {rows.length}</span>
        </td>
      </tr>
      {rows.map((row) => (
        <Row key={row.id} row={row} />
      ))}
    </>
  );
}

function Row({ row }: { row: CustomizationRow }) {
  return (
    <tr className="border-b border-border/60 hover:bg-bg-hover">
      <Td className="font-mono text-[11px] text-ink-muted">
        {row.catalogCode ?? "—"}
      </Td>
      <Td>
        <div className="font-medium text-ink">{row.name}</div>
      </Td>
      <Td>
        <div className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-violet-700">
          {row.jtbdPerformer}
        </div>
        <div className="text-[12.5px] italic leading-snug text-ink-soft">
          {row.jobsToBeDone}
        </div>
      </Td>
      <Td className="text-[12.5px] leading-snug text-ink-soft">
        {row.githubEquivalent ?? <span className="text-ink-faint">—</span>}
      </Td>
      <Td>
        {row.parity ? (
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] ${
              PARITY_TONE[row.parity] ??
              "border-border bg-bg-muted text-ink-muted"
            }`}
          >
            {PARITY_LABEL[row.parity] ?? row.parity}
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </Td>
      <Td>
        {row.strategy ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="inline-flex items-center rounded border border-border bg-bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] text-ink">
                {STRATEGY_LABEL[row.strategy] ?? row.strategy}
              </span>
              <span className="text-[11.5px] font-medium text-ink">
                {STRATEGY_TITLE[row.strategy] ?? row.strategy}
              </span>
            </div>
            <span className="text-[11px] leading-[1.45] text-ink-muted">
              {STRATEGY_DESCRIPTION[row.strategy]}
            </span>
          </div>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </Td>
      <Td>
        <PlacementChip placement={row.hybridPlacement} />
      </Td>
      <Td>
        {row.catalogCode && META_CANDIDATES[row.catalogCode] ? (
          <div className="flex flex-col gap-2">
            {META_CANDIDATES[row.catalogCode].map((m, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span
                  className={`inline-flex w-fit items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] ${
                    m.code === "S06"
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-700"
                      : "border-teal-500/40 bg-teal-500/10 text-teal-700"
                  }`}
                >
                  {m.code} · {m.code === "S06" ? "Upstream" : "Third-party"}
                </span>
                <span className="text-[11px] italic leading-[1.45] text-ink-muted">
                  If {m.trigger}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </Td>
      <Td className="text-[11.5px] italic leading-[1.45] text-ink-soft">
        {row.catalogCode && CATALOG_NOTES[row.catalogCode] ? (
          CATALOG_NOTES[row.catalogCode]
        ) : (
          <span className="not-italic text-ink-faint">—</span>
        )}
      </Td>
    </tr>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-border bg-bg-muted px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function PlacementChip({ placement }: { placement: string | null }) {
  if (!placement) return <span className="text-ink-faint">—</span>;
  const tone: Record<string, string> = {
    STAYS: "border-orange-500/40 bg-orange-500/10 text-orange-700",
    MOVES: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
    BOTH: "border-primary/40 bg-primary/10 text-primary",
    MIXED: "border-border bg-bg-muted text-ink-muted",
  };
  const cls = tone[placement] ?? "border-border bg-bg-muted text-ink-muted";
  return (
    <span
      className={`inline-block rounded border px-2 py-[2px] text-[11px] font-semibold ${cls}`}
    >
      {PLACEMENT_LABEL[placement] ?? placement}
    </span>
  );
}

function Legend() {
  const parityItems: Array<{ value: keyof typeof PARITY_TONE; def: string }> = [
    { value: "MATCH", def: "Clean 1:1 equivalent" },
    { value: "PARTIAL", def: "Equivalent exists, gaps remain" },
    { value: "GAP", def: "No GitHub equivalent today" },
    { value: "BETTER", def: "GitHub native is stronger" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-[11.5px] text-ink-muted">
      <span className="inline-flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          Parity
        </span>
        {parityItems.map((p) => (
          <span key={p.value} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block rounded-[3px] border px-[5px] py-[1px] font-mono text-[10px] font-semibold ${PARITY_TONE[p.value]}`}
            >
              {PARITY_LABEL[p.value]}
            </span>
            <span>{p.def}</span>
          </span>
        ))}
      </span>
      <span className="h-[18px] w-px bg-border" aria-hidden />
      <span className="inline-flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          Meta
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded-[3px] border border-dashed border-ink-muted/50 px-[5px] py-[1px] font-mono text-[10px] font-semibold text-ink-soft">
            S07 Third-Party
          </span>
          <span>Consolidate to a tool already in the estate</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded-[3px] border border-dashed border-ink-muted/50 px-[5px] py-[1px] font-mono text-[10px] font-semibold text-ink-soft">
            S06 Upstream
          </span>
          <span>Build once centrally, reuse across teams</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-ink-faint">—</span>
          <span>No meta-strategy applies</span>
        </span>
      </span>
    </div>
  );
}
