import { KeyInsights } from "@/components/inventory/KeyInsights";
import { computeProgramOverview } from "@/server/program-overview";

export const dynamic = "force-dynamic";

export default async function InventoryProgramOverviewPage() {
  const overview = await computeProgramOverview();
  const TEAMS_SCANNED = overview.teamsScanned;
  const COHORTS_SCANNED = overview.cohortsScanned;
  const AVG_FEATURES_PER_TEAM = overview.avgFeaturesPerTeam;
  const ROLLUP = {
    jobsCovered: overview.jobsCovered,
    jobsTotal: overview.jobsTotal,
    featuresInScope: overview.featuresInScope,
    customizations: overview.customizations.totalInstances,
    customizationTypes: overview.customizations.uniqueTypes,
    customizationsNeedingDecisionTypes:
      overview.customizations.typesNeedingDecision,
    vendors: overview.vendors.total,
    vendorsNoEquivalent: overview.vendors.withoutGitHubEquivalent,
    hybrid: overview.hybridSplit,
    friction: overview.friction,
    parity: overview.parityBreakdown,
    approach: deriveApproachShape(overview.migrationApproach),
  };

  const totalFeatures =
    ROLLUP.hybrid.gh +
    ROLLUP.hybrid.ado +
    ROLLUP.hybrid.both +
    ROLLUP.hybrid.na;
  const pct = (n: number) =>
    totalFeatures ? Math.round((n / totalFeatures) * 100) : 0;
  const totalParity =
    ROLLUP.parity.match +
    ROLLUP.parity.better +
    ROLLUP.parity.partial +
    ROLLUP.parity.gap;
  const parityPct = (n: number) =>
    totalParity ? Math.round((n / totalParity) * 100) : 0;
  const totalCustom =
    ROLLUP.approach.s01 +
    ROLLUP.approach.s02 +
    ROLLUP.approach.s03 +
    ROLLUP.approach.s04 +
    ROLLUP.approach.s05;
  const approachPct = (n: number) =>
    totalCustom ? Math.round((n / totalCustom) * 100) : 0;

  return (
    <>
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
                detail={`${ROLLUP.friction.customizationTypesNoEquivalentInstances} instances across ${TEAMS_SCANNED} teams — concentrated in Echo and Foxtrot, where regulated and QA workflows have the deepest customization`}
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
                detail="20+ instances each — concentrated in Echo and Foxtrot, not the typical-healthy Bravo cohort which sits at the program average"
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

          <div className="mb-4 flex h-7 overflow-hidden rounded-md">
            <ParitySegment
              fill="bg-success"
              pct={parityPct(ROLLUP.parity.match)}
            />
            <ParitySegment
              fill="bg-primary"
              pct={parityPct(ROLLUP.parity.better)}
            />
            <ParitySegment
              fill="bg-warn"
              pct={parityPct(ROLLUP.parity.partial)}
            />
            <ParitySegment
              fill="bg-danger"
              pct={parityPct(ROLLUP.parity.gap)}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <ParityLegendItem
              swatch="bg-success"
              name="Match"
              desc="Direct 1:1 equivalent on GitHub. No behavior change."
              pct={parityPct(ROLLUP.parity.match)}
              count={ROLLUP.parity.match}
            />
            <ParityLegendItem
              swatch="bg-primary"
              name="Better"
              desc="GitHub equivalent is an upgrade — more native or less to maintain."
              pct={parityPct(ROLLUP.parity.better)}
              count={ROLLUP.parity.better}
            />
            <ParityLegendItem
              swatch="bg-warn"
              name="Partial"
              desc="Most of the feature lands; some functionality is lost."
              pct={parityPct(ROLLUP.parity.partial)}
              count={ROLLUP.parity.partial}
            />
            <ParityLegendItem
              swatch="bg-danger"
              name="Gap"
              desc="No GitHub equivalent. Substitute, build glue, or accept the loss."
              pct={parityPct(ROLLUP.parity.gap)}
              count={ROLLUP.parity.gap}
            />
          </div>
        </div>

        {/* MIGRATION APPROACH MIX */}
        <div className="mt-4 rounded-xl border border-border bg-bg-elevated p-6">
          <div className="mb-1 text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
            Migration approach mix
          </div>
          <div className="mb-4 text-[12.5px] text-ink-muted">
            How the {ROLLUP.customizationTypes} unique customization types will
            be handled — the per-type decision determines treatment for all{" "}
            {ROLLUP.customizations.toLocaleString()} instances. Drawn from the 5
            per-customization strategies in the framework.
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
    </>
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

function ParitySegment({ fill, pct }: { fill: string; pct: number }) {
  if (pct <= 0) return null;
  return (
    <div
      className={`flex items-center justify-center font-mono text-[11px] font-semibold text-white ${fill}`}
      style={{ width: `${pct}%` }}
    >
      {pct >= 8 ? `${pct}%` : ""}
    </div>
  );
}

function ParityLegendItem({
  swatch,
  name,
  desc,
  pct,
  count,
}: {
  swatch: string;
  name: string;
  desc: string;
  pct: number;
  count: number;
}) {
  return (
    <div className="grid grid-cols-[14px_1fr_auto] items-baseline gap-x-3">
      <span
        className={`mt-[5px] h-[12px] w-[12px] self-start rounded-sm ${swatch}`}
      />
      <div>
        <div className="text-[13px] font-semibold text-ink">{name}</div>
        <div className="mt-[1px] text-[11.5px] leading-[1.45] text-ink-muted">
          {desc}
        </div>
      </div>
      <div className="text-right">
        <span className="text-[15px] font-bold tracking-[-0.01em] text-ink">
          {pct}%
        </span>
        <span className="ml-1.5 font-mono text-[10.5px] text-ink-muted">
          · {count}
        </span>
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

function deriveApproachShape(byLabel: Record<string, number>): {
  s01: number;
  s02: number;
  s03: number;
  s04: number;
  s05: number;
  s06: number;
  s07: number;
} {
  const get = (prefix: string) => {
    const entry = Object.entries(byLabel).find(([k]) => k.startsWith(prefix));
    return entry ? entry[1] : 0;
  };
  return {
    s01: get("S01"),
    s02: get("S02"),
    s03: get("S03"),
    s04: get("S04"),
    s05: get("S05"),
    s06: get("S06"),
    s07: get("S07"),
  };
}
