import Link from "next/link";
import type { HealthStatus } from "@/generated/prisma/enums";
import { phaseSnapshot } from "@/lib/phase";
import type { TeamListItem } from "@/server/teams";

const GRID = "grid grid-cols-[2.2fr_0.6fr_1.2fr_0.9fr_0.7fr_0.9fr_0.9fr] gap-3";

export function TeamsTable({ teams }: { teams: TeamListItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
      <div
        className={`${GRID} border-b border-border bg-bg-subtle px-[18px] py-[10px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted`}
      >
        <div>Team</div>
        <div>Wave</div>
        <div>Phase</div>
        <div>Health</div>
        <div>Blockers</div>
        <div>Reviewed</div>
        <div>Cutover</div>
      </div>
      {teams.map((t, i) => (
        <TeamRow key={t.id} team={t} isLast={i === teams.length - 1} />
      ))}
    </div>
  );
}

function TeamRow({ team, isLast }: { team: TeamListItem; isLast: boolean }) {
  const phase = phaseSnapshot(team.migrationState);
  return (
    <Link
      href={`/teams/${team.slug}`}
      className={`${GRID} items-center px-[18px] py-[14px] transition-colors hover:bg-bg-subtle ${
        isLast ? "" : "border-b border-border-subtle"
      }`}
    >
      <TeamCell
        name={team.name}
        slug={team.slug}
        cohort={team.cohort}
        tagline={team.tagline}
      />
      <WaveCell wave={team.wave} />
      <PhaseCell
        label={phase.currentStep}
        percent={phase.currentStepPercent}
        overall={phase.overallPercent}
      />
      <HealthCell status={team.healthStatus} />
      <BlockersCell count={team.openBlockerCount} />
      <ReviewedCell percent={team.completionPercent} />
      <CutoverCell
        targetCutoverAt={team.targetCutoverAt}
        slackWeeks={team.slackWeeks}
      />
    </Link>
  );
}

function ReviewedCell({ percent }: { percent: number }) {
  const barColor =
    percent >= 80
      ? "bg-success"
      : percent >= 40
        ? "bg-primary"
        : percent > 0
          ? "bg-warn"
          : "bg-bg-muted";
  return (
    <div className="min-w-0">
      <div className="mb-[5px] font-mono text-[11px] text-ink-soft">
        {percent}%
      </div>
      <div className="h-1 overflow-hidden rounded-sm bg-bg-muted">
        <div
          className={`h-full rounded-sm ${barColor}`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
    </div>
  );
}

function TeamCell({
  name,
  slug,
  cohort,
  tagline,
}: {
  name: string;
  slug: string;
  cohort: string;
  tagline: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <TeamDot slug={slug} />
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-ink">
          {name}
        </div>
        {tagline ? (
          <div className="truncate text-[12px] italic text-ink-muted">
            {tagline}
          </div>
        ) : null}
        <div className="truncate font-mono text-[10.5px] text-ink-faint">
          {cohort}
        </div>
      </div>
    </div>
  );
}

const DOT_GRADIENTS: Record<string, string> = {
  alpha: "from-emerald-400 to-teal-500",
  bravo: "from-blue-400 to-indigo-500",
  charlie: "from-amber-400 to-orange-500",
  delta: "from-violet-400 to-purple-500",
  echo: "from-rose-400 to-pink-500",
  foxtrot: "from-slate-400 to-slate-600",
};

function TeamDot({ slug }: { slug: string }) {
  const gradient = DOT_GRADIENTS[slug] ?? "from-slate-400 to-slate-600";
  return (
    <span
      className={`inline-block h-[28px] w-[28px] flex-shrink-0 rounded-full bg-gradient-to-br ${gradient} shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`}
    />
  );
}

function WaveCell({ wave }: { wave: number | null }) {
  if (wave === null) {
    return <span className="font-mono text-[11px] text-ink-faint">—</span>;
  }
  return (
    <span className="inline-flex w-fit items-center rounded bg-bg-subtle px-2 py-0.5 font-mono text-[11px] font-semibold tracking-[0.02em] text-ink-soft">
      W{String(wave).padStart(2, "0")}
    </span>
  );
}

function PhaseCell({
  label,
  percent,
  overall,
}: {
  label: string;
  percent: number;
  overall: number;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-[5px] flex items-baseline justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-ink-soft">
          {label}
        </span>
        <span className="font-mono text-[10.5px] text-ink-muted">
          {overall}%
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-sm bg-bg-muted">
        <div
          className="h-full rounded-sm bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const HEALTH_META: Record<HealthStatus, { label: string; classes: string }> = {
  ON_TRACK: {
    label: "On track",
    classes: "bg-success-soft text-success-ink",
  },
  AT_RISK: {
    label: "At risk",
    classes: "bg-warn-soft text-warn-ink",
  },
  BLOCKED: {
    label: "Blocked",
    classes: "bg-danger-soft text-danger-ink",
  },
  DONE: {
    label: "Done",
    classes: "bg-bg-subtle text-ink-muted",
  },
};

function HealthCell({ status }: { status: HealthStatus | null }) {
  if (status === null) {
    return <span className="font-mono text-[11px] text-ink-faint">—</span>;
  }
  const meta = HEALTH_META[status];
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-[9px] py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.03em] ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

function BlockersCell({ count }: { count: number }) {
  if (count === 0) {
    return <span className="font-mono text-[11px] text-ink-faint">0</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold text-danger-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-danger" />
      {count}
    </span>
  );
}

function CutoverCell({
  targetCutoverAt,
  slackWeeks,
}: {
  targetCutoverAt: Date | null;
  slackWeeks: number | null;
}) {
  if (targetCutoverAt === null) {
    return <span className="font-mono text-[11px] text-ink-faint">—</span>;
  }
  const formatted = targetCutoverAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const slackLabel =
    slackWeeks === null
      ? null
      : slackWeeks === 0
        ? "on track"
        : slackWeeks > 0
          ? `+${slackWeeks}w slack`
          : `${slackWeeks}w behind`;
  const slackColor =
    slackWeeks === null
      ? ""
      : slackWeeks < 0
        ? "text-warn-ink"
        : "text-ink-muted";
  return (
    <div className="min-w-0">
      <div className="truncate text-[12.5px] text-ink-soft">{formatted}</div>
      {slackLabel ? (
        <div className={`font-mono text-[10.5px] ${slackColor}`}>
          {slackLabel}
        </div>
      ) : null}
    </div>
  );
}
