import type { Prisma } from "../../src/generated/prisma/client";

/**
 * Reference catalog of common ADO customizations from the migration framework
 * (see /docs/framework). 29 rows: C01–C29. Teams reference these via
 * Customization.catalogId; teams may also have customizations not in this
 * catalog (catalogId null).
 *
 * Note on `jtbdPerformer`: customization JTBDs are performed by "Custom code"
 * (the customization itself is the actor), not a human persona. This is the
 * key distinction from JtbdEntry, where the performer is a user role
 * (Developer, Tech Lead, PM, etc.).
 */
export const CUSTOMIZATION_CATALOG: Prisma.CustomizationCatalogCreateInput[] = [
  // ---------- 01 · Boards & Work Tracking ----------
  {
    catalogCode: "C01",
    name: "Custom process templates",
    category: "BOARDS",
    commonality: "MOST",
    parity: "PARTIAL",
    strategy: "S01_PROTECT_IN_PLACE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      'Defines a company-specific process template (fields, types, workflows) that all new projects inherit; encodes the organization\'s idea of "how we work" as the default for every new team.',
    githubEquivalent:
      "Issue Types + Project Templates + Issue Fields cover fragments but don't compose as a single inheritable unit.",
    notes:
      "Lives on Boards; hybrid preserves it. The strongest reason Boards stays.",
  },
  {
    catalogCode: "C02",
    name: "Custom work item types",
    category: "BOARDS",
    commonality: "MOST",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Adds work item types beyond the defaults (Epic / Feature / Story / Task); introduces team-specific categories like Spike, Compliance Review, or Customer Escalation.",
    githubEquivalent:
      "GitHub Issue Types (GA April 2025), org-level, up to 25.",
    notes:
      "Translates cleanly when Boards eventually moves; gap is per-type workflows.",
  },
  {
    catalogCode: "C03",
    name: "Custom fields on work items",
    category: "BOARDS",
    commonality: "MOST",
    parity: "PARTIAL",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Adds domain-specific fields to work items; captures cost center, customer, risk level, and compliance tags for routing and reporting that generic fields can't support.",
    githubEquivalent:
      "Issue Fields (org-level, up to 25) + Projects custom fields (per project).",
    notes: "Combined coverage is good; structure remains fragmented vs ADO.",
  },
  {
    catalogCode: "C04",
    name: "Custom states & workflows",
    category: "BOARDS",
    commonality: "MOST",
    parity: "GAP",
    strategy: "S01_PROTECT_IN_PLACE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Defines the team's real state machine beyond the defaults; introduces states like Pending Design Review, Blocked on Legal, or In UAT that mirror how the team actually moves work.",
    githubEquivalent:
      "Labels or Project columns; no enforced state transitions — conventions, not rules.",
    notes: "Compliance-driven workflows need enforced states. Stays in ADO.",
  },
  {
    catalogCode: "C05",
    name: "Work item rules & automation",
    category: "BOARDS",
    commonality: "SOME",
    parity: "PARTIAL",
    strategy: "S03_RETIRE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Enforces policy as automation at work-item creation and edit time; auto-assigns Sev 1 bugs to on-call, requires a platform field when Area Path is Mobile, and similar conditional rules.",
    githubEquivalent:
      "Actions for issue automation — more flexible but requires writing code.",
    notes: "Migration reveals many rules duplicate Actions/IssueOps natively.",
  },
  {
    catalogCode: "C06",
    name: "Area & iteration paths",
    category: "BOARDS",
    commonality: "MOST",
    parity: "PARTIAL",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Classifies work hierarchically by team or component (Area) and by sprint or release (Iteration); enables rollup reporting and team-view filtering across the hierarchy.",
    githubEquivalent:
      "Iteration fields strong; no hierarchical area-path concept (labels or separate Projects).",
    notes: "Iterations port well; area-path rollup reporting does not.",
  },
  {
    catalogCode: "C07",
    name: "Custom queries (WIQL)",
    category: "BOARDS",
    commonality: "MOST",
    parity: "PARTIAL",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Saves frequently-used filters for daily team use; surfaces views like my active bugs, unassigned Sev 2s in my area, or PRs blocked on me as one-click access.",
    githubEquivalent:
      "Advanced search with AND/OR/parentheses (GA April 2025) + Project views.",
    notes: "Comparable power for most queries; syntax differs from WIQL.",
  },
  {
    catalogCode: "C08",
    name: "Custom backlog & sprint configurations",
    category: "BOARDS",
    commonality: "SOME",
    parity: "PARTIAL",
    strategy: "S01_PROTECT_IN_PLACE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Shapes how the team plans and tracks work; configures backlog hierarchy levels, swimlanes, and bugs-as-requirements vs bugs-as-tasks behavior specific to the team's process.",
    githubEquivalent:
      "Projects views + sub-issues (GA 2025). No formal backlog with velocity rollup.",
    notes: "Hierarchical backlog model absent on GitHub.",
  },

  // ---------- 02 · Pipelines & CI/CD ----------
  {
    catalogCode: "C09",
    name: "Shared YAML templates",
    category: "PIPELINES",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Enforces consistency across pipelines and reduces copy-paste; defines standard pipeline patterns (build, scan, sign, deploy) once and consumes them across many repos.",
    githubEquivalent: "Pipelines stays; templates preserved as-is.",
    notes: "Hybrid model protects this investment.",
  },
  {
    catalogCode: "C10",
    name: "Task groups",
    category: "PIPELINES",
    commonality: "RARE",
    parity: "PARTIAL",
    strategy: "S05_BUILD_GLUE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Bundles a reusable unit of pipeline steps for classic pipelines; packages a sequence of tasks (e.g., build-sign-publish) that many pipelines share without duplication.",
    githubEquivalent:
      "Convert to YAML templates via tools like yamlizr; Pipelines stays.",
    notes: "Conversion is engineering work whether you migrate or modernize.",
  },
  {
    catalogCode: "C11",
    name: "Custom pipeline tasks",
    category: "PIPELINES",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Extends pipelines with team-specific tasks not in public marketplaces; implements custom signing, internal deploy tools, or bespoke validation as reusable pipeline tasks.",
    githubEquivalent: "Custom tasks continue to work in Pipelines.",
    notes: "Pipelines staying preserves this.",
  },
  {
    catalogCode: "C12",
    name: "Self-hosted agent pool configuration",
    category: "PIPELINES",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Operates dedicated build agents for non-standard build needs; provisions specific operating systems, toolchains, GPU access, or compliance-restricted environments.",
    githubEquivalent: "Agent pools continue in Pipelines with no change.",
    notes: "Hybrid model preserves existing infra.",
  },
  {
    catalogCode: "C13",
    name: "Service connection configuration",
    category: "PIPELINES",
    commonality: "MOST",
    parity: "BETTER",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Configures the credentials and connections pipelines use to reach cloud providers and registries; authenticates deploy-time access to Azure, AWS, npm, nuget, and internal services.",
    githubEquivalent: "Service connections remain in ADO.",
    notes: "Pipeline source wiring does change (ADO Repos → GitHub).",
  },

  // ---------- 03 · Repos & Branch Policy ----------
  {
    catalogCode: "C14",
    name: "Custom branch policies per repo",
    category: "REPOS",
    commonality: "MOST",
    parity: "BETTER",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "MOVES",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Enforces repository-level quality gates on specific branches; requires reviewers, status checks, and merge conditions before code lands on main.",
    githubEquivalent:
      "Per-repo branch protection + org-level rulesets (often an upgrade).",
    notes: "Org-level rulesets enable cross-repo enforcement.",
  },
  {
    catalogCode: "C15",
    name: "Custom pre-commit / pre-push hooks",
    category: "REPOS",
    commonality: "RARE",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "MOVES",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Blocks bad commits locally before they reach the server; runs linting, signing, or compliance checks as pre-commit and pre-push hooks on developer machines.",
    githubEquivalent: "Git hooks work identically on any Git-backed platform.",
    notes: "Not a platform concern.",
  },
  {
    catalogCode: "C16",
    name: "Custom required code reviewers",
    category: "REPOS",
    commonality: "MOST",
    parity: "BETTER",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "MOVES",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Encodes code ownership as review requirements; routes PRs affecting specific paths to the teams or individuals who own those paths for mandatory review.",
    githubEquivalent:
      "CODEOWNERS file with auto-request — typically an upgrade.",
    notes: "Migration tooling can generate CODEOWNERS from ADO config.",
  },

  // ---------- 04 · Dashboards & Reporting ----------
  {
    catalogCode: "C17",
    name: "Team & org dashboards",
    category: "DASHBOARDS",
    commonality: "MOST",
    parity: "GAP",
    strategy: "S01_PROTECT_IN_PLACE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Surfaces the team's daily operating picture; renders burndown, build status, open bugs, and PRs-awaiting-review as dashboard widgets for the morning glance.",
    githubEquivalent:
      "Projects views + Insights — no true dashboarding equivalent.",
    notes: "Dashboards pull from Boards data; preserved by keeping Boards.",
  },
  {
    catalogCode: "C18",
    name: "Analytics Views & Power BI reports",
    category: "DASHBOARDS",
    commonality: "SOME",
    parity: "PARTIAL",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Reports engineering metrics to leadership; calculates velocity, defect rates, and cycle time using ADO Analytics and Power BI as leadership's window into engineering.",
    githubEquivalent:
      "Insights + custom API-built reporting; Power BI connector for GitHub less mature.",
    notes:
      "Retaining Boards preserves much of this; code-side reports rebuild.",
  },
  {
    catalogCode: "C19",
    name: "Custom widgets on dashboards",
    category: "DASHBOARDS",
    commonality: "RARE",
    parity: "GAP",
    strategy: "S03_RETIRE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Displays bespoke data that off-the-shelf widgets don't cover; builds SLA compliance, health scores, or cost-per-team as custom widget components on dashboards.",
    githubEquivalent: "GitHub doesn't support custom widgets in Insights.",
    notes: "Niche but high emotional investment where present.",
  },

  // ---------- 05 · Extensions & Integrations ----------
  {
    catalogCode: "C20",
    name: "Marketplace extensions (third-party)",
    category: "EXTENSIONS",
    commonality: "SOME",
    parity: "PARTIAL",
    strategy: "S03_RETIRE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Fills platform gaps with third-party functionality; installs marketplace extensions for niche needs — Jira bridges, code quality tools, bespoke CD integrations.",
    githubEquivalent: "GitHub Marketplace exists; overlap is partial.",
    notes: "Audit required to identify replacements.",
  },
  {
    catalogCode: "C21",
    name: "In-house ADO extensions",
    category: "EXTENSIONS",
    commonality: "RARE",
    parity: "PARTIAL",
    strategy: "S05_BUILD_GLUE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Encodes institutional knowledge as in-ADO software; surfaces compliance gates, cost reporting, and company-specific tooling directly inside the ADO UI.",
    githubEquivalent:
      "Requires rewriting against GitHub Apps / Actions framework.",
    notes: "Niche but politically loaded — someone built these.",
  },
  {
    catalogCode: "C22",
    name: "REST API consumers (scripts, bots, tools)",
    category: "EXTENSIONS",
    commonality: "SOME",
    parity: "BETTER",
    strategy: "S05_BUILD_GLUE",
    hybridPlacement: "BOTH",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Automates the invisible infrastructure of an engineering team; runs scripts and bots for reporting, triage, notifications, and metrics collection against the ADO REST API.",
    githubEquivalent:
      "GitHub's REST + GraphQL APIs are arguably richer; rewrite endpoints and auth.",
    notes: "Tedious but straightforward for anything touching repos/PRs.",
  },
  {
    catalogCode: "C23",
    name: "Service hooks to external systems",
    category: "EXTENSIONS",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "BOTH",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Broadcasts platform events to the rest of the ecosystem; forwards work-item, build, and release events to Slack, Teams, PagerDuty, and custom webhook endpoints.",
    githubEquivalent: "GitHub webhooks map 1:1 for most common event types.",
    notes: "Re-point URLs and update event schemas.",
  },

  // ---------- 06 · Process & Workflow ----------
  {
    catalogCode: "C24",
    name: "Custom notifications & subscriptions",
    category: "PROCESS",
    commonality: "MOST",
    parity: "PARTIAL",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Controls signal-versus-noise for the team; routes notifications per-user, per-team, and per-event-type so people see what they need and ignore what they don't.",
    githubEquivalent:
      "Per-user notification preferences; less granular team-level subscriptions.",
    notes: "Users self-manage more on GitHub.",
  },
  {
    catalogCode: "C25",
    name: "Custom branch naming & PR conventions",
    category: "PROCESS",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "MOVES",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Supports automation and traceability through naming discipline; enforces patterns like feature/JIRA-123, hotfix/..., and trailer formats in commit messages.",
    githubEquivalent: "Naming enforcement via rulesets or Actions.",
    notes: "Pattern conventions are code-level, not platform-level.",
  },
  {
    catalogCode: "C26",
    name: "Tribal workflow conventions",
    category: "PROCESS",
    commonality: "MOST",
    parity: "MATCH",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "BOTH",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Captures undocumented team habits as muscle memory; reinforces conventions like always link the design doc in the PR description or tag the compliance team on regulated changes.",
    githubEquivalent: "Conventions travel with the team; need re-teaching.",
    notes: "Often surfaces during migration, not before.",
  },

  // ---------- 07 · Security & Access ----------
  {
    catalogCode: "C27",
    name: "Custom permission groups",
    category: "SECURITY",
    commonality: "MOST",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "BOTH",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Refines access control for real organizational complexity; defines groups beyond default admin/contributor — read-only auditors, limited external reviewers, specialized ops roles.",
    githubEquivalent:
      "GitHub Enterprise Cloud custom org roles + 20 custom repo roles (40+ permissions).",
    notes: "Mapping is conceptual work, not capability work.",
  },
  {
    catalogCode: "C28",
    name: "Path-scoped permissions",
    category: "SECURITY",
    commonality: "RARE",
    parity: "GAP",
    strategy: "S01_PROTECT_IN_PLACE",
    hybridPlacement: "MOVES",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Isolates sensitive files within a shared repo; restricts access to directories like legal/ or credentials/ to specific groups only.",
    githubEquivalent:
      "GitHub permissions are repo-scoped; no path-level access control.",
    notes: "Teams who depend on this may split repos or stay on ADO.",
  },
  {
    catalogCode: "C29",
    name: "Custom approval & release gates",
    category: "SECURITY",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S01_PROTECT_IN_PLACE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Guards deployment with regulatory and operational controls; enforces manual approvals and automated gates (security review, compliance check, cost validation) before release.",
    githubEquivalent: "Approvals and gates remain in Pipelines.",
    notes: "Hybrid protects release gating.",
  },

  // ---------- 08 · Discovered Extensions (C30–C35) ----------
  {
    catalogCode: "C30",
    name: "Built-in task translation gaps",
    category: "PIPELINES",
    commonality: "SOME",
    parity: "PARTIAL",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Uses ADO built-in tasks (FileTransform@1, replaceTokens, classic-only tasks) inside pipelines; tasks have no direct GitHub Actions equivalent and need translation when pipelines move.",
    githubEquivalent:
      "Composite Actions or marketplace replacements (envsubst, json-replace, etc.); 1:1 mapping rarely available.",
    notes:
      "Per-pipeline rewrites; classic-only tasks still need conversion if Pipelines ever moves.",
  },
  {
    catalogCode: "C31",
    name: "External-system release gates",
    category: "SECURITY",
    commonality: "SOME",
    parity: "GAP",
    strategy: "S05_BUILD_GLUE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Calls into ITSM or change-advisory systems (ServiceNow, BMC Remedy) to gate production releases on external approvals; distinct from internal approval gates (C29) by virtue of the external system.",
    githubEquivalent:
      "Custom GitHub Action or webhook calling the external system; no first-class equivalent.",
    notes:
      "Hybrid keeps these in Pipelines; rebuilds require deep ITSM API knowledge.",
  },
  {
    catalogCode: "C32",
    name: "Build numbering & versioning conventions",
    category: "PROCESS",
    commonality: "SOME",
    parity: "PARTIAL",
    strategy: "S04_REBUILD_WITH_LOSS",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Encodes a team-specific build-number scheme — yy.mm.dd.build, semantic-version composition, custom run-name formats — for traceability and downstream consumption.",
    githubEquivalent:
      "GitHub Actions run-name expressions + format() functions; covers most schemes.",
    notes:
      "Translation is mechanical but pervasive; downstream consumers may rely on the format.",
  },
  {
    catalogCode: "C33",
    name: "On-prem signing & secret-fetch tasks",
    category: "SECURITY",
    commonality: "SOME",
    parity: "GAP",
    strategy: "S05_BUILD_GLUE",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Reaches from pipelines to corporate signing services, HSMs, or on-prem secret stores via custom tasks; preserves enterprise control of signing keys.",
    githubEquivalent:
      "Reusable workflow + OIDC federation or self-hosted runner with on-prem reachability.",
    notes:
      "If Pipelines moves, redesign is significant — OIDC vs PAT decisions matter.",
  },
  {
    catalogCode: "C34",
    name: "Pipeline-to-pipeline / resource triggers",
    category: "PIPELINES",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "STAYS",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Triggers downstream pipelines on upstream pipeline completion via ADO resource pipelines; chains build → release or build → deploy across separate definitions.",
    githubEquivalent:
      "GitHub Actions workflow_run trigger or repository_dispatch event.",
    notes:
      "Concept maps cleanly; cross-pipeline artifact passing differs in syntax.",
  },
  {
    catalogCode: "C35",
    name: "Monorepo & LFS conventions",
    category: "REPOS",
    commonality: "SOME",
    parity: "MATCH",
    strategy: "S02_TRANSLATE_TO_GITHUB",
    hybridPlacement: "MOVES",
    jtbdPerformer: "Custom code",
    jobsToBeDone:
      "Operates large repos with sparse-checkout, Git LFS lifecycle policies, or submodule URL conventions; supports monorepos and binary-heavy codebases.",
    githubEquivalent:
      "GitHub LFS + sparse-checkout support GA; submodule URLs need rewriting at cutover.",
    notes:
      "GEI handles LFS pointers but not all object storage; verify per repo. Submodule URL rewrites are mechanical.",
  },
];

/** Quick lookup by catalog code (C01..C29) */
export const CATALOG_BY_CODE = new Map(
  CUSTOMIZATION_CATALOG.map((c) => [c.catalogCode, c]),
);
