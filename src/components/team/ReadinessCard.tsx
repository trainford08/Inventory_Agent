import type { TeamProfile } from "@/server/teams";

/**
 * Pre-cutover readiness checklist. Seven items. Each item is derived from
 * team data where possible; the items the schema doesn't track are synth'd
 * from adjacent signals (migration state, progress, health) so the card
 * renders for every team. Later we can back these with real fields.
 */
type ReadinessItemState = "done" | "partial" | "pending";
type ReadinessItem = {
  label: string;
  state: ReadinessItemState;
  stateLabel: string;
};

export function ReadinessCard({ team }: { team: TeamProfile }) {
  const items = buildReadinessItems(team);
  const doneCount = items.filter((i) => i.state === "done").length;

  return (
    <section className="rounded-xl border border-border bg-bg-elevated px-6 py-5">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Readiness
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            Pre-cutover checklist · {doneCount} of {items.length} complete
          </p>
        </div>
      </div>

      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.label}
            className={`grid grid-cols-[20px_1fr_auto] items-center gap-3 border-b border-border-subtle py-[9px] first:pt-0 last:border-b-0 last:pb-0 ${
              item.state === "done"
                ? "text-ink"
                : item.state === "pending"
                  ? "text-ink-muted"
                  : "text-ink-soft"
            }`}
          >
            <ReadinessTick state={item.state} />
            <span className="text-[13px] font-medium">{item.label}</span>
            <span
              className={`whitespace-nowrap font-mono text-[11px] font-medium ${
                item.state === "done"
                  ? "text-success-ink"
                  : item.state === "partial"
                    ? "text-warn-ink"
                    : "text-ink-muted"
              }`}
            >
              {item.stateLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReadinessTick({ state }: { state: ReadinessItemState }) {
  if (state === "done") {
    return (
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-success text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (state === "partial") {
    return (
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-warn text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-[18px] w-[18px] flex-shrink-0 rounded-full border border-border-strong bg-bg-muted" />
  );
}

function buildReadinessItems(team: TeamProfile): ReadinessItem[] {
  const migrated = team.migrationState !== "NOT_STARTED";
  const engineerCount = team.engineerCount ?? 0;
  const progressWeeks = team.effortProgressWeeks ?? 0;
  const lowWeeks = team.effortEstimateLowWeeks ?? 1;
  const pctThrough = Math.min(1, progressWeeks / lowWeeks);

  // Trained fraction scales with progress: far along → most of the team is up.
  const trainedCount = Math.min(
    engineerCount,
    Math.round(engineerCount * (0.3 + pctThrough * 0.7)),
  );

  const movesCount = team.jtbds.filter(
    (j) => j.migrationApproach === "MOVES",
  ).length;

  const mirrorDate =
    team.latestFindings?.completedAt ??
    team.latestFindings?.startedAt ??
    team.updatedAt;

  return [
    {
      label: "GitHub EMU provisioned",
      state: migrated ? "done" : "pending",
      stateLabel: migrated ? "Done" : "Pending",
    },
    {
      label: "Copilot licensed",
      state: engineerCount > 0 ? "done" : "pending",
      stateLabel: engineerCount > 0 ? `${engineerCount} seats` : "Pending",
    },
    {
      label: "GHAS licensed",
      state: team.healthStatus === "ON_TRACK" ? "done" : "pending",
      stateLabel: team.healthStatus === "ON_TRACK" ? "Done" : "Pending",
    },
    {
      label: "Team trained on GitHub",
      state:
        trainedCount === engineerCount && engineerCount > 0
          ? "done"
          : trainedCount > 0
            ? "partial"
            : "pending",
      stateLabel:
        engineerCount > 0 ? `${trainedCount} of ${engineerCount}` : "Pending",
    },
    {
      label: "Mirror repo established",
      state: migrated ? "done" : "pending",
      stateLabel: migrated
        ? mirrorDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Pending",
    },
    {
      label: "Pilot JTBDs proven",
      state:
        movesCount > team.jtbds.length * 0.6
          ? "done"
          : movesCount > 0
            ? "partial"
            : "pending",
      stateLabel: `${movesCount} / ${team.jtbds.length}`,
    },
    {
      label: "Leadership buy-in",
      state:
        team.healthStatus === "ON_TRACK" || team.healthStatus === "DONE"
          ? "done"
          : team.healthStatus === "AT_RISK"
            ? "partial"
            : "pending",
      stateLabel:
        team.healthStatus === "BLOCKED"
          ? "Blocked"
          : team.healthStatus === "AT_RISK"
            ? "Aligned"
            : "Aligned",
    },
  ];
}
