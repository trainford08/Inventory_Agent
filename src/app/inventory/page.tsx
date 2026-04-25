import Link from "next/link";
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

const STATE_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  DISCOVERING: "Discovering",
  REVIEWING: "Reviewing",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ROLLED_BACK: "Rolled back",
  BLOCKED: "Blocked",
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
              <Th className="w-[26%]">Team</Th>
              <Th className="w-[10%]">Cohort</Th>
              <Th className="w-[8%]">Wave</Th>
              <Th className="w-[11%]">State</Th>
              <Th className="w-[11%]">Health</Th>
              <Th className="w-[8%] text-right">Engineers</Th>
              <Th className="w-[9%] text-right">Open risks</Th>
              <Th className="w-[9%] text-right">% reviewed</Th>
              <Th className="w-[8%]">Cutover</Th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
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
                    <span>
                      <span className="font-semibold tracking-[-0.005em] text-ink">
                        {t.name}
                      </span>
                      {t.tagline ? (
                        <span className="ml-2 font-mono text-[11px] text-ink-muted">
                          {t.tagline}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </Td>
                <Td>{COHORT_LABEL[t.cohort] ?? t.cohort}</Td>
                <Td className="text-right font-mono tabular-nums">
                  {t.wave !== null
                    ? `W${String(t.wave).padStart(2, "0")}`
                    : "—"}
                </Td>
                <Td>{STATE_LABEL[t.migrationState] ?? t.migrationState}</Td>
                <Td>
                  <HealthPill status={t.healthStatus} />
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {t.engineerCount ?? "—"}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {t.openBlockerCount}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {t.completionPercent}%
                </Td>
                <Td className="font-mono text-[12px] text-ink-muted">
                  {formatCutover(t.targetCutoverAt)}
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

function HealthPill({ status }: { status: string | null }) {
  if (!status)
    return <span className="font-mono text-[11px] text-ink-faint">—</span>;
  const map: Record<string, { label: string; cls: string }> = {
    ON_TRACK: {
      label: "On track",
      cls: "bg-emerald-100 text-emerald-800",
    },
    AT_RISK: {
      label: "At risk",
      cls: "bg-amber-100 text-amber-800",
    },
    BLOCKED: {
      label: "Blocked",
      cls: "bg-rose-100 text-rose-800",
    },
    DONE: {
      label: "Done",
      cls: "bg-bg-muted text-ink-muted",
    },
  };
  const m = map[status] ?? { label: status, cls: "bg-bg-muted text-ink-muted" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${m.cls}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {m.label}
    </span>
  );
}

function formatCutover(date: Date | null): string {
  if (!date) return "—";
  const days = Math.round(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "today";
  if (days > 0) return `+${days}d`;
  return `${days}d`;
}
