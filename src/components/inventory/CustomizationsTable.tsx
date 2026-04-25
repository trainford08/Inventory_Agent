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

const PLACEMENT_LABEL: Record<string, string> = {
  STAYS: "ADO",
  MOVES: "GH",
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
        {block.total} customizations · {block.cataloged} cataloged ·{" "}
        {block.teamSpecific} team-specific
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <Th className="w-[60px]">ID</Th>
              <Th className="w-[15%]">Customization</Th>
              <Th className="w-[22%]">Jobs to be done</Th>
              <Th>GitHub equivalent</Th>
              <Th className="w-[10%]">Teams impacted</Th>
              <Th className="w-[7%]">Parity</Th>
              <Th className="w-[7%]">Strategy</Th>
              <Th className="w-[6%]">Hybrid</Th>
              <Th className="w-[9%]">Status</Th>
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
        {!row.catalogCode ? (
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">
            team-specific
          </div>
        ) : null}
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
        {row.commonality ? (
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] ${
              COMMONALITY_TONE[row.commonality] ??
              "border-border bg-bg-muted text-ink-muted"
            }`}
          >
            {COMMONALITY_LABEL[row.commonality] ?? row.commonality}
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
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
          <span
            title={STRATEGY_TITLE[row.strategy] ?? row.strategy}
            className="inline-flex items-center rounded border border-border bg-bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] text-ink"
          >
            {STRATEGY_LABEL[row.strategy] ?? row.strategy}
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </Td>
      <Td className="font-mono text-[11px] text-ink-soft">
        {row.hybridPlacement
          ? (PLACEMENT_LABEL[row.hybridPlacement] ?? row.hybridPlacement)
          : "—"}
      </Td>
      <Td className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted">
        {row.status.replace(/_/g, " ").toLowerCase()}
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
