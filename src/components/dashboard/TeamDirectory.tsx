"use client";

import { useMemo, useState } from "react";
import { TeamsTable } from "@/components/TeamsTable";
import type { TeamListItem } from "@/server/teams";

type HealthFilter = "all" | "ON_TRACK" | "AT_RISK" | "BLOCKED" | "DONE";

const FILTERS: Array<{ value: HealthFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "AT_RISK", label: "At risk" },
  { value: "ON_TRACK", label: "On track" },
  { value: "DONE", label: "Done" },
];

export function TeamDirectory({ teams }: { teams: TeamListItem[] }) {
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      if (healthFilter !== "all" && t.healthStatus !== healthFilter) {
        return false;
      }
      if (q === "") return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.tagline?.toLowerCase().includes(q) ?? false) ||
        t.cohort.toLowerCase().includes(q) ||
        (t.wave !== null && `w${String(t.wave).padStart(2, "0")}`.includes(q))
      );
    });
  }, [teams, query, healthFilter]);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
          Team directory
        </h2>
        <div className="font-mono text-[11px] text-ink-muted">
          {filtered.length} of {teams.length}{" "}
          {teams.length === 1 ? "team" : "teams"}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg
              width="13"
              height="13"
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
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, cohorts, waves"
            className="block w-full rounded-md border border-border bg-bg-subtle py-[7px] pl-[32px] pr-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-primary focus:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = healthFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setHealthFilter(f.value)}
                className={`rounded-md border px-[10px] py-[5px] text-[12px] font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-bg-elevated text-ink-soft hover:border-border-strong hover:bg-bg-subtle"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      {filtered.length > 0 ? (
        <TeamsTable teams={filtered} />
      ) : (
        <div className="rounded-lg border border-border bg-bg-elevated p-[32px_28px] text-center">
          <div className="text-[13px] font-semibold text-ink">
            No teams match your filters
          </div>
          <p className="mt-1 text-[12px] text-ink-muted">
            Clear the search or pick a different health filter to see more.
          </p>
        </div>
      )}
    </section>
  );
}
