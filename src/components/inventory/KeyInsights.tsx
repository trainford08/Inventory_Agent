// Key Insights block for the /inventory listings page.
//
// Three program-level aggregates a PL needs at a glance:
//   1. Cohort archetype — does each cohort match its tagline?
//   2. Discovery state — how trustworthy is the inventory data right now?
//   3. Customization category mix — where do customizations cluster program-wide?
//
// Numbers are illustrative until the catalog + findings data are seeded across
// every cohort. Replace each INSIGHT_* block with a server query once available.

const INSIGHT_ARCHETYPE = [
  {
    cohort: "Alpha",
    tagline: "The easy yes",
    teamsScanned: 32,
    postureMatch: 91,
    posture: "Easy mover",
    strategy: "S02 Translate (54%)",
    parity: "Match (66%)",
  },
  {
    cohort: "Bravo",
    tagline: "The typical healthy team",
    teamsScanned: 47,
    postureMatch: 68,
    posture: "Easy mover",
    strategy: "S02 Translate (52%)",
    parity: "Match (62%)",
  },
  {
    cohort: "Charlie",
    tagline: "The interesting one",
    teamsScanned: 24,
    postureMatch: 79,
    posture: "Easy mover",
    strategy: "S02 Translate (48%)",
    parity: "Match (61%)",
  },
  {
    cohort: "Delta",
    tagline: "The heavyweight",
    teamsScanned: 19,
    postureMatch: 72,
    posture: "Mixed",
    strategy: "S02 Translate (55%)",
    parity: "Match (58%)",
  },
  {
    cohort: "Echo",
    tagline: "The Champion still has work",
    teamsScanned: 13,
    postureMatch: 85,
    posture: "Deep hybrid",
    strategy: "S05 Build glue (28%)",
    parity: "Gap (22%)",
  },
  {
    cohort: "Foxtrot",
    tagline: "The edge case",
    teamsScanned: 7,
    postureMatch: 71,
    posture: "Deep hybrid",
    strategy: "S01 Protect (52%)",
    parity: "Partial (41%)",
  },
];

const ARCHETYPE_TOTAL_TEAMS = INSIGHT_ARCHETYPE.reduce(
  (n, r) => n + r.teamsScanned,
  0,
);

const INSIGHT_DISCOVERY = {
  total: 14820,
  auto: 8595,
  needsInput: 5188,
  anomalies: 1037,
  staleTeams: 24,
  concentration:
    "Echo holds 387 of the 1,037 anomalies (37%) at ~30 per team — 4× the program average — reflecting how deeply customized its regulated workflows are. Foxtrot adds ~24 per team. 12 of the 24 stale-inventory teams sit in those two cohorts, so the rollups above are most fragile where Echo and Foxtrot live.",
};

const INSIGHT_CATEGORIES: Array<{
  label: string;
  count: number;
  pct: number;
}> = [
  { label: "Pipelines", count: 896, pct: 32 },
  { label: "Boards", count: 712, pct: 25 },
  { label: "Repos", count: 420, pct: 15 },
  { label: "Process", count: 340, pct: 12 },
  { label: "Dashboards", count: 252, pct: 9 },
  { label: "Extensions", count: 168, pct: 6 },
];

// Coverage tiers measure how widely a framework JTBD is performed across the
// 142-team scan. Threshold is ≥ 5% of teams (≈ 7 teams) for "commonly
// performed" — anything below that is long-tail and likely skippable.
// Customization migration strategies from the framework.
// S01 Protect (preserve as-is), S02 Translate (1:1 mapping to GitHub),
// S03 Retire (out of scope on GitHub), S04 Substitute (swap to GitHub-native),
// S05 Build glue (custom code), S06 Upstream (build centrally, reuse),
// S07 Vendor consolidation.
type CustomizationStrategy = "S01" | "S02" | "S03" | "S04" | "S05" | "S06";

const INSIGHT_CUSTOMIZATIONS = {
  // The 78 unique customization types in the program — each tied to a catalog
  // code (C01–C29 from the framework) plus team-specific customizations that
  // don't have catalog entries. This panel only surfaces cataloged codes used
  // by ≥ 25% of teams (real S06 "build once, reuse" candidates).
  highOverlapThresholdPct: 25,
  topOverlap: [
    {
      code: "C01",
      name: "Custom process templates",
      teams: 128,
      strategy: "S01" as CustomizationStrategy,
      strategyLabel: "Protect",
      note: "Near-universal. Worth a single centrally-maintained template that all teams adopt.",
    },
    {
      code: "C02",
      name: "Custom work item types",
      teams: 117,
      strategy: "S02" as CustomizationStrategy,
      strategyLabel: "Translate",
      note: "Translates 1:1 to GitHub Issue templates. Build the converter once.",
    },
    {
      code: "C13",
      name: "Service connection configuration",
      teams: 109,
      strategy: "S02" as CustomizationStrategy,
      strategyLabel: "Translate",
      note: "Standard pattern — central OIDC federation kit covers most teams.",
    },
    {
      code: "C09",
      name: "Shared YAML templates",
      teams: 92,
      strategy: "S02" as CustomizationStrategy,
      strategyLabel: "Translate",
      note: "Convert to reusable GitHub Actions workflows in a shared org repo.",
    },
    {
      code: "C16",
      name: "Custom required code reviewers",
      teams: 87,
      strategy: "S02" as CustomizationStrategy,
      strategyLabel: "Translate",
      note: "Maps to CODEOWNERS — publish a shared CODEOWNERS template repo.",
    },
    {
      code: "C29",
      name: "Custom approval & release gates",
      teams: 71,
      strategy: "S01" as CustomizationStrategy,
      strategyLabel: "Protect",
      note: "Stays in Pipelines (hybrid). Document the canonical gate set centrally.",
    },
    {
      code: "C04",
      name: "Custom dashboards & widgets",
      teams: 68,
      strategy: "S01" as CustomizationStrategy,
      strategyLabel: "Protect",
      note: "Stays in ADO. Curate a shared dashboard library teams clone from.",
    },
    {
      code: "C18",
      name: "Inline policy enforcement",
      teams: 54,
      strategy: "S04" as CustomizationStrategy,
      strategyLabel: "Substitute",
      note: "GitHub branch protection + rulesets cover most cases — publish a defaults bundle.",
    },
    {
      code: "C22",
      name: "Pipeline secret rotation hooks",
      teams: 41,
      strategy: "S05" as CustomizationStrategy,
      strategyLabel: "Build glue",
      note: "No off-the-shelf pattern. Strongest S06 candidate — build it once, ship it.",
    },
  ],
  actionSignal:
    "The top 5 cataloged customizations each appear in 60%+ of teams. Investing in a centrally-built migration kit for these — templates, scripts, CODEOWNERS bundles, OIDC federation patterns — pays back across the entire program. Without this, 142 teams each rebuild the same things from scratch.",
};

// "A1–A6" = the framework's per-integration playbooks for what happens to a
// vendor at cutover. A1 Re-setup (same vendor, GitHub-side), A2 Substitute
// (swap for a GitHub-native), A3 Work around (accept thinner GitHub support),
// A4 Build glue (custom code to bridge), A5 Accept loss, A6 Request roadmap.
type VendorApproach = "A1" | "A2" | "A3" | "A4" | "A5" | "A6";

const INSIGHT_VENDORS = {
  totalUniqueVendors: 58,
  highOverlapThresholdPct: 25, // ≥ 25% of teams = "high overlap"
  highOverlapCount: 7,
  singleOrRareCount: 32, // used by < 5% of teams
  topVendors: [
    {
      extension: "Slack ADO",
      vendor: "Slack",
      teams: 104,
      approach: "A1" as VendorApproach,
      note: "Same Slack-GitHub app exists; just re-authorize.",
    },
    {
      extension: "SonarCloud",
      vendor: "SonarSource",
      teams: 92,
      approach: "A1" as VendorApproach,
      note: "First-class GitHub support. Direct re-setup.",
    },
    {
      extension: "Snyk Security",
      vendor: "Snyk",
      teams: 78,
      approach: "A1" as VendorApproach,
      note: "Native GitHub app available.",
    },
    {
      extension: "Jira Sync",
      vendor: "Atlassian",
      teams: 63,
      approach: "A3" as VendorApproach,
      note: "GitHub side is thinner than ADO — accept reduced sync.",
    },
    {
      extension: "Datadog CI",
      vendor: "Datadog",
      teams: 58,
      approach: "A1" as VendorApproach,
      note: "GitHub Actions integration ships out of the box.",
    },
    {
      extension: "PagerDuty",
      vendor: "PagerDuty",
      teams: 47,
      approach: "A1" as VendorApproach,
      note: "GitHub-native incident integration.",
    },
    {
      extension: "ServiceNow DevOps",
      vendor: "ServiceNow",
      teams: 31,
      approach: "A4" as VendorApproach,
      note: "Custom webhook glue needed; no first-party GitHub bridge.",
    },
    {
      extension: "Veracode",
      vendor: "Veracode",
      teams: 28,
      approach: "A1" as VendorApproach,
      note: "GitHub-native scanning available.",
    },
    {
      extension: "Black Duck",
      vendor: "Synopsys",
      teams: 22,
      approach: "A2" as VendorApproach,
      note: "Many teams substituting for GitHub-native Dependabot.",
    },
    {
      extension: "Mend (WhiteSource)",
      vendor: "Mend",
      teams: 19,
      approach: "A2" as VendorApproach,
      note: "Same — Dependabot covers most use cases.",
    },
  ],
  actionSignal:
    "Top 3 vendors (Slack, SonarCloud, Snyk) sit on 50%+ of teams each. Negotiate enterprise GitHub-side licenses for these as a single program-wide deal — cheaper and faster than 142 teams re-procuring individually. Black Duck and Mend overlap with GitHub-native Dependabot — worth a program-level decision on whether to consolidate.",
};

const INSIGHT_PIPELINES = {
  totalPipelines: 2341,
  classicPipelines: 983,
  yamlPipelines: 1358,
  // Where the classic-pipeline burden concentrates by cohort.
  // teams = number of teams in cohort, classic = classic pipelines they own.
  cohortClassic: [
    { cohort: "Echo", teams: 13, classic: 318 },
    { cohort: "Foxtrot", teams: 7, classic: 200 },
    { cohort: "Bravo", teams: 47, classic: 178 },
    { cohort: "Charlie", teams: 24, classic: 132 },
    { cohort: "Alpha", teams: 32, classic: 95 },
    { cohort: "Delta", teams: 19, classic: 60 },
  ],
  actionSignal:
    "Pipelines stay in ADO under the hybrid — nothing here needs to move for the GitHub migration. The cleanup story is per-team rate, not absolute count: Echo (~24 classic per team) and Foxtrot (~29 per team) run 6×+ the rate of healthier cohorts like Bravo (~4/team). Together those two cohorts hold 53% of the program's Classic pipelines despite being only 14% of the teams. If the program invests in a separate ADO-internal cleanup (converting Classic to YAML), Echo and Foxtrot are where the work lives. The payoff: pipelines become version-controlled and peer-reviewed in PRs, audits get easier, and any future phase that does move CI/CD to GitHub Actions starts from a far easier base.",
};

const INSIGHT_TESTPLANS = {
  // Of the 115 features in scope program-wide, this many depend on entities
  // E35–E43 in the framework (ADO Test Plans). The dependency splits into two
  // halves: automated test workflows (movable to GitHub Actions) vs manual
  // workflows (no GitHub equivalent — anchored to ADO under the hybrid).
  dependentFeaturesOfFramework: 24,
  featuresAutomatedPortion: 11, // movable to GitHub Actions
  featuresManualPortion: 13, // anchored — exploratory, manual UAT, shared steps
  totalFeaturesInScope: 115,
  teamsAnyDependent: 92,
  teamsManualAnchored: 71, // have manual-test workflows that can't translate
  teamsAutomatedOnly: 21, // dependency is purely automated runs — could move
  teamsDeeplyDependent: 18, // ≥ 5 dependent features AND mostly manual
  // Cohort-level dependency: pct = % of teams in that cohort with at least
  // one Test-Plans-dependent feature. anchorMix flags whether the cohort's
  // dependency is mostly manual ("anchored") or mostly automated ("movable").
  cohorts: [
    { cohort: "Foxtrot", teams: 7, pctDependent: 100, anchored: true },
    { cohort: "Echo", teams: 13, pctDependent: 92, anchored: true },
    { cohort: "Charlie", teams: 24, pctDependent: 79, anchored: true },
    { cohort: "Bravo", teams: 47, pctDependent: 68, anchored: false },
    { cohort: "Alpha", teams: 32, pctDependent: 41, anchored: false },
    { cohort: "Delta", teams: 19, pctDependent: 26, anchored: false },
  ],
  actionSignal:
    "Foxtrot, Echo, and Charlie cohorts are anchored to ADO Test Plans by their manual workflows (exploratory sessions, regulated UAT, traceability) — plan their hybrid runtime as multi-year. Bravo, Alpha, and Delta are mostly automated; their teams could move Test Plans dependency to GitHub Actions if they choose.",
};

const INSIGHT_IDENTITY = {
  totalConnections: 1847,
  oidcFederated: 1037,
  patBased: 810,
  // Where the manual rotation work concentrates (top cohorts by PAT count).
  // teams = number of teams in the cohort, pats = PAT-based connections.
  patConcentration: [
    { cohort: "Echo", teams: 13, pats: 397 },
    { cohort: "Bravo", teams: 47, pats: 220 },
    { cohort: "Charlie", teams: 24, pats: 89 },
    { cohort: "Foxtrot", teams: 7, pats: 51 },
    { cohort: "Alpha", teams: 32, pats: 38 },
    { cohort: "Delta", teams: 19, pats: 15 },
  ],
  actionSignal:
    "Echo holds 49% of all PAT rotations and runs at ~30 per team — 4× the program-wide average — because its regulated workflows hard-code static credentials. Foxtrot's QA tooling pushes its per-team rate above average too. Bravo's 27% absolute share looks high, but at ~5 PATs per team it's actually below program average — a sign of operational maturity, not migration risk. Focus the OIDC ramp on Echo and Foxtrot pre-cutover.",
};

const INSIGHT_REPOS = {
  reposTotal: 1847,
  totalSizeGb: 412,
  lfsSizeGb: 187,
  specialHandlingRepos: 18,
  topology: {
    // Style = how a team organizes its code.
    polyrepoTeams: 134, // many small repos per team
    monorepoTeams: 8, // one big repo holding many projects
    monorepoCodeSharePct: 32, // % of all code by size that lives in those monorepos
  },
  languages: [
    { label: "TypeScript / JavaScript", teams: 47 },
    { label: "Python", teams: 38 },
    { label: "C# / .NET", teams: 29 },
    { label: "Java", teams: 14 },
    { label: "Go", teams: 8 },
    { label: "Swift / Kotlin (mobile)", teams: 6 },
  ],
  actionSignal:
    "Echo's monorepo (~14 GB, heavy on Git LFS) will be the slowest cutover. Schedule its window first and give it extra slack.",
};

const INSIGHT_COVERAGE = {
  totalJtbds: 118,
  thresholdPctOfTeams: 5,
  commonlyPerformed: 101,
  rarelyPerformed: 12,
  unused: 5,
  rarelyPerformedJobs: [
    { code: "J42", label: "Cross-team package promotion" },
    { code: "J55", label: "Manual security signoff" },
    { code: "J71", label: "Custom dashboard authoring" },
    { code: "J78", label: "Path-scoped permission gating" },
    { code: "J89", label: "Universal package publishing" },
    { code: "J93", label: "Wiki-based change auditing" },
  ],
  unusedJobs: [
    { code: "J19", label: "Manual UAT signoff" },
    { code: "J34", label: "ADO portal admin tooling" },
    { code: "J52", label: "Release notes auto-generation" },
    { code: "J61", label: "Compliance attestation gates" },
    { code: "J67", label: "Cross-org branch sharing" },
  ],
};

type LeverageRow = {
  feature: string;
  teams: number;
  approach: "move" | "stay" | "gap";
};

const INSIGHT_LEVERAGE: {
  highLeverage: LeverageRow[];
  niche: LeverageRow[];
} = {
  highLeverage: [
    { feature: "Branch protection rules", teams: 142, approach: "move" },
    { feature: "Pull request workflow", teams: 142, approach: "move" },
    { feature: "Commit / push", teams: 142, approach: "move" },
    { feature: "Required reviewers", teams: 138, approach: "move" },
    { feature: "Service connections", teams: 134, approach: "stay" },
    { feature: "Sprint planning", teams: 129, approach: "stay" },
    { feature: "Release gates", teams: 116, approach: "stay" },
  ],
  niche: [
    { feature: "Path-scoped permissions", teams: 4, approach: "gap" },
    { feature: "Manual exploratory testing", teams: 3, approach: "stay" },
    { feature: "Custom build agents (GPU)", teams: 2, approach: "stay" },
    { feature: "Universal package feed", teams: 2, approach: "stay" },
    { feature: "Custom widget plugins", teams: 2, approach: "stay" },
    { feature: "Test impact analysis", teams: 1, approach: "gap" },
  ],
};

export function KeyInsights() {
  return (
    <section className="space-y-3">
      <ArchetypePanel />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DiscoveryPanel />
        <CategoryPanel />
      </div>
      <CoveragePanel />
      <LeveragePanel />
      <RepoFootprintPanel />
      <IdentityPanel />
      <PipelinesPanel />
      <TestPlansPanel />
      <CustomizationOverlapPanel />
      <VendorOverlapPanel />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* §11 — Cohort archetype                                                     */
/* -------------------------------------------------------------------------- */

function ArchetypePanel() {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Cohort archetypes
      </div>
      <div className="mb-3 text-[12px] leading-[1.55] text-ink-muted">
        The{" "}
        <strong className="font-semibold text-ink-soft">
          {ARCHETYPE_TOTAL_TEAMS}
        </strong>{" "}
        scanned teams are pre-grouped into{" "}
        <strong className="font-semibold text-ink-soft">6 cohorts</strong>{" "}
        (Alpha–Foxtrot) by the program — typically by engineering domain (web,
        mobile, data, infra, payments, QA), tech stack, and target migration
        wave. For each cohort, the agent classifies every team&apos;s hybrid
        posture and surfaces the dominant pattern below. <em>Match</em> = share
        of teams in the cohort that landed as that dominant posture.
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <ArchTh>Cohort</ArchTh>
            <ArchTh>Profile</ArchTh>
            <ArchTh className="text-right">Teams</ArchTh>
            <ArchTh>Dominant posture</ArchTh>
            <ArchTh>Most common strategy</ArchTh>
            <ArchTh>Most common parity</ArchTh>
          </tr>
        </thead>
        <tbody>
          {INSIGHT_ARCHETYPE.map((row) => {
            const tone =
              row.postureMatch >= 75
                ? ("ok" as const)
                : row.postureMatch >= 50
                  ? ("warn" as const)
                  : ("danger" as const);
            return (
              <tr
                key={row.cohort}
                className="border-b border-border-soft/60 last:border-b-0"
              >
                <td className="px-3 py-2 font-semibold text-ink">
                  {row.cohort}
                </td>
                <td className="px-3 py-2 italic text-ink-soft">
                  {row.tagline}
                </td>
                <td className="px-3 py-2 text-right font-mono text-[12px] text-ink-soft">
                  {row.teamsScanned}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Chip tone={tone}>{row.posture}</Chip>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {row.postureMatch}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-ink-soft">{row.strategy}</td>
                <td className="px-3 py-2 text-ink-soft">{row.parity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ArchTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-border bg-bg-subtle px-3 py-2 text-left font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/* §10 — Discovery state                                                      */
/* -------------------------------------------------------------------------- */

function DiscoveryPanel() {
  const { total, auto, needsInput, anomalies, staleTeams, concentration } =
    INSIGHT_DISCOVERY;
  const autoPct = Math.round((auto / total) * 100);
  const needsPct = Math.round((needsInput / total) * 100);
  const anomPct = Math.round((anomalies / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Discovery state
      </div>
      <div className="mb-4 text-[12px] text-ink-muted">
        How trustworthy the program&apos;s inventory is right now.
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <MiniStat
          label="Auto-confirmed"
          value={auto}
          pct={autoPct}
          tone="success"
        />
        <MiniStat
          label="Needs input"
          value={needsInput}
          pct={needsPct}
          tone="warn"
        />
        <MiniStat
          label="Anomalies"
          value={anomalies}
          pct={anomPct}
          tone="danger"
        />
      </div>

      <div className="mb-3 flex h-[22px] overflow-hidden rounded-md border border-border">
        <div
          className="flex items-center bg-success pl-2 text-[10.5px] font-semibold text-white"
          style={{ width: `${autoPct}%` }}
        >
          {autoPct}%
        </div>
        <div
          className="flex items-center bg-warn pl-2 text-[10.5px] font-semibold text-white"
          style={{ width: `${needsPct}%` }}
        >
          {needsPct}%
        </div>
        <div
          className="flex items-center bg-danger pl-2 text-[10.5px] font-semibold text-white"
          style={{ width: `${anomPct}%` }}
        >
          {anomPct}%
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-dashed border-border pt-3 text-[11.5px] text-ink-soft">
        <span>
          <strong className="font-semibold text-ink">{total}</strong> findings
          total
        </span>
        <span>
          <strong className="font-semibold text-ink">{staleTeams}</strong>{" "}
          inventories &gt; 14 days stale
        </span>
      </div>
      <div className="mt-2 text-[12px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Concentration:</strong>{" "}
        {concentration}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: "success" | "warn" | "danger";
}) {
  const accent =
    tone === "success"
      ? "border-t-success"
      : tone === "warn"
        ? "border-t-warn"
        : "border-t-danger";
  const labelColor =
    tone === "success"
      ? "text-success-ink"
      : tone === "warn"
        ? "text-warn-ink"
        : "text-danger-ink";
  return (
    <div
      className={`rounded-md border border-border bg-bg p-3 border-t-[3px] ${accent}`}
    >
      <div
        className={`mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] ${labelColor}`}
      >
        {label}
      </div>
      <div className="text-[20px] font-bold leading-none tracking-[-0.02em] text-ink">
        {value}{" "}
        <span className="text-[11px] font-medium text-ink-muted">· {pct}%</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §9 — Customization category mix                                            */
/* -------------------------------------------------------------------------- */

function CategoryPanel() {
  const total = INSIGHT_CATEGORIES.reduce((n, r) => n + r.count, 0);
  const max = Math.max(...INSIGHT_CATEGORIES.map((r) => r.count));
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Customization category mix
      </div>
      <div className="mb-4 text-[12px] text-ink-muted">
        Where the program&apos;s {total.toLocaleString()} customization
        instances cluster — across 78 unique types.
      </div>

      <div className="space-y-1">
        {INSIGHT_CATEGORIES.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[110px_1fr_90px] items-center gap-3 py-1 text-[12.5px]"
          >
            <div className="font-medium text-ink">{row.label}</div>
            <div className="h-[16px] overflow-hidden rounded-sm bg-bg-subtle">
              <div
                className="h-full rounded-sm bg-primary"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
            <div className="text-right font-mono text-[11.5px] text-ink-soft">
              <strong className="font-semibold text-ink">{row.count}</strong>
              <span className="ml-1.5 text-[10.5px] text-ink-muted">
                · {row.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-dashed border-border pt-3 text-[12px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Read:</strong> Pipelines (45)
        + Boards (36) = 57% of customizations sit on surfaces the hybrid already
        preserves.
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §08 — JTBD coverage gaps                                                   */
/* -------------------------------------------------------------------------- */

function CoveragePanel() {
  const {
    totalJtbds,
    thresholdPctOfTeams,
    commonlyPerformed,
    rarelyPerformed,
    unused,
    rarelyPerformedJobs,
    unusedJobs,
  } = INSIGHT_COVERAGE;
  const commonPct = Math.round((commonlyPerformed / totalJtbds) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        JTBD coverage gaps
      </div>
      <div className="mb-4 text-[12px] text-ink-muted">
        Of {totalJtbds} framework JTBDs, how widely each is actually performed
        across the program. <em>Commonly performed</em> = ≥{" "}
        {thresholdPctOfTeams}% of teams. The rest are long-tail — candidates to
        deprioritize in tooling, training, and forecasting.
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <CoverageTier
          tone="success"
          count={commonlyPerformed}
          label="Commonly performed"
          sub={`≥ ${thresholdPctOfTeams}% of teams · ${commonPct}% of framework`}
        />
        <CoverageTier
          tone="warn"
          count={rarelyPerformed}
          label="Rarely performed"
          sub={`< ${thresholdPctOfTeams}% of teams · long-tail`}
        />
        <CoverageTier
          tone="muted"
          count={unused}
          label="Never performed"
          sub="0 teams · skip in tooling"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CoverageList
          label="Rarely-performed jobs"
          sub="Used by < 5% of teams. Likely deprioritize."
          jobs={rarelyPerformedJobs}
        />
        <CoverageList
          label="Never-performed jobs"
          sub="No team in the program does these. Skip."
          jobs={unusedJobs}
        />
      </div>
    </div>
  );
}

function CoverageTier({
  tone,
  count,
  label,
  sub,
}: {
  tone: "success" | "warn" | "muted";
  count: number;
  label: string;
  sub: string;
}) {
  const accent =
    tone === "success"
      ? "border-t-success"
      : tone === "warn"
        ? "border-t-warn"
        : "border-t-ink-faint";
  const labelColor =
    tone === "success"
      ? "text-success-ink"
      : tone === "warn"
        ? "text-warn-ink"
        : "text-ink-muted";
  return (
    <div
      className={`rounded-md border border-border bg-bg p-3 border-t-[3px] ${accent}`}
    >
      <div
        className={`mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] ${labelColor}`}
      >
        {label}
      </div>
      <div className="text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">
        {count}
      </div>
      <div className="mt-1 text-[11.5px] leading-tight text-ink-muted">
        {sub}
      </div>
    </div>
  );
}

function CoverageList({
  label,
  sub,
  jobs,
}: {
  label: string;
  sub: string;
  jobs: Array<{ code: string; label: string }>;
}) {
  return (
    <div>
      <div className="mb-1 text-[12.5px] font-semibold text-ink">{label}</div>
      <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
        {sub}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {jobs.map((j) => (
          <span
            key={j.code}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-subtle px-2 py-[3px] text-[11.5px] text-ink-soft"
          >
            <span className="font-mono text-[10px] font-semibold text-ink-muted">
              {j.code}
            </span>
            <span>{j.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §12 — Shared-feature heatmap (high-leverage vs niche)                      */
/* -------------------------------------------------------------------------- */

function LeveragePanel() {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Feature leverage
      </div>
      <div className="mb-4 text-[12px] text-ink-muted">
        Where solving once benefits many — versus niche features that affect
        only a handful of teams.
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeverageTable
          label="High-leverage features"
          sub="Used by ≥ 75% of teams. Move these well and most of the program benefits at once."
          rows={INSIGHT_LEVERAGE.highLeverage}
        />
        <LeverageTable
          label="Niche features"
          sub="Used by ≤ 5% of teams. Low leverage — solve case-by-case if at all."
          rows={INSIGHT_LEVERAGE.niche}
        />
      </div>
    </div>
  );
}

function LeverageTable({
  label,
  sub,
  rows,
}: {
  label: string;
  sub: string;
  rows: LeverageRow[];
}) {
  return (
    <div>
      <div className="mb-1 text-[12.5px] font-semibold text-ink">{label}</div>
      <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
        {sub}
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <ArchTh>Feature</ArchTh>
            <ArchTh>Approach</ArchTh>
            <ArchTh className="text-right">% of teams</ArchTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct = Math.round((row.teams / ARCHETYPE_TOTAL_TEAMS) * 100);
            return (
              <tr
                key={row.feature}
                className="border-b border-border-soft/60 last:border-b-0"
              >
                <td className="px-3 py-2 font-medium text-ink">
                  {row.feature}
                </td>
                <td className="px-3 py-2">
                  <ApproachChip approach={row.approach} />
                </td>
                <td className="px-3 py-2 text-right font-mono text-[12px] text-ink-soft">
                  {pct < 1 ? "<1%" : `${pct}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ApproachChip({ approach }: { approach: "move" | "stay" | "gap" }) {
  if (approach === "move") return <Chip tone="ok">Move</Chip>;
  if (approach === "stay") return <Chip tone="warn">Stay (hybrid)</Chip>;
  return <Chip tone="danger">Gap</Chip>;
}

/* -------------------------------------------------------------------------- */
/* §06 — Program-wide identity surface                                        */
/* -------------------------------------------------------------------------- */

function IdentityPanel() {
  const {
    totalConnections,
    oidcFederated,
    patBased,
    patConcentration,
    actionSignal,
  } = INSIGHT_IDENTITY;
  const oidcPct = Math.round((oidcFederated / totalConnections) * 100);
  const patPct = Math.round((patBased / totalConnections) * 100);

  // Top 2 cohorts by PAT count for the concentration bar headline.
  const topPats = [...patConcentration].sort((a, b) => b.pats - a.pats);
  const top2Sum = topPats[0]!.pats + topPats[1]!.pats;
  const top2Pct = Math.round((top2Sum / patBased) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Identity surface
      </div>
      <div className="mb-4 text-[12px] leading-[1.55] text-ink-muted">
        How many <em>service connections</em> the program has — saved logins a
        team&apos;s pipelines (automated build/deploy jobs) use to reach
        external systems like Azure, AWS, and package registries. Each
        connection uses one of two authentication methods, and only one of them
        transfers to GitHub without manual work.
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <RepoStat
          label="Service connections"
          value={totalConnections.toLocaleString()}
          sub="saved logins pipelines use to reach Azure, AWS, package registries, etc. · across all 142 teams"
        />
        <IdentityStat
          tone="success"
          label="OIDC federated"
          value={`${oidcFederated.toLocaleString()} · ${oidcPct}%`}
          sub={
            <>
              <em>OpenID Connect federation</em> — GitHub and the target system
              trust each other directly. No tokens to copy; transfers cleanly at
              cutover.
            </>
          }
        />
        <IdentityStat
          tone="warn"
          label="PAT-based (manual rotation)"
          value={`${patBased.toLocaleString()} · ${patPct}%`}
          sub={
            <>
              <em>Personal Access Tokens</em> — static credentials, like
              passwords. Every one must be manually re-issued in GitHub at
              cutover before pipelines can authenticate.
            </>
          }
        />
      </div>

      <div>
        <div className="mb-1 text-[12.5px] font-semibold text-ink">
          Where the rotation work concentrates
        </div>
        <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
          Two cohorts own <strong>{top2Pct}%</strong> of the{" "}
          {patBased.toLocaleString()} PAT-based connections — these are the
          teams whose engineers will have the most token-by-token rotation work
          to do during the cutover window.
        </div>
        <div className="space-y-1">
          {topPats.map((row, i) => {
            const pct = Math.round((row.pats / patBased) * 100);
            const isTop = i < 2;
            return (
              <div
                key={row.cohort}
                className="grid grid-cols-[160px_1fr_120px] items-center gap-3 py-1 text-[12.5px]"
              >
                <div className="flex items-baseline gap-2">
                  <strong className="font-semibold text-ink">
                    {row.cohort}
                  </strong>
                  <span className="font-mono text-[10.5px] text-ink-muted">
                    ({row.teams} teams)
                  </span>
                </div>
                <div className="h-[14px] overflow-hidden rounded-sm bg-bg-subtle">
                  <div
                    className={`h-full rounded-sm ${isTop ? "bg-warn" : "bg-bg-muted"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-right font-mono text-[11.5px] text-ink-soft">
                  <strong className="font-semibold text-ink">{pct}%</strong>{" "}
                  <span className="text-[10.5px] text-ink-muted">
                    · {row.pats} PATs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-soft bg-bg p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Recommendation:</strong>{" "}
        {actionSignal}
      </div>
    </div>
  );
}

function IdentityStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  tone: "success" | "warn";
}) {
  const accent = tone === "success" ? "border-t-success" : "border-t-warn";
  const labelColor = tone === "success" ? "text-success-ink" : "text-warn-ink";
  return (
    <div
      className={`rounded-md border border-border bg-bg p-3 border-t-[3px] ${accent}`}
    >
      <div
        className={`mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] ${labelColor}`}
      >
        {label}
      </div>
      <div className="text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">
        {value}
      </div>
      <div className="mt-1 text-[11.5px] leading-tight text-ink-muted">
        {sub}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §02 — Customization overlap across teams (S06 candidates)                  */
/* -------------------------------------------------------------------------- */

const STRATEGY_TONE: Record<
  CustomizationStrategy,
  "ok" | "warn" | "danger" | "neutral"
> = {
  S01: "neutral",
  S02: "ok",
  S03: "neutral",
  S04: "warn",
  S05: "danger",
  S06: "ok",
};

function CustomizationOverlapPanel() {
  const { highOverlapThresholdPct, topOverlap, actionSignal } =
    INSIGHT_CUSTOMIZATIONS;

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Customization overlap across teams
      </div>
      <div className="mb-2 text-[12px] leading-[1.55] text-ink-muted">
        After scanning all 142 teams, the inventory agent groups customizations
        by what they do and surfaces the patterns that appear across the most
        teams. When the same customization shows up in many teams, the program
        has a chance to{" "}
        <strong className="font-semibold text-ink-soft">
          build the migration once centrally and let every team adopt the shared
          pattern
        </strong>
        .
      </div>
      <div className="mb-4 text-[11.5px] leading-[1.55] text-ink-muted">
        Strategies: <strong className="text-ink-soft">S01 Protect</strong>{" "}
        (preserve as-is in ADO),{" "}
        <strong className="text-ink-soft">S02 Translate</strong> (1:1 mapping to
        a GitHub equivalent),{" "}
        <strong className="text-ink-soft">S04 Substitute</strong> (swap to a
        GitHub-native feature), and{" "}
        <strong className="text-ink-soft">S05 Build glue</strong> (no equivalent
        exists — write custom code).
      </div>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <ArchTh>Code</ArchTh>
            <ArchTh>Customization</ArchTh>
            <ArchTh className="text-right">% of teams</ArchTh>
            <ArchTh className="text-right">Teams</ArchTh>
            <ArchTh>Strategy</ArchTh>
            <ArchTh>Recommendation</ArchTh>
          </tr>
        </thead>
        <tbody>
          {topOverlap.map((row) => {
            const pct = Math.round((row.teams / 142) * 100);
            const tone = STRATEGY_TONE[row.strategy];
            return (
              <tr
                key={row.code}
                className="border-b border-border-soft/60 last:border-b-0"
              >
                <td className="px-3 py-2 font-mono text-[11.5px] font-semibold text-primary">
                  {row.code}
                </td>
                <td className="px-3 py-2 font-medium text-ink">{row.name}</td>
                <td className="px-3 py-2 text-right font-mono text-[12px] text-ink-soft">
                  {pct}%
                </td>
                <td className="px-3 py-2 text-right font-mono text-[11.5px] text-ink-muted">
                  {row.teams}
                </td>
                <td className="px-3 py-2">
                  <Chip tone={tone === "neutral" ? "ok" : tone}>
                    {row.strategy} · {row.strategyLabel}
                  </Chip>
                </td>
                <td className="px-3 py-2 text-[11.5px] italic text-ink-muted">
                  {row.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 rounded-lg border border-border-soft bg-bg p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Recommendation:</strong>{" "}
        {actionSignal}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §03 — Extension & vendor overlap (S07 candidates)                          */
/* -------------------------------------------------------------------------- */

const APPROACH_META: Record<
  VendorApproach,
  { label: string; tone: "ok" | "warn" | "danger"; explainer: string }
> = {
  A1: {
    label: "Re-setup",
    tone: "ok",
    explainer: "same vendor, just re-authorize on GitHub side",
  },
  A2: {
    label: "Substitute",
    tone: "warn",
    explainer: "swap for a GitHub-native equivalent",
  },
  A3: {
    label: "Work around",
    tone: "warn",
    explainer: "GitHub-side integration is thinner — accept the gap",
  },
  A4: {
    label: "Build glue",
    tone: "danger",
    explainer: "custom code/webhook needed; no first-party GitHub support",
  },
  A5: {
    label: "Accept loss",
    tone: "danger",
    explainer: "no equivalent — the capability goes away",
  },
  A6: {
    label: "Request roadmap",
    tone: "warn",
    explainer: "vendor doesn't support GitHub yet — escalate",
  },
};

function VendorOverlapPanel() {
  const {
    totalUniqueVendors,
    highOverlapThresholdPct,
    highOverlapCount,
    singleOrRareCount,
    topVendors,
    actionSignal,
  } = INSIGHT_VENDORS;

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Extension &amp; vendor overlap
      </div>
      <div className="mb-4 text-[12px] leading-[1.55] text-ink-muted">
        Where the program has <em>vendor leverage</em>. Extensions are
        third-party add-ons teams install in ADO to extend its functionality
        (security scanners, observability, chat, project sync). When many teams
        rely on the same vendor, the program can negotiate a single enterprise
        contract on GitHub instead of 142 teams re-procuring individually —
        cheaper, faster, and a chance to standardize migration approach across
        teams. Each row&apos;s <em>migration approach</em> is the
        framework&apos;s playbook for what happens to that vendor when its teams
        move to GitHub.
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <RepoStat
          label="Unique vendors / extensions"
          value={String(totalUniqueVendors)}
          sub="across all 142 teams · third-party add-ons installed in ADO"
        />
        <IdentityStat
          tone="success"
          label="High-overlap (consolidation candidates)"
          value={String(highOverlapCount)}
          sub={`used by ≥ ${highOverlapThresholdPct}% of teams · cross-team leverage on enterprise contracts and migration support`}
        />
        <IdentityStat
          tone="warn"
          label="Single-team or rare"
          value={String(singleOrRareCount)}
          sub="used by < 5% of teams · low leverage; case-by-case migration call"
        />
      </div>

      <div>
        <div className="mb-1 text-[12.5px] font-semibold text-ink">
          Top vendors by team usage
        </div>
        <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
          Approaches: <strong className="text-success-ink">A1 Re-setup</strong>{" "}
          (same vendor, just re-authorize),{" "}
          <strong className="text-warn-ink">A2 Substitute</strong> (swap to
          GitHub-native),{" "}
          <strong className="text-warn-ink">A3 Work around</strong> (thinner
          GitHub support),{" "}
          <strong className="text-danger-ink">A4 Build glue</strong> (custom
          code).
        </div>
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <ArchTh>Extension</ArchTh>
              <ArchTh>Vendor</ArchTh>
              <ArchTh className="text-right">% of teams</ArchTh>
              <ArchTh className="text-right">Teams</ArchTh>
              <ArchTh>Approach</ArchTh>
              <ArchTh>Why</ArchTh>
            </tr>
          </thead>
          <tbody>
            {topVendors.map((row) => {
              const pct = Math.round((row.teams / 142) * 100);
              const meta = APPROACH_META[row.approach];
              return (
                <tr
                  key={row.extension}
                  className="border-b border-border-soft/60 last:border-b-0"
                >
                  <td className="px-3 py-2 font-semibold text-ink">
                    {row.extension}
                  </td>
                  <td className="px-3 py-2 text-ink-soft">{row.vendor}</td>
                  <td className="px-3 py-2 text-right font-mono text-[12px] text-ink-soft">
                    {pct}%
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[11.5px] text-ink-muted">
                    {row.teams}
                  </td>
                  <td className="px-3 py-2">
                    <Chip tone={meta.tone}>
                      {row.approach} · {meta.label}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-[11.5px] italic text-ink-muted">
                    {row.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-border-soft bg-bg p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Recommendation:</strong>{" "}
        {actionSignal}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §07 — Program-wide repo footprint                                          */
/* -------------------------------------------------------------------------- */

function RepoFootprintPanel() {
  const {
    reposTotal,
    totalSizeGb,
    lfsSizeGb,
    specialHandlingRepos,
    topology,
    languages,
    actionSignal,
  } = INSIGHT_REPOS;
  const polyPct = Math.round(
    (topology.polyrepoTeams /
      (topology.polyrepoTeams + topology.monorepoTeams)) *
      100,
  );
  const monoPct = 100 - polyPct;

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Repo footprint
      </div>
      <div className="mb-4 text-[12px] text-ink-muted">
        How much code the program has to migrate, and which teams need extra
        time at cutover. Repos are individual code projects; the migration tool
        copies one at a time.
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <RepoStat
          label="Repos"
          value={reposTotal.toLocaleString()}
          sub="individual code projects across all 142 teams"
        />
        <RepoStat
          label="Total code size"
          value={`${totalSizeGb} GB`}
          sub={
            <>
              incl. <strong>{lfsSizeGb} GB</strong> in Git LFS — a tool teams
              use to store large binary files (ML models, game assets, big
              images) alongside code
            </>
          }
        />
        <RepoStat
          tone="warn"
          label="Repos needing extra time"
          value={String(specialHandlingRepos)}
          sub="oversized or LFS-heavy repos · longer cutover windows"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* TOPOLOGY */}
        <div>
          <div className="mb-1 text-[12.5px] font-semibold text-ink">
            How teams organize their code
          </div>
          <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
            Most teams split their code across many small repos — easy to copy
            independently. A few teams keep everything in one giant repo, which
            takes longer.
          </div>
          <div className="mb-2 flex h-[22px] overflow-hidden rounded-md border border-border">
            <div
              className="flex items-center bg-success pl-2 text-[10.5px] font-semibold text-white"
              style={{ width: `${polyPct}%` }}
            >
              {polyPct}%
            </div>
            <div
              className="flex items-center bg-warn pl-2 text-[10.5px] font-semibold text-white"
              style={{ width: `${monoPct}%` }}
            >
              {monoPct}%
            </div>
          </div>
          <div className="space-y-1.5 text-[12px] text-ink-soft">
            <div className="flex items-baseline gap-2">
              <span className="h-2.5 w-2.5 flex-shrink-0 translate-y-[1px] rounded-sm bg-success" />
              <span>
                <strong className="font-semibold text-ink">Polyrepo</strong>{" "}
                <span className="text-ink-muted">
                  (many small repos per team — easier, faster):
                </span>{" "}
                <strong className="font-semibold text-ink">
                  {topology.polyrepoTeams}
                </strong>{" "}
                teams
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="h-2.5 w-2.5 flex-shrink-0 translate-y-[1px] rounded-sm bg-warn" />
              <span>
                <strong className="font-semibold text-ink">Monorepo</strong>{" "}
                <span className="text-ink-muted">
                  (one giant repo holding many projects — slower, harder to
                  split):
                </span>{" "}
                <strong className="font-semibold text-ink">
                  {topology.monorepoTeams}
                </strong>{" "}
                teams
              </span>
            </div>
          </div>
          <div className="mt-3 rounded-md border border-warn-soft bg-warn-soft px-3 py-2 text-[11.5px] leading-[1.5] text-warn-ink">
            Even though only{" "}
            <strong className="font-semibold">
              {topology.monorepoTeams} of 142 teams
            </strong>{" "}
            use monorepos, those repos hold roughly{" "}
            <strong className="font-semibold">
              {topology.monorepoCodeSharePct}% of all the code by size
            </strong>{" "}
            — they&apos;re the long pole at cutover.
          </div>
        </div>

        {/* LANGUAGES */}
        <div>
          <div className="mb-1 text-[12.5px] font-semibold text-ink">
            What the code is written in
          </div>
          <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
            Counts of teams per primary language. Affects which build tooling
            and security scanners need to be set up on GitHub.
          </div>
          <div className="space-y-1">
            {languages.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto_50px] items-center gap-3 py-1 text-[12.5px]"
              >
                <div className="font-medium text-ink">{row.label}</div>
                <div className="font-mono text-[11px] text-ink-muted">
                  {row.teams} teams
                </div>
                <div className="h-[8px] overflow-hidden rounded-sm bg-bg-subtle">
                  <div
                    className="h-full rounded-sm bg-primary"
                    style={{
                      width: `${Math.round((row.teams / Math.max(...languages.map((l) => l.teams))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-soft bg-bg p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Recommendation:</strong>{" "}
        {actionSignal}
      </div>
    </div>
  );
}

function RepoStat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  tone?: "default" | "warn";
}) {
  const accent = tone === "warn" ? "border-t-warn" : "border-t-primary";
  const labelColor = tone === "warn" ? "text-warn-ink" : "text-primary";
  return (
    <div
      className={`rounded-md border border-border bg-bg p-3 border-t-[3px] ${accent}`}
    >
      <div
        className={`mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] ${labelColor}`}
      >
        {label}
      </div>
      <div className="text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">
        {value}
      </div>
      <div className="mt-1 text-[11.5px] leading-tight text-ink-muted">
        {sub}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §04 — Program-wide pipeline composition                                    */
/* -------------------------------------------------------------------------- */

function PipelinesPanel() {
  const {
    totalPipelines,
    classicPipelines,
    yamlPipelines,
    cohortClassic,
    actionSignal,
  } = INSIGHT_PIPELINES;
  const classicPct = Math.round((classicPipelines / totalPipelines) * 100);
  const yamlPct = Math.round((yamlPipelines / totalPipelines) * 100);

  // Sort cohorts by share of classic pipelines descending for the bar
  const sortedCohorts = [...cohortClassic].sort(
    (a, b) => b.classic - a.classic,
  );
  const top2 = sortedCohorts[0]!.classic + sortedCohorts[1]!.classic;
  const top2Pct = Math.round((top2 / classicPipelines) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Pipeline composition
      </div>
      <div className="mb-4 text-[12px] leading-[1.55] text-ink-muted">
        How the program&apos;s <em>pipelines</em> — the automated build, test,
        and deploy scripts that run on every commit — are split between the two
        flavors ADO supports.{" "}
        <strong className="font-semibold text-ink-soft">
          Pipelines stay in ADO under the hybrid model
        </strong>
        , so this isn&apos;t about migrating to GitHub. It surfaces an optional,
        separate cleanup project that runs <em>inside ADO</em>: converting older{" "}
        <em>classic pipelines</em> (configured in a drag-and-drop UI, hard to
        version-control or audit) into <em>YAML pipelines</em> (text files in
        the repo, peer-reviewed in PRs, easier to maintain — and far easier to
        translate later if a future phase ever moves CI/CD to GitHub Actions).
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <RepoStat
          label="Pipelines"
          value={totalPipelines.toLocaleString()}
          sub="automated build/test/deploy scripts across all 142 teams"
        />
        <IdentityStat
          tone="warn"
          label="Classic (UI-configured)"
          value={`${classicPct}%`}
          sub={
            <>
              <strong>{classicPipelines.toLocaleString()}</strong> of{" "}
              {totalPipelines.toLocaleString()} pipelines · drag-and-drop UI
              configuration · harder to version-control, harder to migrate if a
              future phase moves CI/CD to GitHub Actions
            </>
          }
        />
        <IdentityStat
          tone="success"
          label="YAML (code-as-config)"
          value={`${yamlPct}%`}
          sub={
            <>
              <strong>{yamlPipelines.toLocaleString()}</strong> of{" "}
              {totalPipelines.toLocaleString()} pipelines · defined as text in
              the repo · portable, version-controlled, easier to maintain
            </>
          }
        />
      </div>

      <div>
        <div className="mb-1 text-[12.5px] font-semibold text-ink">
          Where the classic-pipeline estate concentrates
        </div>
        <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
          Two cohorts own <strong>{top2Pct}%</strong> of the{" "}
          {classicPipelines.toLocaleString()} Classic pipelines. If the program
          decides to convert them to YAML (an ADO-internal cleanup), or ever
          moves CI/CD to GitHub Actions in a later phase, these are the cohorts
          where most of the work would land.
        </div>
        <div className="space-y-1">
          {sortedCohorts.map((row, i) => {
            const pct = Math.round((row.classic / classicPipelines) * 100);
            const isTop = i < 2;
            return (
              <div
                key={row.cohort}
                className="grid grid-cols-[160px_1fr_120px] items-center gap-3 py-1 text-[12.5px]"
              >
                <div className="flex items-baseline gap-2">
                  <strong className="font-semibold text-ink">
                    {row.cohort}
                  </strong>
                  <span className="font-mono text-[10.5px] text-ink-muted">
                    ({row.teams} teams)
                  </span>
                </div>
                <div className="h-[14px] overflow-hidden rounded-sm bg-bg-subtle">
                  <div
                    className={`h-full rounded-sm ${isTop ? "bg-warn" : "bg-bg-muted"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-right font-mono text-[11.5px] text-ink-soft">
                  <strong className="font-semibold text-ink">{pct}%</strong>{" "}
                  <span className="text-[10.5px] text-ink-muted">
                    · {row.classic} classic
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-soft bg-bg p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Recommendation:</strong>{" "}
        {actionSignal}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* §05 — Test Plans dependency                                                */
/* -------------------------------------------------------------------------- */

function TestPlansPanel() {
  const {
    dependentFeaturesOfFramework,
    featuresAutomatedPortion,
    featuresManualPortion,
    totalFeaturesInScope,
    teamsAnyDependent,
    teamsManualAnchored,
    teamsAutomatedOnly,
    cohorts,
    actionSignal,
  } = INSIGHT_TESTPLANS;
  const featurePct = Math.round(
    (dependentFeaturesOfFramework / totalFeaturesInScope) * 100,
  );
  const anyTeamPct = Math.round((teamsAnyDependent / 142) * 100);
  const anchoredPct = Math.round(
    (teamsManualAnchored / teamsAnyDependent) * 100,
  );
  const movablePct = Math.round((teamsAutomatedOnly / teamsAnyDependent) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        Test Plans dependency
      </div>
      <div className="mb-4 text-[12px] leading-[1.55] text-ink-muted">
        How much of the program depends on <em>ADO Test Plans</em> — the
        built-in QA tool teams use to author test cases, run them, track
        pass/fail, and tie results back to work items. The dependency splits
        into two halves:{" "}
        <strong className="font-semibold text-ink-soft">automated tests</strong>{" "}
        (these <em>can</em> move to GitHub Actions cleanly — matrix runs +
        Checks API replicate the workflow), and{" "}
        <strong className="font-semibold text-ink-soft">
          manual workflows
        </strong>{" "}
        — manual test cases, exploratory sessions, shared steps, traceability.{" "}
        <strong className="font-semibold text-ink-soft">
          The manual half has no GitHub equivalent
        </strong>{" "}
        and is what actually anchors a team to the hybrid model.
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <RepoStat
          label="Test-Plans-dependent features"
          value={`${featurePct}%`}
          sub={
            <>
              <strong>{dependentFeaturesOfFramework}</strong> of{" "}
              {totalFeaturesInScope} features in scope ·{" "}
              <strong>{featuresAutomatedPortion}</strong> automated (movable),{" "}
              <strong>{featuresManualPortion}</strong> manual (no GitHub
              equivalent)
            </>
          }
        />
        <IdentityStat
          tone="warn"
          label="Anchored teams (manual workflows)"
          value={`${anchoredPct}%`}
          sub={
            <>
              <strong>{teamsManualAnchored}</strong> of the {teamsAnyDependent}{" "}
              teams that touch Test Plans · these have manual test cases,
              exploratory sessions, or compliance-grade traceability that GitHub
              can&apos;t replace
            </>
          }
        />
        <IdentityStat
          tone="success"
          label="Movable teams (automated only)"
          value={`${movablePct}%`}
          sub={
            <>
              <strong>{teamsAutomatedOnly}</strong> of the {teamsAnyDependent}{" "}
              teams that touch Test Plans · dependency is purely automated test
              runs, could move to GitHub Actions
            </>
          }
        />
      </div>

      <div>
        <div className="mb-1 text-[12.5px] font-semibold text-ink">
          Where the dependency concentrates
        </div>
        <div className="mb-3 text-[11.5px] leading-[1.45] text-ink-muted">
          Per-cohort: % of teams that touch Test Plans. The{" "}
          <span className="font-semibold text-warn-ink">amber-flagged</span>{" "}
          cohorts are <strong>manual-anchored</strong> — their dependency is
          mostly manual workflows, so even at low team-count percentages those
          teams stay in the hybrid. The other cohorts are mostly automated and
          could shift to GitHub Actions.
        </div>
        <div className="space-y-1">
          {cohorts.map((row) => (
            <div
              key={row.cohort}
              className="grid grid-cols-[110px_1fr_140px] items-center gap-3 py-1 text-[12.5px]"
            >
              <div className="flex items-baseline gap-2 font-medium text-ink">
                <span>{row.cohort}</span>
                <span className="font-mono text-[10.5px] text-ink-muted">
                  ({row.teams} teams)
                </span>
              </div>
              <div className="h-[16px] overflow-hidden rounded-sm bg-bg-subtle">
                <div
                  className={`h-full rounded-sm ${
                    row.anchored ? "bg-warn" : "bg-success"
                  }`}
                  style={{ width: `${row.pctDependent}%` }}
                />
              </div>
              <div className="flex items-baseline justify-end gap-2 text-right">
                <span className="font-mono text-[11.5px] text-ink-soft">
                  <strong className="font-semibold text-ink">
                    {row.pctDependent}%
                  </strong>
                </span>
                <span
                  className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] ${
                    row.anchored ? "text-warn-ink" : "text-success-ink"
                  }`}
                >
                  {row.anchored ? "Anchored" : "Movable"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-soft bg-bg p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        <strong className="font-semibold text-ink">Recommendation:</strong>{" "}
        {actionSignal}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared chip                                                                */
/* -------------------------------------------------------------------------- */

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ok" | "warn" | "danger";
}) {
  const cls =
    tone === "ok"
      ? "bg-success-soft text-success-ink"
      : tone === "warn"
        ? "bg-warn-soft text-warn-ink"
        : "bg-danger-soft text-danger-ink";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[1px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] ${cls}`}
    >
      {children}
    </span>
  );
}
