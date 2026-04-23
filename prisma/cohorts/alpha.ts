import {
  adoProject,
  anomaly,
  daysAgo,
  daysFromNow,
  extension,
  hoursAgo,
  allJtbds,
  member,
  needsInput,
  repo,
  serviceConnection,
  workflow,
  type CohortShape,
} from "./_helpers";

export function alphaConfig(orgId: string): CohortShape {
  return {
    orgId,
    name: "Alpha Platform",
    slug: "alpha",
    tagline: "The easy yes",
    description:
      "A small team with one clean monorepo, standard YAML build pipeline, no customizations, no open risks. Agent auto-populated almost everything; Champion has little to review.",
    cohort: "ALPHA",
    wave: 1,
    migrationState: "NOT_STARTED",
    engineerCount: 3,
    tier: "TIER_3",
    securityClassification: null,
    healthStatus: "ON_TRACK",
    effortEstimateLowWeeks: 4,
    effortEstimateHighWeeks: 6,
    effortConfidence: "HIGH",
    effortProgressWeeks: 0,
    targetCutoverAt: daysFromNow(42),
    slackWeeks: 2,
    workItemsActive: 14,
    workItemsClosed90d: 52,
    buildArtifactCount: 38,
    wikiPageCount: 12,
    championEmail: "alex.chen@contoso.com",
    members: [
      member("Alex Chen", "alex.chen@contoso.com", "Engineering Lead"),
      member("Maria Lopez", "maria.lopez@contoso.com", "Senior Engineer"),
      member("Sam Taylor", "sam.taylor@contoso.com", "Engineer"),
    ],
    codebase: {
      primaryLang: "TypeScript",
      usesLfs: false,
      totalSizeGb: 2.3,
    },
    repos: [
      repo("alpha-service", {
        sizeGb: 1.7,
        loc: 42000,
        languageBreakdown: {
          TypeScript: 82,
          JavaScript: 8,
          YAML: 6,
          Markdown: 4,
        },
        contributorCount: 3,
        hasWiki: true,
        wikiPageCount: 8,
        commits90d: 214,
        primaryOwner: "alex.chen@contoso.com",
        lastCommitAt: daysAgo(2),
      }),
      repo("alpha-worker", {
        sizeGb: 0.6,
        loc: 14200,
        languageBreakdown: { TypeScript: 91, YAML: 6, Markdown: 3 },
        contributorCount: 2,
        hasWiki: false,
        commits90d: 68,
        primaryOwner: "maria.lopez@contoso.com",
        lastCommitAt: daysAgo(5),
      }),
    ],
    workflows: [
      workflow("alpha-ci", "BUILD", {
        averageDurationMin: 6,
        triggersPerWeek: 42,
        failsLast30d: 3,
        stageCount: 3,
      }),
      workflow("alpha-test", "TEST", {
        averageDurationMin: 4,
        triggersPerWeek: 42,
        failsLast30d: 1,
      }),
      workflow("alpha-release", "RELEASE", {
        averageDurationMin: 11,
        triggersPerWeek: 3,
        failsLast30d: 0,
        stageCount: 2,
      }),
    ],
    jtbds: allJtbds(),
    customizations: [],
    risks: [],
    ownership: {
      primaryOwnerEmail: "alex.chen@contoso.com",
      onCallGroup: "#alpha-oncall",
      escalationContact: "alex.chen@contoso.com",
    },
    adoProjects: [
      adoProject("AlphaPlatform", {
        description: "Alpha platform services",
        repoCount: 2,
        pipelineCount: 3,
        boardCount: 1,
      }),
    ],
    serviceConnections: [
      serviceConnection("alpha-azure-prod", "AZURE_RM", {
        targetService: "Azure Resource Manager · prod-eastus",
        authMethod: "service-principal",
        usedByCount: 2,
        lastRotatedAt: daysAgo(45),
      }),
      serviceConnection("alpha-docker", "DOCKER_HUB", {
        targetService: "Docker Hub · contoso-alpha",
        authMethod: "PAT",
        usedByCount: 1,
        lastRotatedAt: daysAgo(60),
      }),
    ],
    releaseDefinitions: [],
    extensions: [
      extension("Azure Artifacts", "Microsoft", "artifacts", {
        hasGitHubEquivalent: true,
        notes: "Maps cleanly to GitHub Packages",
      }),
    ],
    agentRun: {
      startedAt: hoursAgo(2),
      completedAt: new Date(hoursAgo(2).getTime() + 45_000),
      durationMs: 45_000,
    },
    curatedFindings: [
      needsInput(
        "Ownership",
        "ownership.escalationContact.formal",
        "Formal escalation contact",
        "Ownership record lists Alex as escalation contact, but there's no secondary. Champion should confirm or add a backup.",
      ),
      needsInput(
        "JTBDs",
        "jtbds.monitor-prod.tooling",
        "Production monitoring tooling",
        "Team monitors via Azure App Insights today; unclear whether that stays on ADO-adjacent infra or moves to GitHub-integrated observability.",
      ),

      // Inferred finding (source=INFERRED, confidence=LOW).

      anomaly(
        "Process / operational",
        "codeowners.smallTeamReviewBottleneck",
        "CODEOWNERS required-review may bottleneck on 3-engineer team",
        "team size: 3 · CODEOWNERS: TBD",
        "INFERRED domain reasoning from team size + GitHub's CODEOWNERS model. With 3 engineers, if the Champion is listed as a code-owner on every path, they become a PR-review bottleneck whenever they're OOO. Not independently documented but a standard small-team pattern worth flagging before migration.",
      ),
    ],
  };
}
