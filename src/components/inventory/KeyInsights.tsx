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
    postureMatch: 38,
    posture: "Mixed",
    strategy: "S01 Protect (44%)",
    parity: "Partial (38%)",
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
    postureMatch: 43,
    posture: "Mixed",
    strategy: "S01 Protect (38%)",
    parity: "Partial (33%)",
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
    "Bravo cohort holds 312 of the 1,037 anomalies; 11 teams in that cohort haven't been reviewed in 30+ days — rollups above are most fragile where Bravo lives.",
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
                className="border-b border-border-soft last:border-b-0"
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
                className="border-b border-border-soft last:border-b-0"
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
        <strong className="font-semibold text-ink">What to do:</strong>{" "}
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
