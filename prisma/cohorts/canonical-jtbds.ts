/**
 * The canonical JTBD inventory from the Migration Framework doc (P.14 §02.6).
 * 118 jobs-to-be-done across 17 categories. Titles, categories, frequency,
 * default migration approach, and descriptions (the doc's "Migration impact"
 * copy) are verbatim from the doc — this module is the source of truth for
 * the review surface.
 *
 * Per-team variance (which JTBDs a team actually performs, per-team approach
 * overrides) lives in the cohort files, which reference these entries by code.
 */

import type { MigrationApproach } from "@/generated/prisma/enums";

export type CanonicalJtbd = {
  code: string; // "J01" .. "J118"
  category: string;
  title: string;
  frequency: string;
  approach: MigrationApproach;
  /** One-liner from the doc's "Migration impact" column. Shown below the
   *  job title on the review page to help Champion decide accept vs edit. */
  description: string;
};

export const CANONICAL_JTBDS: CanonicalJtbd[] = [
  // Code work
  {
    code: "J01",
    category: "Code work",
    title: "Commit and push code",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Direct migration via GEI. Git CLI workflow unchanged; remote URL updates at cutover.",
  },
  {
    code: "J02",
    category: "Code work",
    title: "Create a feature branch",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "No change to workflow. Branch protection may differ from ADO branch policies — discovery verifies.",
  },
  {
    code: "J03",
    category: "Code work",
    title: "Rebase or merge from main",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Unchanged. Git semantics are identical; muscle memory transfers.",
  },
  {
    code: "J04",
    category: "Code work",
    title: "Cherry-pick a commit",
    frequency: "Weekly",
    approach: "MOVES",
    description: "Unchanged. Pure git operation.",
  },
  {
    code: "J05",
    category: "Code work",
    title: "Revert a bad commit",
    frequency: "Weekly",
    approach: "MOVES",
    description: "Unchanged. Git revert semantics hold.",
  },
  {
    code: "J06",
    category: "Code work",
    title: "Resolve a merge conflict",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "Unchanged CLI; GitHub web UI for conflicts differs from ADO but functional.",
  },
  {
    code: "J07",
    category: "Code work",
    title: "Tag a release",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "Git tag workflow unchanged. Linking tags to Releases follows GitHub conventions.",
  },
  {
    code: "J08",
    category: "Code work",
    title: "Clone a repository locally",
    frequency: "Per-project",
    approach: "MOVES",
    description:
      "New clone URLs post-migration. Retraining on URL patterns minor.",
  },
  {
    code: "J09",
    category: "Code work",
    title: "Use Git LFS for large files",
    frequency: "Per-project",
    approach: "MOVES",
    description:
      "LFS pointers migrate via GEI; objects need separate verification. Discovery item per repo.",
  },
  {
    code: "J10",
    category: "Code work",
    title: "Update a submodule reference",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "URL rewrites required in .gitmodules across all consuming repos. Highest friction for submodule-heavy orgs.",
  },
  {
    code: "J11",
    category: "Code work",
    title: "Search for code across repos",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GitHub code search is richer than ADO search; a net gain. Requires learning new query syntax.",
  },

  // Pull requests & review
  {
    code: "J12",
    category: "Pull requests & review",
    title: "Open a pull request",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GitHub PR UX is different from ADO but widely recognized pattern. Learning curve is days, not weeks.",
  },
  {
    code: "J13",
    category: "Pull requests & review",
    title: "Review a pull request",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GitHub review ergonomics (suggested changes, inline threads) are a net gain.",
  },
  {
    code: "J14",
    category: "Pull requests & review",
    title: "Request changes on a PR",
    frequency: "Daily",
    approach: "MOVES",
    description:
      'ADO "Reject / Wait for author" maps to GitHub "Request changes". Some enum loss.',
  },
  {
    code: "J15",
    category: "Pull requests & review",
    title: "Approve and merge a PR",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Auto-merge differs on conflict handling. Merge strategies (squash/rebase/merge) preserved.",
  },
  {
    code: "J16",
    category: "Pull requests & review",
    title: "Link a PR to a work item",
    frequency: "Daily",
    approach: "BOTH",
    description:
      "Critical hybrid friction point. AB#12345 syntax in PR body; bidirectional link requires ADO-GitHub app.",
  },
  {
    code: "J17",
    category: "Pull requests & review",
    title: "Check branch policy compliance",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Enforced via branch protection + CODEOWNERS + required checks. Work-item-linking requirement has no direct equivalent.",
  },
  {
    code: "J18",
    category: "Pull requests & review",
    title: "Assign required reviewers",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "CODEOWNERS file becomes the source of truth. Team routing requires team structure remapping.",
  },
  {
    code: "J19",
    category: "Pull requests & review",
    title: "Convert a draft PR to ready",
    frequency: "Daily",
    approach: "MOVES",
    description: "Direct feature parity.",
  },
  {
    code: "J20",
    category: "Pull requests & review",
    title: "Reply to PR comments",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Threaded comment experience preserved with minor formatting differences.",
  },
  {
    code: "J21",
    category: "Pull requests & review",
    title: "Close a PR without merging",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "Unchanged workflow; PR history preserved in GitHub as closed-unmerged.",
  },

  // Work planning & tracking
  {
    code: "J22",
    category: "Work planning & tracking",
    title: "Create a work item",
    frequency: "Daily",
    approach: "STAYS",
    description: "Stays in ADO Boards. No workflow change for Boards users.",
  },
  {
    code: "J23",
    category: "Work planning & tracking",
    title: "Update work-item status",
    frequency: "Daily",
    approach: "STAYS",
    description:
      "Stays in ADO. Developer crosses the platform boundary: code in GitHub, status in ADO.",
  },
  {
    code: "J24",
    category: "Work planning & tracking",
    title: "View my assigned work",
    frequency: "Daily",
    approach: "STAYS",
    description:
      "Stays in ADO. Cross-platform context switching on every task.",
  },
  {
    code: "J25",
    category: "Work planning & tracking",
    title: "Plan a sprint",
    frequency: "Per-sprint",
    approach: "STAYS",
    description:
      "Stays in ADO Boards. Iteration paths, capacity planning, team assignments all preserved.",
  },
  {
    code: "J26",
    category: "Work planning & tracking",
    title: "Groom the backlog",
    frequency: "Weekly",
    approach: "STAYS",
    description: "Stays in ADO. Hierarchical parent/child preserved.",
  },
  {
    code: "J27",
    category: "Work planning & tracking",
    title: "Write a WIQL query",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Stays in ADO. Query-driven views, saved queries, shared queries all preserved.",
  },
  {
    code: "J28",
    category: "Work planning & tracking",
    title: "Update Kanban board",
    frequency: "Daily",
    approach: "STAYS",
    description: "Stays in ADO. Column config, swimlanes, rules all preserved.",
  },
  {
    code: "J29",
    category: "Work planning & tracking",
    title: "Create a work-item hierarchy",
    frequency: "Weekly",
    approach: "STAYS",
    description: "Stays in ADO. Epic/Feature/Story rollup preserved.",
  },
  {
    code: "J30",
    category: "Work planning & tracking",
    title: "Attach a file to a work item",
    frequency: "Weekly",
    approach: "STAYS",
    description: "Stays in ADO. Size limits and attachment UI unchanged.",
  },
  {
    code: "J31",
    category: "Work planning & tracking",
    title: "Run a team retrospective",
    frequency: "Per-sprint",
    approach: "STAYS",
    description: "Stays in ADO. Velocity charts and burndowns unchanged.",
  },
  {
    code: "J32",
    category: "Work planning & tracking",
    title: "Report a bug",
    frequency: "Daily",
    approach: "STAYS",
    description: "Stays in ADO. Bug work-item type preserved.",
  },
  {
    code: "J33",
    category: "Work planning & tracking",
    title: "View team velocity",
    frequency: "Per-sprint",
    approach: "STAYS",
    description:
      "Stays in ADO Boards. Charts, dashboards, trend views unchanged.",
  },

  // CI / CD & builds
  {
    code: "J34",
    category: "CI / CD & builds",
    title: "Trigger a CI build",
    frequency: "Daily",
    approach: "STAYS",
    description:
      "Per-team: if Pipelines stays, webhook from GitHub push triggers ADO. If moved to Actions, native.",
  },
  {
    code: "J35",
    category: "CI / CD & builds",
    title: "View build logs",
    frequency: "Daily",
    approach: "STAYS",
    description:
      "Per-team. Developer crosses to ADO for logs if Pipelines stays; stays in GitHub if Actions.",
  },
  {
    code: "J36",
    category: "CI / CD & builds",
    title: "Debug a failing build",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Per-team. Debugging is a friction point when build system is in a different platform than code.",
  },
  {
    code: "J37",
    category: "CI / CD & builds",
    title: "Edit a pipeline YAML",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Per-team. ADO YAML and GitHub Actions YAML differ significantly; no mechanical translation.",
  },
  {
    code: "J38",
    category: "CI / CD & builds",
    title: "Configure a build trigger",
    frequency: "Per-project",
    approach: "STAYS",
    description:
      "Per-team. New service connection needed if Pipelines stays and code moves.",
  },
  {
    code: "J39",
    category: "CI / CD & builds",
    title: "Manage variable groups",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Per-team. Stays in ADO if Pipelines stays; rebuilt as GitHub Actions secrets/variables otherwise.",
  },
  {
    code: "J40",
    category: "CI / CD & builds",
    title: "Manage service connections",
    frequency: "Per-project",
    approach: "STAYS",
    description:
      "Credentials do NOT migrate. OIDC federation rebuilt or re-registered per pipeline.",
  },
  {
    code: "J41",
    category: "CI / CD & builds",
    title: "Manage a self-hosted agent",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Per-team. Reinstall as GitHub runners on same infrastructure, or keep as ADO agents.",
  },
  {
    code: "J42",
    category: "CI / CD & builds",
    title: "Install a custom pipeline task",
    frequency: "Rare",
    approach: "STAYS",
    description:
      "Stays in ADO. If migrating to Actions, custom tasks require rewrite as composite actions.",
  },
  {
    code: "J43",
    category: "CI / CD & builds",
    title: "Manage build artifacts",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Per-team. Stays in ADO Artifacts if Pipelines stays; GitHub Packages otherwise.",
  },

  // Deploy & release
  {
    code: "J44",
    category: "Deploy & release",
    title: "Deploy to staging",
    frequency: "Daily",
    approach: "STAYS",
    description:
      "Per-team. Release Definitions stay in ADO under hybrid; GitHub Environments otherwise.",
  },
  {
    code: "J45",
    category: "Deploy & release",
    title: "Deploy to production",
    frequency: "Per-release",
    approach: "STAYS",
    description:
      "Per-team. Release gates and approvals stay in ADO if Pipelines stays.",
  },
  {
    code: "J46",
    category: "Deploy & release",
    title: "Approve a release",
    frequency: "Per-release",
    approach: "STAYS",
    description:
      "Stays in ADO. Approval UX unchanged for Pipelines-resident teams.",
  },
  {
    code: "J47",
    category: "Deploy & release",
    title: "Roll back a deployment",
    frequency: "Rare",
    approach: "STAYS",
    description:
      "Per-team. Rollback mechanics similar in Actions but with different UX.",
  },
  {
    code: "J48",
    category: "Deploy & release",
    title: "Deploy a hotfix",
    frequency: "Per-release",
    approach: "BOTH",
    description:
      "Per-team. Code portion moves to GitHub; deployment portion per hybrid decision.",
  },
  {
    code: "J49",
    category: "Deploy & release",
    title: "View deployment history",
    frequency: "Weekly",
    approach: "STAYS",
    description:
      "Historical deployment records stay in ADO; new deployments in GitHub if Actions adopted. Cross-system traceability gap.",
  },
  {
    code: "J50",
    category: "Deploy & release",
    title: "Schedule a release window",
    frequency: "Per-release",
    approach: "BOTH",
    description:
      "Branch locking during freeze: GitHub branch protection can lock branches; different UX than ADO.",
  },

  // Testing & QA
  {
    code: "J51",
    category: "Testing & QA",
    title: "Run automated tests in CI",
    frequency: "Daily",
    approach: "BOTH",
    description:
      "Per-team. Test results surface in GitHub PR via Checks API regardless of CI location.",
  },
  {
    code: "J52",
    category: "Testing & QA",
    title: "Review test results in PR",
    frequency: "Daily",
    approach: "BOTH",
    description: "GitHub Checks API displays results natively. Substitution.",
  },
  {
    code: "J53",
    category: "Testing & QA",
    title: "Run a manual test plan",
    frequency: "Per-release",
    approach: "STAYS",
    description:
      "Stays in ADO Test Plans. No GitHub equivalent for structured test plans.",
  },
  {
    code: "J54",
    category: "Testing & QA",
    title: "Log a test result manually",
    frequency: "Daily",
    approach: "STAYS",
    description: "Stays in ADO. Manual test execution UI preserved.",
  },
  {
    code: "J55",
    category: "Testing & QA",
    title: "Run an exploratory test session",
    frequency: "Per-release",
    approach: "STAYS",
    description: "Stays in ADO. No GitHub equivalent for exploratory sessions.",
  },
  {
    code: "J56",
    category: "Testing & QA",
    title: "Track code coverage",
    frequency: "Weekly",
    approach: "BOTH",
    description:
      "Third-party integrations (Codecov) work across both. GitHub native coverage improving.",
  },
  {
    code: "J57",
    category: "Testing & QA",
    title: "Link a bug to a test case",
    frequency: "Per-release",
    approach: "STAYS",
    description:
      "Stays in ADO. Test-case-to-work-item linking preserved within ADO.",
  },
  {
    code: "J58",
    category: "Testing & QA",
    title: "File a regression report",
    frequency: "Per-release",
    approach: "STAYS",
    description:
      "Stays in ADO Boards + Test Plans. No cross-platform boundary.",
  },

  // Security & compliance
  {
    code: "J59",
    category: "Security & compliance",
    title: "Respond to a secret-scanning alert",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GHAS native; push protection prevents commits with secrets. Net capability gain.",
  },
  {
    code: "J60",
    category: "Security & compliance",
    title: "Review a Dependabot alert",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GHAS native. EPSS integration (2025+). Substitution with broader coverage.",
  },
  {
    code: "J61",
    category: "Security & compliance",
    title: "Fix a code-scanning finding",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "CodeQL + Autofix. Remediation UI in PR flow. Net capability gain.",
  },
  {
    code: "J62",
    category: "Security & compliance",
    title: "Respond to a security advisory",
    frequency: "Rare",
    approach: "MOVES",
    description:
      "Private vulnerability reporting natively supported on GitHub.",
  },
  {
    code: "J63",
    category: "Security & compliance",
    title: "Enforce SDL gates on a PR",
    frequency: "Daily",
    approach: "BOTH",
    description:
      "Composition: GitHub rulesets + GHAS policies + ADO checks (if Pipelines stays).",
  },
  {
    code: "J64",
    category: "Security & compliance",
    title: "Audit permission changes",
    frequency: "Weekly",
    approach: "BOTH",
    description:
      "Audit logs on both sides during hybrid overlap. Event taxonomies differ.",
  },
  {
    code: "J65",
    category: "Security & compliance",
    title: "Generate a compliance report",
    frequency: "Per-audit",
    approach: "BOTH",
    description:
      "Aggregates across ADO audit, GitHub audit, security tooling. New reporting pipeline required.",
  },
  {
    code: "J66",
    category: "Security & compliance",
    title: "Respond to a regulatory audit",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "Evidence spans ADO (work items, Test Plans) and GitHub (code, security). Cross-system gather required.",
  },
  {
    code: "J67",
    category: "Security & compliance",
    title: "Generate an SBOM",
    frequency: "Per-release",
    approach: "MOVES",
    description:
      "Native GitHub dependency graph + export. Net capability gain.",
  },
  {
    code: "J68",
    category: "Security & compliance",
    title: "Enforce branch protection for compliance",
    frequency: "Per-project",
    approach: "MOVES",
    description:
      "Rulesets (newer) preferred over classic branch protection for org-wide policy.",
  },

  // Identity & access
  {
    code: "J69",
    category: "Identity & access",
    title: "Sign in with SSO",
    frequency: "Daily",
    approach: "BOTH",
    description:
      "Entra ID SAML/OIDC to GitHub EMU. Users are org-scoped in EMU.",
  },
  {
    code: "J70",
    category: "Identity & access",
    title: "Grant repo access to a team",
    frequency: "Per-project",
    approach: "BOTH",
    description: "Team structure remapped. Nested hierarchies may flatten.",
  },
  {
    code: "J71",
    category: "Identity & access",
    title: "Request access to a repo",
    frequency: "Per-project",
    approach: "BOTH",
    description: "New request flow via GitHub. Workflow differs from ADO.",
  },
  {
    code: "J72",
    category: "Identity & access",
    title: "Rotate a personal access token",
    frequency: "Weekly",
    approach: "BOTH",
    description:
      "Fine-grained PATs preferred. Tokens do NOT migrate; users recreate at cutover.",
  },
  {
    code: "J73",
    category: "Identity & access",
    title: "Register a service principal",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "GitHub Apps + OIDC to Azure. Each ADO service principal rebuilt.",
  },
  {
    code: "J74",
    category: "Identity & access",
    title: "Audit cross-org permissions",
    frequency: "Per-audit",
    approach: "BOTH",
    description:
      "Decomposition: enterprise + org + repo + ruleset roles. Harder to audit than ADO unified model.",
  },
  {
    code: "J75",
    category: "Identity & access",
    title: "Configure CODEOWNERS",
    frequency: "Per-project",
    approach: "MOVES",
    description:
      "Substitution for ADO path-based required reviewers. File-based; version-controlled.",
  },

  // Integrations & automation
  {
    code: "J76",
    category: "Integrations & automation",
    title: "Configure a webhook",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "Re-register URLs post-migration. Event payload shapes differ from ADO.",
  },
  {
    code: "J77",
    category: "Integrations & automation",
    title: "Install a marketplace app",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "Different marketplace: GitHub Apps, Actions Marketplace, or custom builds.",
  },
  {
    code: "J78",
    category: "Integrations & automation",
    title: "Write automation against the API",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "REST/GraphQL rewrite required. Every internal tool using ADO API rebuilt. Large discovery item.",
  },
  {
    code: "J79",
    category: "Integrations & automation",
    title: "Integrate with Slack/Teams",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "GitHub native integrations for Slack/Teams. Reconfigure per repo/org.",
  },
  {
    code: "J80",
    category: "Integrations & automation",
    title: "Set up a ChatOps bot",
    frequency: "Per-project",
    approach: "BOTH",
    description: "GitHub webhook payloads differ; bot logic may need updating.",
  },

  // Reporting & metrics
  {
    code: "J81",
    category: "Reporting & metrics",
    title: "View a team dashboard",
    frequency: "Daily",
    approach: "STAYS",
    description:
      "Decomposition: ADO Boards dashboards + GitHub Insights + external BI for exec rollups.",
  },
  {
    code: "J82",
    category: "Reporting & metrics",
    title: "Check DORA metrics",
    frequency: "Weekly",
    approach: "BOTH",
    description:
      "Code-side (deploy freq, lead time) in GitHub Insights; work-side (change-failure rate) spans both.",
  },
  {
    code: "J83",
    category: "Reporting & metrics",
    title: "View Copilot adoption",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "New capability unlocked by migration. Copilot Business/Enterprise metrics.",
  },
  {
    code: "J84",
    category: "Reporting & metrics",
    title: "Pull a portfolio rollup for execs",
    frequency: "Monthly",
    approach: "STAYS",
    description:
      "Delivery plans stay in ADO. Rollup aggregates from ADO Boards + external BI.",
  },
  {
    code: "J85",
    category: "Reporting & metrics",
    title: "Track security posture",
    frequency: "Weekly",
    approach: "BOTH",
    description: "Aggregates across ADO audit, GitHub audit, GHAS findings.",
  },

  // Code comprehension & navigation
  {
    code: "J86",
    category: "Code comprehension & navigation",
    title: "Orient in an unfamiliar codebase",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "GitHub code search and Copilot Chat provide net-new orientation capability. ADO relies on IDE-side navigation.",
  },
  {
    code: "J87",
    category: "Code comprehension & navigation",
    title: "Find a specific PR or commit",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GitHub search syntax differs from ADO; PR history migrates via GEI. Retraining on filters is days, not weeks.",
  },
  {
    code: "J88",
    category: "Code comprehension & navigation",
    title: "Locate a repository",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "Enterprise-wide search across orgs and repos; different UX from ADO's project-scoped repo list.",
  },
  {
    code: "J89",
    category: "Code comprehension & navigation",
    title: "Understand who owns a file",
    frequency: "Weekly",
    approach: "MOVES",
    description:
      "CODEOWNERS file at repo root is grep-able and self-documenting; easier to read than ADO path-based reviewer policies.",
  },
  {
    code: "J90",
    category: "Code comprehension & navigation",
    title: "Read repository documentation",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "Project wiki migrates to repo-scoped wiki; hierarchy flattens. README rendering equivalent.",
  },
  {
    code: "J91",
    category: "Code comprehension & navigation",
    title: "Ask a question about the codebase",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Net-new capability. Copilot Chat is native; no ADO equivalent.",
  },

  // Onboarding & environment
  {
    code: "J92",
    category: "Onboarding & environment",
    title: "Receive platform access (new hire)",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "EMU account provisioned from Entra ID via SCIM; team membership syncs from identity groups. Different mechanism than ADO org provisioning.",
  },
  {
    code: "J93",
    category: "Onboarding & environment",
    title: "Set up a local dev environment",
    frequency: "Per-project",
    approach: "MOVES",
    description:
      "Devcontainer-first approach in GitHub; clone + manual setup path preserved. First-day time sink reduced if devcontainer is configured.",
  },
  {
    code: "J94",
    category: "Onboarding & environment",
    title: "Open a Codespace",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "Net-new capability. Cloud dev environment ready in minutes; no ADO equivalent.",
  },
  {
    code: "J95",
    category: "Onboarding & environment",
    title: "Find a starter or good-first-issue task",
    frequency: "Per-project",
    approach: "STAYS",
    description:
      'Work items stay in Boards. Query pattern ("good first issue" / "new-contributor" tags) unchanged on ADO side.',
  },
  {
    code: "J96",
    category: "Onboarding & environment",
    title: "Learn team workflow conventions",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "Some conventions visible in GitHub (rulesets, reusable Actions, templates); some remain in ADO (process templates, task groups).",
  },
  {
    code: "J97",
    category: "Onboarding & environment",
    title: "Complete first PR as onboarding milestone",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "GitHub contribution graph updates on user profile as a public activity signal; no direct ADO equivalent.",
  },

  // Review workflow
  {
    code: "J98",
    category: "Review workflow",
    title: "View my review queue",
    frequency: "Daily",
    approach: "MOVES",
    description:
      "GitHub's review-requested filter and assignment routing differ from ADO; CODEOWNERS auto-requests reviewers more predictably.",
  },
  {
    code: "J99",
    category: "Review workflow",
    title: "Receive a CI failure notification",
    frequency: "Daily",
    approach: "BOTH",
    description:
      "Per-team. Notification source follows the pipeline: GitHub Actions notifies via GitHub; ADO Pipelines notifies via ADO. Webhook routing configurable either way.",
  },
  {
    code: "J100",
    category: "Review workflow",
    title: "Reproduce a failing build locally",
    frequency: "Weekly",
    approach: "BOTH",
    description:
      "Build-log retrieval differs by platform, but local reproduction is a local-tooling concern largely unaffected by migration.",
  },
  {
    code: "J101",
    category: "Review workflow",
    title: "Investigate a regression via git bisect",
    frequency: "Per-release",
    approach: "MOVES",
    description:
      "Pure git operation — no platform delta. Git history migrates 1:1 via GEI.",
  },

  // Admin & platform
  {
    code: "J102",
    category: "Admin & platform",
    title: "Create a new repository",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "GitHub org-scoped creation differs from ADO project-scoped. Default rulesets and templates shape the starting baseline.",
  },
  {
    code: "J103",
    category: "Admin & platform",
    title: "Configure repo policies at creation",
    frequency: "Per-project",
    approach: "MOVES",
    description:
      "GitHub rulesets (org or repo scope) replace ADO branch policies. Org-level defaults are a new capability.",
  },
  {
    code: "J104",
    category: "Admin & platform",
    title: "Invite a user to a repo",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "Team-based grant preferred over individual invite. EMU enforces identity scoping.",
  },
  {
    code: "J105",
    category: "Admin & platform",
    title: "Transfer a repo between orgs",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "GitHub supports org-to-org transfers natively. URL redirects preserve links; CI webhooks and service connections must be reconfigured.",
  },
  {
    code: "J106",
    category: "Admin & platform",
    title: "Archive a repo",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "GitHub native archive makes a repo read-only; different UX from ADO's disable/delete patterns. Recoverable decision.",
  },
  {
    code: "J107",
    category: "Admin & platform",
    title: "Offboard / deactivate a user",
    frequency: "Per-project",
    approach: "BOTH",
    description:
      "SCIM deprovisioning from Entra ID flows to GitHub EMU. Repo access revoked automatically; orphaned resources need manual transfer.",
  },
  {
    code: "J108",
    category: "Admin & platform",
    title: "Transfer ownership of orphan resources",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "When a user offboards, their repos, PRs, and automation bots need reassignment. Discovery item per organization.",
  },

  // Policy & governance
  {
    code: "J109",
    category: "Policy & governance",
    title: "Roll out a policy across many repos",
    frequency: "Per-audit",
    approach: "MOVES",
    description:
      "Org-level rulesets are the single biggest structural improvement over ADO's per-repo branch policies. Applies at scope; no per-repo repetition.",
  },
  {
    code: "J110",
    category: "Policy & governance",
    title: "Verify policy coverage",
    frequency: "Per-audit",
    approach: "MOVES",
    description:
      "Ruleset evaluation reports show which repos are covered and which are exempted. Richer than ADO equivalent.",
  },
  {
    code: "J111",
    category: "Policy & governance",
    title: "Grant a policy exception",
    frequency: "Rare",
    approach: "MOVES",
    description:
      "Bypass actors / bypass lists on rulesets. Auditable. Similar concept to ADO branch policy overrides.",
  },

  // Incident response
  {
    code: "J112",
    category: "Incident response",
    title: "Receive an on-call page",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "Paging flows live outside both platforms (PagerDuty, Opsgenie). Webhook integration reconfigured at cutover.",
  },
  {
    code: "J113",
    category: "Incident response",
    title: "Rotate a credential urgently",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "Fine-grained PATs and GitHub Apps support rapid revocation. OIDC federation reduces rotation urgency by eliminating long-lived credentials.",
  },
  {
    code: "J114",
    category: "Incident response",
    title: "Purge sensitive data from git history",
    frequency: "Rare",
    approach: "MOVES",
    description:
      "Git history rewriting (BFG, filter-repo) is platform-agnostic. GitHub push protection prevents recurrence.",
  },
  {
    code: "J115",
    category: "Incident response",
    title: "Run a postmortem",
    frequency: "Rare",
    approach: "BOTH",
    description:
      "Work item (postmortem record) stays in ADO Boards; code-level references live in GitHub. Cross-system narrative.",
  },

  // Release events
  {
    code: "J116",
    category: "Release events",
    title: "Create a formal release",
    frequency: "Per-release",
    approach: "BOTH",
    description:
      "GitHub Releases (tag + notes + artifacts in one event) is a richer primitive than ADO's tag-only approach. Net capability gain if adopted.",
  },
  {
    code: "J117",
    category: "Release events",
    title: "Generate release notes / changelog",
    frequency: "Per-release",
    approach: "STAYS",
    description:
      "GitHub auto-generated release notes from PR titles are a net-new capability. ADO relies on external changelog tooling.",
  },
  {
    code: "J118",
    category: "Release events",
    title: "Publish release artifacts",
    frequency: "Per-release",
    approach: "BOTH",
    description:
      "GitHub Releases supports artifact attachments; GitHub Packages for feeds. Artifacts decision follows hybrid service choice.",
  },
];

/**
 * Ordered list of the 17 canonical categories — used by the review page to
 * render subsections in doc order.
 */
export const CANONICAL_CATEGORIES: string[] = [
  "Code work",
  "Pull requests & review",
  "Work planning & tracking",
  "CI / CD & builds",
  "Deploy & release",
  "Testing & QA",
  "Security & compliance",
  "Identity & access",
  "Integrations & automation",
  "Reporting & metrics",
  "Code comprehension & navigation",
  "Onboarding & environment",
  "Review workflow",
  "Admin & platform",
  "Policy & governance",
  "Incident response",
  "Release events",
];
