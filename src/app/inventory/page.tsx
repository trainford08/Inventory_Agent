import Link from "next/link";
import { getTeamInventory } from "@/server/inventory";
import { listTeams } from "@/server/teams";

export const dynamic = "force-dynamic";

const COHORT_LABEL: Record<string, string> = {
  ALPHA: "Alpha",
  BRAVO: "Bravo",
  CHARLIE: "Charlie",
  DELTA: "Delta",
  ECHO: "Echo",
  FOXTROT: "Foxtrot",
  UNASSIGNED: "Unassigned",
};

const SWATCH: Record<string, string> = {
  ALPHA: "linear-gradient(135deg,#5b5fcf,#8b5cf6)",
  BRAVO: "linear-gradient(135deg,#06b6d4,#0ea5e9)",
  CHARLIE: "linear-gradient(135deg,#f59e0b,#ef4444)",
  DELTA: "linear-gradient(135deg,#1f4d3a,#3a6b4d)",
  ECHO: "linear-gradient(135deg,#dc2626,#ef4444)",
  FOXTROT: "linear-gradient(135deg,#71717a,#a1a1aa)",
  UNASSIGNED: "linear-gradient(135deg,#a1a1aa,#d4d4d8)",
};

export default async function InventoryLandingPage() {
  const teams = await listTeams();
  const inventories = await Promise.all(
    teams.map(async (t) => ({
      team: t,
      inv: await getTeamInventory(t.slug),
    })),
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-[32px] py-[28px]">
      <header>
        <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Program · Inventory
        </div>
        <h1 className="mb-2 text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
          Team migration inventories
        </h1>
        <p className="max-w-[760px] text-[13.5px] leading-[1.55] text-ink-soft">
          One row per team. Click a team to open its migration inventory — every
          JTBD, feature, and entity in scope, with shared references surfaced.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <Th className="w-[22%]">Team</Th>
              <Th className="w-[9%]">Cohort</Th>
              <Th className="w-[10%] text-right">JTBDs in scope</Th>
              <Th className="w-[10%] text-right">Features touched</Th>
              <Th className="w-[10%] text-right">Entities touched</Th>
              <Th className="w-[10%] text-right">Customizations</Th>
              <Th className="w-[10%] text-right">3rd-party integrations</Th>
              <Th className="w-[9%] text-right">Orphan features</Th>
              <Th className="w-[10%]">{""}</Th>
            </tr>
          </thead>
          <tbody>
            {inventories.map(({ team: t, inv }) => (
              <tr
                key={t.id}
                className="border-b border-border/60 transition-colors hover:bg-bg-muted/60"
              >
                <Td>
                  <Link
                    href={`/teams/${t.slug}/inventory`}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded"
                      style={{
                        background: SWATCH[t.cohort] ?? SWATCH.UNASSIGNED,
                      }}
                    />
                    <span className="flex flex-col">
                      <span className="font-semibold tracking-[-0.005em] text-ink">
                        {t.name}
                      </span>
                      {t.tagline ? (
                        <span className="font-mono text-[11px] text-ink-muted">
                          {t.tagline}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </Td>
                <Td>{COHORT_LABEL[t.cohort] ?? t.cohort}</Td>
                <Td className="text-right font-mono tabular-nums">
                  {inv ? (
                    <>
                      {inv.totals.jtbdsInScope}
                      <span className="ml-1 text-ink-muted">
                        / {inv.totals.jtbdsTotal}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {inv ? (
                    <>
                      {inv.totals.featuresInScope}
                      {inv.totals.sharedFeatures > 0 ? (
                        <span className="ml-1 text-ink-muted">
                          ({inv.totals.sharedFeatures} shared)
                        </span>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {inv ? (
                    <>
                      {inv.totals.entitiesInScope}
                      {inv.totals.sharedEntities > 0 ? (
                        <span className="ml-1 text-ink-muted">
                          ({inv.totals.sharedEntities} shared)
                        </span>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {inv ? inv.customizations.total : "—"}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {dummyIntegrations(t.slug)}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {inv ? inv.coverage.orphanFeatures.length : "—"}
                </Td>
                <Td className="text-right">
                  <Link
                    href={`/teams/${t.slug}/inventory`}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-[8px] text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                  >
                    View inventory →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right font-mono text-[11px] text-ink-muted">
        {teams.length} teams
      </div>
    </div>
  );
}

function dummyIntegrations(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return 3 + (h % 12);
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b-[1.5px] border-border bg-bg-muted px-4 py-[10px] text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-[10px] align-middle ${className ?? ""}`}>
      {children}
    </td>
  );
}
