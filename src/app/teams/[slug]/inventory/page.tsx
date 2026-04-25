import Link from "next/link";
import { notFound } from "next/navigation";
import { InventoryCoverage } from "@/components/inventory/InventoryCoverage";
import { InventoryProfile } from "@/components/inventory/InventoryProfile";
import { getTeamInventory, totalEntitiesInFramework } from "@/server/inventory";

export const dynamic = "force-dynamic";

type TabKey = "profile" | "coverage";

export default async function TeamInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: TabKey = tabParam === "coverage" ? "coverage" : "profile";

  const inventory = await getTeamInventory(slug);
  if (!inventory) notFound();

  const { team, totals, groups, coverage } = inventory;

  return (
    <div className="w-full space-y-6 px-[32px] py-[28px]">
      <header className="space-y-2">
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Team profile · <span className="text-primary">{team.name}</span>
        </div>
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
          Migration inventory
        </h1>
        <p className="max-w-[760px] text-[13.5px] leading-[1.55] text-ink-soft">
          The framework taxonomy this team actually touches. JTBDs are the work
          your team does; features are the platform capabilities those jobs
          depend on; entities are the underlying data objects. Use{" "}
          <strong className="text-ink">Profile</strong> to drill in, or{" "}
          <strong className="text-ink">Coverage</strong> to see the M:N picture.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1">
          <Tab href={`/teams/${slug}/inventory`} active={tab === "profile"}>
            Profile
          </Tab>
          <Tab
            href={`/teams/${slug}/inventory?tab=coverage`}
            active={tab === "coverage"}
          >
            Coverage matrix
          </Tab>
        </nav>
      </div>

      {tab === "profile" ? (
        <InventoryProfile groups={groups} />
      ) : (
        <InventoryCoverage coverage={coverage} />
      )}
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

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-4 py-[10px] text-[13.5px] font-medium tracking-[-0.005em] transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
