import type { Prisma } from "../../src/generated/prisma/client";
import type { SeedEvidence, SeedFinding } from "../findings-generator";
import { CANONICAL_JTBDS } from "./canonical-jtbds";
import { CATALOG_BY_CODE } from "./customization-catalog";

const CANONICAL_BY_CODE = new Map(CANONICAL_JTBDS.map((j) => [j.code, j]));

export type CohortShape = {
  orgId: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  cohort: "ALPHA" | "BRAVO" | "CHARLIE" | "DELTA" | "ECHO" | "FOXTROT";
  wave: number | null;
  migrationState:
    | "NOT_STARTED"
    | "DISCOVERING"
    | "REVIEWING"
    | "READY"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ROLLED_BACK";
  engineerCount: number | null;
  tier: "TIER_1" | "TIER_2" | "TIER_3" | null;
  securityClassification: string | null;
  healthStatus: "ON_TRACK" | "AT_RISK" | "BLOCKED" | "DONE" | null;
  effortEstimateLowWeeks: number | null;
  effortEstimateHighWeeks: number | null;
  effortConfidence: "LOW" | "MEDIUM" | "HIGH" | null;
  effortProgressWeeks: number | null;
  targetCutoverAt: Date | null;
  slackWeeks: number | null;
  workItemsActive: number | null;
  workItemsClosed90d: number | null;
  buildArtifactCount: number | null;
  wikiPageCount: number | null;
  championEmail: string;
  members: Prisma.TeamMemberCreateWithoutTeamInput[];
  codebase: Omit<Prisma.CodebaseCreateWithoutTeamInput, "repos">;
  repos: Prisma.RepoCreateWithoutCodebaseInput[];
  workflows: Prisma.WorkflowCreateWithoutTeamInput[];
  jtbds: Prisma.JtbdEntryCreateWithoutTeamInput[];
  customizations: Prisma.CustomizationCreateWithoutTeamInput[];
  risks: Prisma.RiskCreateWithoutTeamInput[];
  ownership: Prisma.OwnershipCreateWithoutTeamInput;
  adoProjects: Prisma.AdoProjectCreateWithoutTeamInput[];
  serviceConnections: Prisma.ServiceConnectionCreateWithoutTeamInput[];
  releaseDefinitions: Prisma.ReleaseDefinitionCreateWithoutTeamInput[];
  extensions: Prisma.ExtensionCreateWithoutTeamInput[];
  agentRun: {
    startedAt: Date;
    completedAt: Date;
    durationMs: number;
    triggeredBy?: string;
  };
  /** Persona-specific anomalies + needs-input findings added on top of generated background findings */
  curatedFindings: SeedFinding[];
};

// -----------------------------------------------------------------------
// Time helpers
// -----------------------------------------------------------------------

export const HOUR = 3600 * 1000;
export const DAY = 24 * HOUR;
export const NOW = Date.now();
export const hoursAgo = (h: number) => new Date(NOW - h * HOUR);
export const daysAgo = (d: number) => new Date(NOW - d * DAY);
export const daysFromNow = (d: number) => new Date(NOW + d * DAY);

// -----------------------------------------------------------------------
// Builders (keep team configs compact)
// -----------------------------------------------------------------------

export function repo(
  name: string,
  opts: Partial<Prisma.RepoCreateWithoutCodebaseInput> = {},
): Prisma.RepoCreateWithoutCodebaseInput {
  return {
    name,
    defaultBranch: "main",
    branchProtected: true,
    ...opts,
  };
}

export function workflow(
  name: string,
  type: "BUILD" | "RELEASE" | "TEST" | "DEPLOY" | "OTHER",
  opts: Partial<Prisma.WorkflowCreateWithoutTeamInput> = {},
): Prisma.WorkflowCreateWithoutTeamInput {
  return {
    name,
    type,
    runnerType: "MICROSOFT_HOSTED",
    stageCount: 1,
    ...opts,
  };
}

/**
 * Reference a canonical JTBD by code (e.g. "J01"). Title, category,
 * frequency, and default migration approach come from canonical-jtbds.ts.
 * Pass opts to override per-team (approach, performed, notes).
 */
export function jtbd(
  code: string,
  opts: Partial<Prisma.JtbdEntryCreateWithoutTeamInput> = {},
): Prisma.JtbdEntryCreateWithoutTeamInput {
  const canonical = CANONICAL_BY_CODE.get(code);
  if (!canonical) {
    throw new Error(
      `Unknown canonical JTBD code: ${code}. Valid codes: J01–J118.`,
    );
  }
  return {
    jtbdCode: canonical.code,
    title: canonical.title,
    category: canonical.category,
    frequency: canonical.frequency,
    migrationApproach: canonical.approach,
    performed: true,
    ...opts,
  };
}

/**
 * Emit all 118 canonical JTBDs for a team. Per-team overrides can be supplied
 * by code (e.g. { J01: { performed: false } } to exclude J01 for this team,
 * or { J53: { migrationApproach: "BOTH" } } to override the default).
 */
export function allJtbds(
  overrides: Record<
    string,
    Partial<Prisma.JtbdEntryCreateWithoutTeamInput>
  > = {},
): Prisma.JtbdEntryCreateWithoutTeamInput[] {
  return CANONICAL_JTBDS.map((c) => jtbd(c.code, overrides[c.code] ?? {}));
}

/**
 * Reference a catalog customization (C01–C29) for a team. The catalog supplies
 * name, category, parity, strategy, hybridPlacement; per-team overrides are
 * applied last.
 */
export function customization(
  catalogCode: string,
  opts: Partial<Prisma.CustomizationCreateWithoutTeamInput> = {},
): Prisma.CustomizationCreateWithoutTeamInput {
  const cat = CATALOG_BY_CODE.get(catalogCode);
  if (!cat) {
    throw new Error(
      `Unknown customization catalog code: ${catalogCode}. Valid codes: C01–C29.`,
    );
  }
  return {
    catalogEntry: { connect: { catalogCode } },
    name: cat.name,
    category: cat.category,
    description: cat.jobsToBeDone,
    parity: cat.parity,
    strategy: cat.strategy,
    hybridPlacement: cat.hybridPlacement,
    notes: cat.notes,
    status: "UNKNOWN",
    ...opts,
  };
}

/**
 * Build a team-specific (non-cataloged) customization. Use when a team has
 * a customization that doesn't match any of the 29 framework entries.
 */
export function teamCustomization(
  input: {
    name: string;
    category: Prisma.CustomizationCreateWithoutTeamInput["category"];
    description: string;
  } & Partial<Prisma.CustomizationCreateWithoutTeamInput>,
): Prisma.CustomizationCreateWithoutTeamInput {
  return {
    status: "UNKNOWN",
    ...input,
  };
}

export function member(
  name: string,
  email: string,
  role: string,
): Prisma.TeamMemberCreateWithoutTeamInput {
  return { name, email, role };
}

export function adoProject(
  name: string,
  opts: Partial<Prisma.AdoProjectCreateWithoutTeamInput> = {},
): Prisma.AdoProjectCreateWithoutTeamInput {
  return {
    name,
    visibility: "private",
    repoCount: 0,
    pipelineCount: 0,
    ...opts,
  };
}

export function serviceConnection(
  name: string,
  type: Prisma.ServiceConnectionCreateWithoutTeamInput["type"],
  opts: Partial<Prisma.ServiceConnectionCreateWithoutTeamInput> = {},
): Prisma.ServiceConnectionCreateWithoutTeamInput {
  return {
    name,
    type,
    targetService: "Azure",
    authMethod: "service-principal",
    hasStoredCredential: true,
    usedByCount: 1,
    ...opts,
  };
}

export function releaseDefinition(
  name: string,
  opts: Partial<Prisma.ReleaseDefinitionCreateWithoutTeamInput> = {},
): Prisma.ReleaseDefinitionCreateWithoutTeamInput {
  return {
    name,
    stages: 2,
    isClassic: true,
    hasManualGates: false,
    gateTypes: [],
    deployTargets: [],
    ...opts,
  };
}

export function extension(
  name: string,
  publisher: string,
  category: string,
  opts: Partial<Prisma.ExtensionCreateWithoutTeamInput> = {},
): Prisma.ExtensionCreateWithoutTeamInput {
  return {
    name,
    publisher,
    category,
    hasGitHubEquivalent: true,
    ...opts,
  };
}

// Curated finding helpers
export function needsInput(
  category: string,
  fieldPath: string,
  fieldLabel: string,
  triedNote: string,
  evidence?: SeedEvidence[],
): SeedFinding {
  return {
    category,
    fieldPath,
    fieldLabel,
    value: null,
    source: "NEEDS_INPUT",
    confidence: "MEDIUM",
    triedNote,
    evidence,
  };
}

export function anomaly(
  category: string,
  fieldPath: string,
  fieldLabel: string,
  value: string | null,
  triedNote: string,
  evidence?: SeedEvidence[],
): SeedFinding {
  return {
    category,
    fieldPath,
    fieldLabel,
    value,
    source: "INFERRED",
    confidence: "LOW",
    triedNote,
    evidence,
  };
}

// Evidence builders — typed shortcuts for common evidence shapes.
export const ev = {
  file: (
    path: string,
    snippet?: string,
    metadata?: string,
    sourceUrl?: string,
  ): SeedEvidence => ({
    kind: "FILE",
    path,
    snippet: snippet ?? null,
    metadata: metadata ?? null,
    sourceUrl: sourceUrl ?? null,
  }),
  api: (
    path: string,
    snippet: string,
    metadata?: string,
    sourceUrl?: string,
  ): SeedEvidence => ({
    kind: "API_RESPONSE",
    path,
    snippet,
    metadata: metadata ?? null,
    sourceUrl: sourceUrl ?? null,
  }),
  url: (path: string, snippet?: string, metadata?: string): SeedEvidence => ({
    kind: "URL",
    path,
    snippet: snippet ?? null,
    metadata: metadata ?? null,
    sourceUrl: path,
  }),
  config: (
    path: string,
    snippet: string,
    metadata?: string,
    sourceUrl?: string,
  ): SeedEvidence => ({
    kind: "CONFIG",
    path,
    snippet,
    metadata: metadata ?? null,
    sourceUrl: sourceUrl ?? null,
  }),
  log: (
    path: string,
    snippet: string,
    metadata?: string,
    sourceUrl?: string,
  ): SeedEvidence => ({
    kind: "LOG",
    path,
    snippet,
    metadata: metadata ?? null,
    sourceUrl: sourceUrl ?? null,
  }),
};
