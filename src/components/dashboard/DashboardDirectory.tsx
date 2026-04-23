"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HealthStatus, MigrationState } from "@/generated/prisma/enums";
import { PHASE_STEPS, phaseSnapshot } from "@/lib/phase";
import type { TeamListItem } from "@/server/teams";

type Filter = "all" | "BLOCKED" | "AT_RISK" | "ON_TRACK" | "NEXT_30";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All waves" },
  { value: "BLOCKED", label: "Blocked only" },
  { value: "AT_RISK", label: "At risk" },
  { value: "ON_TRACK", label: "On track" },
  { value: "NEXT_30", label: "Next 30 days" },
];

export function DashboardDirectory({
  teams,
  nowMs,
}: {
  teams: TeamListItem[];
  nowMs: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const thirtyDays = nowMs + 30 * 24 * 60 * 60 * 1000;
    return teams.filter((t) => {
      if (filter === "BLOCKED" && t.healthStatus !== "BLOCKED") return false;
      if (filter === "AT_RISK" && t.healthStatus !== "AT_RISK") return false;
      if (filter === "ON_TRACK" && t.healthStatus !== "ON_TRACK") return false;
      if (filter === "NEXT_30") {
        if (!t.targetCutoverAt) return false;
        if (new Date(t.targetCutoverAt).getTime() > thirtyDays) return false;
      }
      if (q === "") return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.tagline?.toLowerCase().includes(q) ?? false) ||
        t.cohort.toLowerCase().includes(q)
      );
    });
  }, [teams, filter, query, nowMs]);

  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3 border-b border-border pb-[10px]">
        <h2 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          All teams
        </h2>
        <span className="font-mono text-[11px] font-medium text-ink-muted">
          {teams.length} {teams.length === 1 ? "team" : "teams"}
        </span>
        <span className="ml-auto inline-flex cursor-default items-center gap-1 text-[12.5px] font-semibold text-ink-faint">
          View full directory
          <ChevronRight />
        </span>
      </div>

      {/* Filter chips + search */}
      <div className="mb-[14px] flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-[5px] text-[12px] font-medium transition-colors ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-bg-elevated text-ink-soft hover:border-border-strong hover:bg-bg-subtle"
              }`}
            >
              {f.label}
            </button>
          );
        })}
        <div className="ml-auto flex min-w-[220px] items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-[5px]">
          <svg
            className="h-[13px] w-[13px] text-ink-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams..."
            className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border bg-bg-elevated">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-border bg-bg-subtle px-5 py-[10px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          <span>Team</span>
          <span>Wave</span>
          <span>Phase</span>
          <span>Health</span>
          <span>Blockers</span>
          <span>Cutover</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-6 text-center text-[13px] text-ink-muted">
            No teams match these filters.
          </div>
        ) : (
          filtered.map((t) => (
            <DirectoryRow key={t.id} team={t} nowMs={nowMs} />
          ))
        )}
      </div>
    </section>
  );
}

function DirectoryRow({ team, nowMs }: { team: TeamListItem; nowMs: number }) {
  const phase = phaseSnapshot(team.migrationState);
  const isDone =
    team.migrationState === "COMPLETED" || team.healthStatus === "DONE";
  const cutover = team.targetCutoverAt ? new Date(team.targetCutoverAt) : null;
  const isNear =
    cutover !== null &&
    cutover.getTime() - nowMs < 30 * 24 * 60 * 60 * 1000 &&
    !isDone;

  return (
    <Link
      href={`/teams/${team.slug}`}
      className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] items-center gap-3 border-b border-border-subtle px-5 py-3 text-[13px] last:border-b-0 hover:bg-bg-subtle"
    >
      <div className="flex items-center gap-[10px]">
        <span
          className="h-6 w-6 flex-shrink-0 rounded-md"
          style={{ background: teamGradient(team.slug) }}
        />
        <div className="min-w-0">
          <div className="truncate font-semibold tracking-[-0.005em] text-ink">
            {team.name}
          </div>
          <div className="truncate text-[11.5px] text-ink-muted">
            {team.tagline ?? team.cohort}
          </div>
        </div>
      </div>
      <span className="font-mono text-[11px] text-ink-muted">
        {team.wave !== null ? `W${String(team.wave).padStart(2, "0")}` : "—"}
      </span>
      <div className="flex flex-col gap-1">
        <div className="h-[3px] overflow-hidden rounded bg-bg-muted">
          <div
            className={`h-full rounded ${isDone ? "bg-ink-faint" : "bg-primary"}`}
            style={{ width: `${phase.overallPercent}%` }}
          />
        </div>
        <span className="text-[11.5px] text-ink-soft">
          {labelForState(team.migrationState)}
        </span>
      </div>
      <HealthPill status={team.healthStatus} />
      <span
        className={`font-mono text-[12px] font-semibold ${
          team.openBlockerCount > 0 ? "text-danger-ink" : "text-ink-faint"
        }`}
      >
        {isDone && team.openBlockerCount === 0 ? "—" : team.openBlockerCount}
      </span>
      <span
        className={`font-mono text-[11.5px] ${isNear ? "font-semibold text-warn-ink" : "text-ink-soft"}`}
      >
        {cutover
          ? cutover.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—"}
      </span>
    </Link>
  );
}

function HealthPill({ status }: { status: HealthStatus | null }) {
  const style = HEALTH_STYLE[status ?? "UNKNOWN"];
  return (
    <span
      className={`inline-flex w-fit items-center gap-[5px] rounded-full px-[9px] py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${style.chip}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {style.label}
    </span>
  );
}

const HEALTH_STYLE: Record<string, { chip: string; label: string }> = {
  ON_TRACK: { chip: "bg-success-soft text-success-ink", label: "On track" },
  AT_RISK: { chip: "bg-warn-soft text-warn-ink", label: "At risk" },
  BLOCKED: { chip: "bg-danger-soft text-danger-ink", label: "Blocked" },
  DONE: { chip: "bg-bg-muted text-ink-muted", label: "Done" },
  UNKNOWN: { chip: "bg-bg-muted text-ink-muted", label: "—" },
};

function labelForState(state: MigrationState): string {
  switch (state) {
    case "NOT_STARTED":
    case "DISCOVERING":
      return "Discovery";
    case "REVIEWING":
      return "Verification";
    case "READY":
      return "Planning";
    case "IN_PROGRESS":
      return "Execution";
    case "COMPLETED":
      return "Done";
    case "ROLLED_BACK":
      return "Rolled back";
    default:
      return PHASE_STEPS[0];
  }
}

const GRADIENTS = [
  "linear-gradient(135deg, #5b5fcf, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #0ea5e9)",
  "linear-gradient(135deg, #10b981, #22c55e)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #dc2626, #ef4444)",
];

function teamGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

function ChevronRight() {
  return (
    <svg
      className="h-[11px] w-[11px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
