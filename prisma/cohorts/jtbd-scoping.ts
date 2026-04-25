/**
 * Per-cohort JTBD scoping. Each team has a different subset of the 118
 * canonical JTBDs based on its seeded traits (size, codebase, regulated
 * status, mobile, customization depth). Exclusions are coded explicitly
 * and grounded in the cohort profile so we can pressure-test the
 * inventory model with realistic per-team variation.
 *
 * Pass the result of `excludedJtbds(cohort)` into `allJtbds(overrides)`.
 */

import type { Prisma } from "@/generated/prisma/client";

type Override = Partial<Prisma.JtbdEntryCreateWithoutTeamInput>;

function out(codes: string[]): Record<string, Override> {
  const map: Record<string, Override> = {};
  for (const c of codes) map[c] = { performed: false };
  return map;
}

/**
 * ALPHA — 3 engineers, TypeScript monorepo, no LFS, no customizations,
 * no open risks, "the easy yes." Lean team that ships continuously,
 * doesn't run a manual QA process, hasn't adopted Codespaces/Copilot at
 * the team level, and isn't subject to formal compliance audits.
 */
const ALPHA_EXCLUSIONS = [
  "J09", // LFS — codebase has usesLfs=false
  "J10", // Submodules — single monorepo
  "J42", // Custom pipeline tasks — no customizations
  "J50", // Schedule release window — continuous deploy, no formal windows
  "J53",
  "J54",
  "J55",
  "J56",
  "J57",
  "J58", // Test Plans — no manual QA process
  "J62", // Security advisory — never raised one
  "J65",
  "J66", // Compliance reports/audits — not regulated
  "J67", // SBOM — not required
  "J74", // Cross-org permission audit — single org
  "J78", // API automation — no internal tools
  "J84", // Portfolio rollup — too small to need exec rollups
  "J91", // Copilot Chat — not yet adopted
  "J94", // Codespaces — not yet adopted
  "J104",
  "J105",
  "J106", // Admin: invite, transfer, archive — rare for 3-person team
  "J108", // Orphan resource transfer — never happened
  "J109",
  "J110",
  "J111", // Policy rollout — single repo, no policies to roll
  "J112",
  "J113",
  "J114",
  "J115", // Incident response — small team, no on-call
  "J116",
  "J117",
  "J118", // Formal releases — continuous deploy, tags only
];

/**
 * BRAVO — 6 engineers, "typical healthy team." Standard small product
 * team. Has a basic QA pass but not Test Plans-level rigor. Some
 * admin/policy work but nothing exotic.
 */
const BRAVO_EXCLUSIONS = [
  "J10", // No submodules
  "J42", // No custom pipeline tasks
  "J55", // No exploratory test sessions
  "J57",
  "J58", // No formal regression process
  "J62", // No security advisories raised
  "J66", // No regulatory audits
  "J67", // No SBOM requirement
  "J74", // No cross-org audits
  "J91", // Copilot Chat not adopted
  "J94", // Codespaces not adopted
  "J108", // No orphan transfers
  "J111", // No policy exceptions granted
  "J114", // No history-purge incidents
  "J117", // Auto-generated release notes not adopted
];

/**
 * CHARLIE — 11 engineers, "the interesting one." Heavy customizations,
 * mature team. Does almost everything; only excludes a few cutting-edge
 * GitHub-native capabilities they haven't piloted yet.
 */
const CHARLIE_EXCLUSIONS = [
  "J94", // Codespaces — not piloted; team uses local Docker containers
];

/**
 * DELTA — 14 engineers, "heavyweight." Regulated data platform. Does
 * literally every JTBD: SDL gates, regulatory audits, manual test
 * plans, the lot. No exclusions.
 */
const DELTA_EXCLUSIONS: string[] = [];

/**
 * ECHO — 4 engineers, mobile team, "champion still has work."
 * Heavy LFS use (binary assets, certificates). Mobile-specific build
 * matrix. Doesn't do compliance reporting, has no Test Plans process
 * (mobile manual testing happens in App Center / TestFlight).
 */
const ECHO_EXCLUSIONS = [
  "J42", // No custom pipeline tasks
  "J53",
  "J54",
  "J55",
  "J56",
  "J57",
  "J58", // Mobile manual testing in App Center, not Test Plans
  "J62", // No security advisories raised
  "J64",
  "J65",
  "J66",
  "J67", // Not in compliance scope
  "J74", // Single-org
  "J78", // No internal API tools
  "J84", // Mobile rollup goes through different system
  "J91", // Copilot Chat not adopted
  "J94", // Codespaces not adopted
  "J102",
  "J104",
  "J105",
  "J106", // Stable repo set, rare admin
  "J108", // No orphan transfers
  "J109",
  "J110",
  "J111", // No policy program
  "J112",
  "J113",
  "J114",
  "J115", // No on-call (mobile crashes go through different chain)
  "J117", // No auto-generated release notes
];

/**
 * FOXTROT — 2 engineers, "the edge case." Archive team, migration
 * rolled back. Does very little day-to-day; the team is essentially in
 * maintenance mode. Most jobs are not performed at all.
 */
const FOXTROT_EXCLUSIONS = [
  "J04", // Cherry-pick — frozen codebase, no active branching
  "J05", // Revert — same
  "J06", // Merge conflict resolution — same
  "J09", // No LFS
  "J10", // No submodules
  "J16", // No active work-item linking
  "J18", // No new reviewers being assigned
  "J19", // No draft PRs
  "J21", // No closing without merge — repo frozen
  "J25",
  "J26",
  "J29",
  "J31",
  "J33", // No active sprint planning, retros, velocity
  "J34",
  "J35",
  "J36",
  "J37",
  "J38",
  "J39",
  "J40",
  "J41",
  "J42",
  "J43", // Pipelines disabled
  "J44",
  "J45",
  "J46",
  "J47",
  "J48",
  "J49",
  "J50", // No active deploys
  "J51",
  "J52",
  "J53",
  "J54",
  "J55",
  "J56",
  "J57",
  "J58", // No active testing
  "J59",
  "J60",
  "J61",
  "J62",
  "J63",
  "J65",
  "J66",
  "J67",
  "J68", // Minimal security activity
  "J70",
  "J71",
  "J72",
  "J73",
  "J74",
  "J75", // Frozen access patterns
  "J76",
  "J77",
  "J78",
  "J79",
  "J80", // No active integrations
  "J82",
  "J83",
  "J84",
  "J85", // No active reporting
  "J91",
  "J94", // No Copilot/Codespaces
  "J95",
  "J96",
  "J97", // No active onboarding
  "J100",
  "J101", // No active build debugging
  "J102",
  "J103",
  "J104",
  "J105", // No new repos/policies
  "J109",
  "J110",
  "J111", // No policy program
  "J112",
  "J113",
  "J114",
  "J115", // No incidents (no traffic)
  "J116",
  "J117",
  "J118", // No releases
];

const EXCLUSIONS_BY_COHORT: Record<string, string[]> = {
  ALPHA: ALPHA_EXCLUSIONS,
  BRAVO: BRAVO_EXCLUSIONS,
  CHARLIE: CHARLIE_EXCLUSIONS,
  DELTA: DELTA_EXCLUSIONS,
  ECHO: ECHO_EXCLUSIONS,
  FOXTROT: FOXTROT_EXCLUSIONS,
};

export function jtbdOverridesFor(cohort: string): Record<string, Override> {
  return out(EXCLUSIONS_BY_COHORT[cohort] ?? []);
}
