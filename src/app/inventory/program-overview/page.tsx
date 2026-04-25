import { AdaInventoryChat } from "@/components/inventory/AdaInventoryChat";
import { KeyInsights } from "@/components/inventory/KeyInsights";

export const dynamic = "force-dynamic";

// Illustrative program-level rollups, sized for ~142 teams scanned across
// 6 cohorts. Replace with computed values once the customization catalog and
// feature inventory are seeded across all cohorts.
const TEAMS_SCANNED = 142;
const COHORTS_SCANNED = 6;
const AVG_FEATURES_PER_TEAM = 38;

const ROLLUP = {
  // "Commonly performed" = ≥ 5% of teams (≈ 7 of 142). Long-tail jobs are
  // surfaced in the Coverage panel breakdown, not counted here.
  jobsCovered: 101,
  jobsTotal: 118,
  featuresInScope: 115,
  customizations: 2788,
  customizationTypes: 78,
  customizationsNeedingDecisionTypes: 14,
  vendors: 58,
  vendorsNoEquivalent: 9,
  hybrid: { gh: 62, ado: 34, both: 12, na: 7 },
  friction: {
    // Counts are # of unique customization types (decision surface),
    // with instance counts in the detail strings.
    customizationTypesNoEquivalent: 8,
    customizationTypesNoEquivalentInstances: 142,
    integrationsResetup: 18,
    integrationsResetupVendors: "Jira, Datadog, Snyk, Okta SCIM",
    highCustomizationTeams: 27,
  },
  parity: { match: 71, better: 19, partial: 17, gap: 8 },
  // Customization types categorized by strategy (sums to 78 unique types).
  // Instance distribution lives in the panel sub-line.
  approach: { s01: 12, s02: 26, s03: 8, s04: 10, s05: 12, s06: 5, s07: 5 },
};

export default async function InventoryProgramOverviewPage() {
  const totalFeatures =
    ROLLUP.hybrid.gh +
    ROLLUP.hybrid.ado +
    ROLLUP.hybrid.both +
    ROLLUP.hybrid.na;
  const pct = (n: number) => Math.round((n / totalFeatures) * 100);
  const totalParity =
    ROLLUP.parity.match +
    ROLLUP.parity.better +
    ROLLUP.parity.partial +
    ROLLUP.parity.gap;
  const parityPct = (n: number) => Math.round((n / totalParity) * 100);
  const totalCustom =
    ROLLUP.approach.s01 +
    ROLLUP.approach.s02 +
    ROLLUP.approach.s03 +
    ROLLUP.approach.s04 +
    ROLLUP.approach.s05;
  const approachPct = (n: number) => Math.round((n / totalCustom) * 100);

  return (
    <div className="grid min-h-full grid-cols-[1fr_380px] bg-bg">
      <div className="min-w-0 overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1500px] px-[32px] py-[28px]">
          {/* HERO */}
          <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
            Program · Inventory
          </div>
          <h1 className="mb-3 text-[30px] font-bold leading-[1.1] tracking-[-0.025em] text-ink">
            Overview
          </h1>
          <p className="mb-4 max-w-[720px] text-[16px] leading-[1.55] text-ink-soft">
            What every team does on Azure DevOps, mapped onto GitHub. Use this
            page to gauge the overall complexity of the program before drilling
            into a single team.
          </p>
          <div className="mb-7" />

          {/* BIG NUMBERS */}
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-bg-elevated md:grid-cols-5">
            <Stat
              label="Teams"
              value={String(TEAMS_SCANNED)}
              sub={
                <>
                  across <strong>{COHORTS_SCANNED} cohorts</strong>
                </>
              }
            />
            <Stat
              label="Jobs commonly performed"
              value={
                <>
                  {ROLLUP.jobsCovered}{" "}
                  <span className="text-[14px] font-medium text-ink-muted">
                    / {ROLLUP.jobsTotal}
                  </span>
                </>
              }
              sub={
                <>
                  <strong>
                    {Math.round((ROLLUP.jobsCovered / ROLLUP.jobsTotal) * 100)}%
                  </strong>{" "}
                  of framework · ≥ 5% of teams
                </>
              }
            />
            <Stat
              label="Features in scope"
              value={String(ROLLUP.featuresInScope)}
              sub={
                <>
                  avg <strong>{AVG_FEATURES_PER_TEAM}</strong> per team
                </>
              }
            />
            <Stat
              label="Customizations"
              value={
                <>
                  {ROLLUP.customizationTypes}{" "}
                  <span className="text-[14px] font-medium text-ink-muted">
                    unique types
                  </span>
                </>
              }
              sub={
                <>
                  <strong>{ROLLUP.customizationsNeedingDecisionTypes}</strong>{" "}
                  need decisions · {ROLLUP.customizations.toLocaleString()}{" "}
                  instances
                </>
              }
            />
            <Stat
              label="Integrations"
              value={
                <>
                  {ROLLUP.vendors}{" "}
                  <span className="text-[14px] font-medium text-ink-muted">
                    vendors
                  </span>
                </>
              }
              sub={
                <>
                  <strong>{ROLLUP.vendorsNoEquivalent}</strong> with no GitHub
                  equivalent
                </>
              }
            />
          </div>

          {/* INSIGHTS: hybrid mix + friction */}
          <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel
              title="Where the work lives"
              sub={`Across all ${ROLLUP.featuresInScope} features, how many move to GitHub vs. stay in ADO.`}
            >
              <div className="mb-3 flex h-7 overflow-hidden rounded-md border border-border">
                <HybridSeg
                  cls="bg-primary"
                  pct={pct(ROLLUP.hybrid.gh)}
                  label={`${pct(ROLLUP.hybrid.gh)}%`}
                />
                <HybridSeg
                  cls="bg-warn"
                  pct={pct(ROLLUP.hybrid.ado)}
                  label={`${pct(ROLLUP.hybrid.ado)}%`}
                />
                <HybridSeg
                  cls="bg-success"
                  pct={pct(ROLLUP.hybrid.both)}
                  label={`${pct(ROLLUP.hybrid.both)}%`}
                />
                <HybridSeg
                  cls="bg-ink-muted"
                  pct={pct(ROLLUP.hybrid.na)}
                  label={`${pct(ROLLUP.hybrid.na)}%`}
                />
              </div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
                <LegendRow
                  swatchClass="bg-primary"
                  name="Lives in GitHub"
                  count={ROLLUP.hybrid.gh}
                />
                <LegendRow
                  swatchClass="bg-warn"
                  name="Stays in ADO"
                  count={ROLLUP.hybrid.ado}
                />
                <LegendRow
                  swatchClass="bg-success"
                  name="Spans both"
                  count={ROLLUP.hybrid.both}
                />
                <LegendRow
                  swatchClass="bg-ink-muted"
                  name="Platform-agnostic"
                  count={ROLLUP.hybrid.na}
                />
              </div>
            </Panel>

            <Panel
              title="Where the friction is"
              sub="Items that need explicit decisions before any cutover."
            >
              <div className="flex flex-col gap-2.5">
                <FrictionRow
                  tone="danger"
                  icon="!"
                  num={ROLLUP.friction.customizationTypesNoEquivalent}
                  title="Customization types with no GitHub equivalent"
                  detail={`${ROLLUP.friction.customizationTypesNoEquivalentInstances} instances across ${TEAMS_SCANNED} teams — likely hybrid candidates`}
                />
                <FrictionRow
                  tone="warn"
                  icon="~"
                  num={ROLLUP.friction.integrationsResetup}
                  title="Integrations needing re-setup"
                  detail={`${ROLLUP.friction.integrationsResetupVendors} — re-auth at cutover`}
                />
                <FrictionRow
                  tone="info"
                  icon="i"
                  num={ROLLUP.friction.highCustomizationTeams}
                  title="Teams with high customization load"
                  detail="20+ instances each, mostly in Bravo & Echo cohorts"
                />
              </div>
            </Panel>
          </div>

          {/* PARITY DISTRIBUTION */}
          <div className="mt-7 rounded-xl border border-border bg-bg-elevated p-6">
            <div className="mb-1 text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
              GitHub parity across all features in scope
            </div>
            <div className="mb-4 text-[12.5px] text-ink-muted">
              How cleanly the {ROLLUP.featuresInScope} features in scope land on
              GitHub today.
            </div>

            <ParityRow
              label="Match"
              fill="bg-success"
              pct={parityPct(ROLLUP.parity.match)}
              count={ROLLUP.parity.match}
            />
            <ParityRow
              label="Better"
              fill="bg-primary"
              pct={parityPct(ROLLUP.parity.better)}
              count={ROLLUP.parity.better}
            />
            <ParityRow
              label="Partial"
              fill="bg-warn"
              pct={parityPct(ROLLUP.parity.partial)}
              count={ROLLUP.parity.partial}
            />
            <ParityRow
              label="Gap"
              fill="bg-danger"
              pct={parityPct(ROLLUP.parity.gap)}
              count={ROLLUP.parity.gap}
            />
          </div>

          {/* MIGRATION APPROACH MIX */}
          <div className="mt-4 rounded-xl border border-border bg-bg-elevated p-6">
            <div className="mb-1 text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
              Migration approach mix
            </div>
            <div className="mb-4 text-[12.5px] text-ink-muted">
              How the {ROLLUP.customizationTypes} unique customization types
              will be handled — the per-type decision determines treatment for
              all {ROLLUP.customizations.toLocaleString()} instances. Drawn from
              the 5 per-customization strategies in the framework.
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              <ApproachCard
                code="S01 · PROTECT"
                codeClass="text-purple-ink"
                borderClass="border-t-purple"
                name="Protect in place"
                count={ROLLUP.approach.s01}
                pct={approachPct(ROLLUP.approach.s01)}
                desc="Stays in ADO via the hybrid. Zero migration effort."
              />
              <ApproachCard
                code="S02 · TRANSLATE"
                codeClass="text-success-ink"
                borderClass="border-t-success"
                name="Translate to GitHub"
                count={ROLLUP.approach.s02}
                pct={approachPct(ROLLUP.approach.s02)}
                desc="Mechanical rebuild against GitHub primitives."
              />
              <ApproachCard
                code="S03 · RETIRE"
                codeClass="text-ink-muted"
                borderClass="border-t-ink-faint"
                name="Retire in discovery"
                count={ROLLUP.approach.s03}
                pct={approachPct(ROLLUP.approach.s03)}
                desc="Fossils. Permission to delete."
              />
              <ApproachCard
                code="S04 · ACCEPT LOSS"
                codeClass="text-warn-ink"
                borderClass="border-t-warn"
                name="Rebuild, thinner"
                count={ROLLUP.approach.s04}
                pct={approachPct(ROLLUP.approach.s04)}
                desc="GitHub equivalent exists but with reduced fidelity."
              />
              <ApproachCard
                code="S05 · BUILD GLUE"
                codeClass="text-danger-ink"
                borderClass="border-t-danger"
                name="Custom code required"
                count={ROLLUP.approach.s05}
                pct={approachPct(ROLLUP.approach.s05)}
                desc="No GitHub equivalent. Most expensive per unit."
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-border pt-3 text-[11.5px] text-ink-muted">
              <strong className="font-semibold text-ink-soft">
                Meta-strategies in play:
              </strong>
              <span>
                {ROLLUP.approach.s06} types are candidates for{" "}
                <strong className="font-semibold text-ink-soft">
                  S06 · Upstream
                </strong>{" "}
                (build once centrally) · {ROLLUP.approach.s07} types are
                candidates for{" "}
                <strong className="font-semibold text-ink-soft">
                  S07 · Consolidate
                </strong>{" "}
                (move to existing third-party like Jira)
              </span>
            </div>
          </div>

          {/* KEY INSIGHTS */}
          <div className="mt-9">
            <KeyInsights />
          </div>
        </div>
      </div>

      <AdaInventoryChat />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
}) {
  return (
    <div className="border-b border-r border-border p-5 last:border-r-0 md:border-b-0">
      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </div>
      <div className="mb-1.5 text-[28px] font-bold leading-none tracking-[-0.03em] text-ink">
        {value}
      </div>
      <div className="text-[12.5px] leading-tight text-ink-muted">{sub}</div>
    </div>
  );
}

function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-6">
      <div className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </div>
      <div className="mb-4 text-[12.5px] text-ink-muted">{sub}</div>
      {children}
    </div>
  );
}

function HybridSeg({
  cls,
  pct,
  label,
}: {
  cls: string;
  pct: number;
  label: string;
}) {
  return (
    <div
      className={`flex items-center pl-2 text-[11.5px] font-semibold text-white ${cls}`}
      style={{ width: `${pct}%` }}
    >
      {pct >= 6 ? label : ""}
    </div>
  );
}

function LegendRow({
  swatchClass,
  name,
  count,
}: {
  swatchClass: string;
  name: string;
  count: number;
}) {
  return (
    <div className="flex items-baseline gap-2 text-[12.5px] text-ink-soft">
      <span
        className={`h-2.5 w-2.5 flex-shrink-0 translate-y-[1px] rounded-sm ${swatchClass}`}
      />
      <span className="font-medium text-ink">{name}</span>
      <span className="ml-auto font-mono font-semibold text-ink">{count}</span>
    </div>
  );
}

function FrictionRow({
  tone,
  icon,
  num,
  title,
  detail,
}: {
  tone: "danger" | "warn" | "info";
  icon: string;
  num: number;
  title: string;
  detail: string;
}) {
  const iconCls =
    tone === "danger"
      ? "bg-danger-soft text-danger-ink"
      : tone === "warn"
        ? "bg-warn-soft text-warn-ink"
        : "bg-primary-soft text-primary";
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border-subtle bg-bg p-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[14px] font-bold ${iconCls}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-[13px] font-semibold leading-tight text-ink">
          {title}
        </div>
        <div className="mt-0.5 text-[11.5px] text-ink-muted">{detail}</div>
      </div>
      <div className="font-mono text-[18px] font-bold tracking-[-0.02em] text-ink">
        {num}
      </div>
    </div>
  );
}

function ParityRow({
  label,
  fill,
  pct,
  count,
}: {
  label: string;
  fill: string;
  pct: number;
  count: number;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr_90px] items-center gap-3.5 py-1.5 text-[13px]">
      <div className="font-medium text-ink">{label}</div>
      <div className="h-[18px] overflow-hidden rounded bg-bg-subtle">
        <div
          className={`h-full rounded ${fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right font-mono text-[12px] text-ink-soft">
        {count} <span className="text-[11px] text-ink-muted">· {pct}%</span>
      </div>
    </div>
  );
}

function ApproachCard({
  code,
  codeClass,
  borderClass,
  name,
  count,
  pct,
  desc,
}: {
  code: string;
  codeClass: string;
  borderClass: string;
  name: string;
  count: number;
  pct: number;
  desc: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-bg p-3.5 border-t-[3px] ${borderClass}`}
    >
      <div
        className={`mb-1 font-mono text-[10px] font-bold tracking-[0.1em] ${codeClass}`}
      >
        {code}
      </div>
      <div className="mb-2 text-[13.5px] font-semibold leading-tight tracking-[-0.005em] text-ink">
        {name}
      </div>
      <div className="mb-1 text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">
        {count}{" "}
        <span className="text-[12px] font-medium text-ink-muted">{pct}%</span>
      </div>
      <div className="text-[11.5px] leading-tight text-ink-muted">{desc}</div>
    </div>
  );
}
