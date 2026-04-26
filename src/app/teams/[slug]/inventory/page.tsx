import { notFound } from "next/navigation";
import { InventoryProfile } from "@/components/inventory/InventoryProfile";
import { getTeamInventory, totalEntitiesInFramework } from "@/server/inventory";

export const dynamic = "force-dynamic";

export default async function TeamInventoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const inventory = await getTeamInventory(slug);
  if (!inventory) notFound();

  const { team, totals, groups, coverage, customizations } = inventory;

  const constrained = "w-full max-w-[1200px] pl-[64px] pr-[32px]";

  return (
    <div className="space-y-6 py-[28px]">
      <header className={`${constrained} space-y-2`}>
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Team profile · <span className="text-primary">{team.name}</span>
        </div>
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
          Migration inventory
        </h1>
        <p className="max-w-[760px] text-[13.5px] leading-[1.55] text-ink-soft">
          The framework taxonomy this team actually touches. JTBDs are the work
          your team does; features are the platform capabilities those jobs
          depend on; entities are the underlying data objects.
        </p>
      </header>

      <div className={`${constrained} grid grid-cols-2 gap-3 sm:grid-cols-4`}>
        <Stat
          label="JTBDs in scope"
          value={totals.jtbdsInScope}
          sub={`of ${totals.jtbdsTotal} in framework`}
        />
        <Stat
          label="Features touched"
          value={totals.featuresInScope}
          sub={`${totals.sharedFeatures} shared (M:N)`}
        />
        <Stat
          label="Entities touched"
          value={totals.entitiesInScope}
          sub={`of ${totalEntitiesInFramework()} · ${totals.sharedEntities} shared`}
        />
        <Stat
          label="Orphan features"
          value={coverage.orphanFeatures.length}
          sub="in framework, not in scope"
        />
      </div>

      <div className="min-w-[1720px] pl-[64px] pr-[32px]">
        <InventoryProfile groups={groups} customizations={customizations} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated px-4 py-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-ink">
        {value}
      </div>
      <div className="text-[11px] text-ink-muted">{sub}</div>
    </div>
  );
}
