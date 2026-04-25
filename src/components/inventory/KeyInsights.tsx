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
    verdict: { label: "Confirmed", tone: "ok" as const },
  },
  {
    cohort: "Bravo",
    tagline: "The typical healthy team",
    teamsScanned: 47,
    postureMatch: 38,
    posture: "Mixed",
    strategy: "S01 Protect (44%)",
    parity: "Partial (38%)",
    verdict: { label: "Worse than expected", tone: "warn" as const },
  },
  {
    cohort: "Charlie",
    tagline: "The interesting one",
    teamsScanned: 24,
    postureMatch: 79,
    posture: "Easy mover",
    strategy: "S02 Translate (48%)",
    parity: "Match (61%)",
    verdict: { label: "Easier than expected", tone: "warn" as const },
  },
  {
    cohort: "Delta",
    tagline: "The heavyweight",
    teamsScanned: 19,
    postureMatch: 72,
    posture: "Mixed",
    strategy: "S02 Translate (55%)",
    parity: "Match (58%)",
    verdict: { label: "Easier than expected", tone: "ok" as const },
  },
  {
    cohort: "Echo",
    tagline: "The Champion still has work",
    teamsScanned: 13,
    postureMatch: 85,
    posture: "Deep hybrid",
    strategy: "S05 Build glue (28%)",
    parity: "Gap (22%)",
    verdict: { label: "Confirmed (deeply)", tone: "danger" as const },
  },
  {
    cohort: "Foxtrot",
    tagline: "The edge case",
    teamsScanned: 7,
    postureMatch: 43,
    posture: "Mixed",
    strategy: "S01 Protect (38%)",
    parity: "Partial (33%)",
    verdict: { label: "No clear archetype", tone: "warn" as const },
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

export function KeyInsights() {
  return (
    <section className="space-y-3">
      <ArchetypePanel />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DiscoveryPanel />
        <CategoryPanel />
      </div>
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
      <div className="mb-3 text-[12px] text-ink-muted">
        Did discovery confirm each cohort&apos;s archetype across the{" "}
        <strong className="font-semibold text-ink-soft">
          {ARCHETYPE_TOTAL_TEAMS}
        </strong>{" "}
        teams scanned? <em>Posture match</em> = % of teams in the cohort that
        landed as the expected posture.
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <ArchTh>Cohort</ArchTh>
            <ArchTh>Tagline (assumed)</ArchTh>
            <ArchTh className="text-right">Teams</ArchTh>
            <ArchTh>Posture match</ArchTh>
            <ArchTh>Most common strategy</ArchTh>
            <ArchTh>Most common parity</ArchTh>
            <ArchTh>Confirms?</ArchTh>
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
                <td className="px-3 py-2">
                  <Chip tone={row.verdict.tone}>{row.verdict.label}</Chip>
                </td>
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
