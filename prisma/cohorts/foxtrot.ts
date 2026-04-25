import { jtbdOverridesFor } from "./jtbd-scoping";

import {
  adoProject,
  anomaly,
  daysAgo,
  extension,
  hoursAgo,
  allJtbds,
  member,
  needsInput,
  releaseDefinition,
  repo,
  serviceConnection,
  workflow,
  type CohortShape,
} from "./_helpers";

export function foxtrotConfig(orgId: string): CohortShape {
  return {
    orgId,
    name: "Foxtrot Archive",
    slug: "foxtrot",
    tagline: "The edge case",
    description:
      "Rolled back after a cut-over attempt last quarter. Legacy C++ build chain, deprecated PowerShell signing, archived repos still pinned to classic release definitions. Parked until the LFS tooling + signing path Delta unblocks becomes available.",
    cohort: "FOXTROT",
    wave: null,
    migrationState: "ROLLED_BACK",
    engineerCount: 2,
    tier: "TIER_3",
    securityClassification: null,
    healthStatus: "DONE",
    effortEstimateLowWeeks: null,
    effortEstimateHighWeeks: null,
    effortConfidence: null,
    effortProgressWeeks: null,
    targetCutoverAt: null,
    slackWeeks: null,
    workItemsActive: 4,
    workItemsClosed90d: 8,
    buildArtifactCount: 24,
    wikiPageCount: 6,
    championEmail: "miranda.flint@contoso.com",
    members: [
      member(
        "Miranda Flint",
        "miranda.flint@contoso.com",
        "Engineering Manager",
      ),
      member("Owen Campbell", "owen.campbell@contoso.com", "Staff Engineer"),
    ],
    codebase: {
      primaryLang: "C++",
      usesLfs: false,
      totalSizeGb: 22.1,
    },
    repos: [
      repo("foxtrot-legacy", {
        sizeGb: 18.2,
        loc: 412000,
        languageBreakdown: { "C++": 78, Makefile: 12, Shell: 6, Markdown: 4 },
        contributorCount: 2,
        hasWiki: true,
        wikiPageCount: 6,
        commits90d: 12,
        defaultBranch: "master",
        isArchived: true,
        primaryOwner: "miranda.flint@contoso.com",
        lastCommitAt: daysAgo(94),
        branchProtected: false,
      }),
      repo("foxtrot-tools", {
        sizeGb: 3.9,
        loc: 48000,
        languageBreakdown: { PowerShell: 72, Batch: 18, Markdown: 10 },
        contributorCount: 1,
        hasWiki: false,
        commits90d: 0,
        defaultBranch: "master",
        isArchived: true,
        primaryOwner: "miranda.flint@contoso.com",
        lastCommitAt: daysAgo(138),
        branchProtected: false,
      }),
      repo("foxtrot-bridge", {
        sizeGb: 0.6,
        loc: 14000,
        languageBreakdown: { "C++": 62, Python: 22, YAML: 10, Markdown: 6 },
        contributorCount: 2,
        hasWiki: false,
        commits90d: 4,
        primaryOwner: "owen.campbell@contoso.com",
        lastCommitAt: daysAgo(22),
      }),
    ],
    workflows: [
      workflow("foxtrot-legacy-build", "BUILD", {
        isClassic: true,
        customTasks: ["PowerShell@1 — deprecated signing"],
        deprecatedTasks: ["PowerShell@1"],
        stageCount: 2,
        averageDurationMin: 28,
        triggersPerWeek: 0,
        failsLast30d: 0,
      }),
      workflow("foxtrot-bridge-build", "BUILD", {
        averageDurationMin: 8,
        triggersPerWeek: 1,
        failsLast30d: 0,
      }),
    ],
    jtbds: allJtbds(jtbdOverridesFor("FOXTROT")),
    customizations: [],
    risks: [
      {
        title: "Rolled back: missing LFS migration path",
        detail:
          "Initial cut-over attempted without LFS-aware tooling for a legacy artifact store. Rollback executed; team parked pending a viable migration approach.",
        confidence: "HIGH",
        mitigation:
          "Team moved off active migration wave. Revisit after Delta's LFS tooling is proven.",
        status: "ACCEPTED",
        category: "Pipelines",
      },
    ],
    ownership: {
      primaryOwnerEmail: "miranda.flint@contoso.com",
      onCallGroup: null,
      escalationContact: null,
    },
    adoProjects: [
      adoProject("FoxtrotLegacy", {
        description: "Archived legacy platform; maintenance only",
        repoCount: 3,
        pipelineCount: 2,
        boardCount: 1,
      }),
    ],
    serviceConnections: [
      serviceConnection("foxtrot-azure-maint", "AZURE_RM", {
        targetService: "Azure RM · foxtrot-maintenance",
        authMethod: "service-principal",
        usedByCount: 1,
        lastRotatedAt: daysAgo(248),
      }),
    ],
    releaseDefinitions: [
      releaseDefinition("foxtrot-legacy-maint-release", {
        stages: 2,
        isClassic: true,
        hasManualGates: false,
        gateTypes: [],
        deployTargets: ["maintenance-infra"],
        lastRunAt: daysAgo(88),
      }),
    ],
    extensions: [
      extension("Azure Artifacts", "Microsoft", "artifacts", {
        hasGitHubEquivalent: true,
      }),
    ],
    agentRun: {
      startedAt: hoursAgo(22),
      completedAt: new Date(hoursAgo(22).getTime() + 18_000),
      durationMs: 18_000,
    },
    curatedFindings: [
      needsInput(
        "Ownership",
        "ownership.onCallGroup",
        "On-call group",
        "No on-call group present; team is archived but ownership record retained.",
      ),
      needsInput(
        "Ownership",
        "ownership.escalationContact",
        "Escalation contact",
        "No escalation contact captured.",
      ),
      needsInput(
        "Code & repos",
        "repos.foxtrot-legacy.migration",
        "foxtrot-legacy migration plan",
        "Team is rolled-back and parked. Is this repo being revived for a second migration attempt, or left on ADO indefinitely?",
      ),
      needsInput(
        "Pipelines",
        "workflows.foxtrot-legacy-build.retirement",
        "Retire foxtrot-legacy-build?",
        "Pipeline hasn't run in 30 days. Retire before a future migration attempt or preserve for maintenance windows?",
      ),
      needsInput(
        "Auth & security",
        "serviceConnections.foxtrot-azure-maint.rotation",
        "Maintenance SP rotation",
        "SP is 248 days old. Policy is 90d. Rotate regardless of migration plan.",
      ),

      anomaly(
        "Pipelines",
        "workflows.foxtrot-legacy-build.viability",
        "foxtrot-legacy-build migration viability",
        "uncertain",
        "Pipeline uses deprecated PowerShell@1 signing task. Unclear whether team intends to revive or retire.",
      ),
      anomaly(
        "Auth & security",
        "serviceConnections.foxtrot-azure-maint.rotationDrift",
        "Maintenance SP rotation drift",
        "age: 248 days",
        "SP credential is far past rotation policy. Likely forgotten after rollback.",
      ),
      anomaly(
        "Code & repos",
        "repos.foxtrot-tools.activity",
        "foxtrot-tools has no recent activity",
        "commits90d: 0",
        "No commits in 138 days. Archived and likely cold; worth confirming we're not on a ghost dependency.",
      ),

      // Inferred finding (source=INFERRED, confidence=LOW).

      anomaly(
        "Process / operational",
        "migration.rolledBackRediscoveryGap",
        "Archived repos in a rolled-back wave may be excluded from future automated scans",
        "state: ROLLED_BACK + isArchived",
        "INFERRED chain from 'ROLLED_BACK migration state' + 'archived repos'. Future migration-wave tooling will likely filter on migrationState IN ('NOT_STARTED','REVIEWING',...) and skip ROLLED_BACK. When Foxtrot is revived, its archived repos may need manual re-registration. Not independently documented but a common gotcha in multi-wave programs.",
      ),
    ],
  };
}
