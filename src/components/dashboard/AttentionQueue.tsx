import Link from "next/link";
import type { ReactNode } from "react";
import type { TriageItem } from "@/server/dashboard";

type QueueTone = "critical" | "handoff" | "high" | "ready";

type QueueItem = {
  tone: QueueTone;
  typeLabel: string;
  age: string;
  headline: string;
  teamName: string;
  teamSlug: string;
  teamSubtitle: string;
  detail: string;
  meta?: string[];
  primaryLabel?: string;
  passive?: boolean;
};

export function AttentionQueue({
  blockers,
  adaHandoffs,
  cutoverSlips,
  readyToAdvance,
}: {
  blockers: { count: number; items: TriageItem[] };
  adaHandoffs: { count: number; items: TriageItem[] };
  cutoverSlips: { count: number; items: TriageItem[] };
  readyToAdvance: { count: number; items: TriageItem[] };
}) {
  const items: QueueItem[] = [
    ...blockers.items.map<QueueItem>((t) => ({
      tone: "critical",
      typeLabel: "Blocker",
      age: t.age === "blocker" ? "open" : "needs review",
      headline: `${t.name} — ${t.subtitle}`,
      teamName: t.name,
      teamSlug: t.slug,
      teamSubtitle: teamSub(t),
      detail:
        "Open risks are preventing this team from advancing. Review mitigations before the next wave gate.",
      primaryLabel: "View team",
    })),
    ...adaHandoffs.items.map<QueueItem>((t) => ({
      tone: "handoff",
      typeLabel: "Ada handoff",
      age: t.age,
      headline: t.subtitle,
      teamName: t.name,
      teamSlug: t.slug,
      teamSubtitle: teamSub(t),
      detail: "Ada gathered evidence but couldn't resolve without human input.",
      primaryLabel: "Resume with Ada",
    })),
    ...cutoverSlips.items.map<QueueItem>((t) => ({
      tone: "high",
      typeLabel: "Schedule slip",
      age: t.age,
      headline: `${t.name} is ${t.subtitle}`,
      teamName: t.name,
      teamSlug: t.slug,
      teamSubtitle: teamSub(t),
      detail:
        "Target cutover is slipping. Downstream teams in the same wave may be affected.",
      primaryLabel: "View team",
    })),
    ...readyToAdvance.items.map<QueueItem>((t) => ({
      tone: "ready",
      typeLabel: "Self-service milestone",
      age: "today",
      headline: `${t.name} is ready to cut over`,
      teamName: t.name,
      teamSlug: t.slug,
      teamSubtitle: teamSub(t),
      detail:
        "Profile complete, no open blockers. Team has auto-advanced to ready.",
      passive: true,
    })),
  ];

  const total =
    blockers.count +
    adaHandoffs.count +
    cutoverSlips.count +
    readyToAdvance.count;

  return (
    <section className="mb-[36px]">
      <div className="mb-4 flex items-baseline gap-3 border-b border-border pb-[10px]">
        <h2 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          Needs your attention
        </h2>
        <span className="font-mono text-[11px] font-medium text-ink-muted">
          {total} {total === 1 ? "item" : "items"}
        </span>
        <a className="ml-auto inline-flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-primary">
          View all
          <ChevronRight />
        </a>
      </div>
      {items.length === 0 ? (
        <div className="rounded-md border border-border bg-bg-elevated px-6 py-8 text-center text-[13.5px] text-ink-muted">
          Nothing needs attention right now. Every team is on track.
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {items.map((item, i) => (
            <QueueCard key={`${item.teamSlug}-${i}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function QueueCard({ item }: { item: QueueItem }) {
  const toneColors = TONE_STYLES[item.tone];
  return (
    <div
      className={`relative rounded-md border border-border px-[22px] py-[18px] transition-all hover:border-border-strong hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
        item.passive ? "bg-bg-subtle opacity-85" : "bg-bg-elevated"
      }`}
    >
      <div
        className={`absolute left-[-1px] top-[-1px] bottom-[-1px] w-1 rounded-l-md ${toneColors.stripe}`}
      />
      <div className="mb-[10px] flex items-start gap-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${toneColors.iconBg} ${toneColors.iconInk}`}
        >
          {TONE_ICONS[item.tone]}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`mb-[3px] flex items-center gap-[6px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${toneColors.typeInk}`}
          >
            <span>{item.typeLabel}</span>
            <span className="rounded bg-bg-subtle px-[7px] py-[1px] font-medium tracking-[0.02em] text-ink-muted">
              {item.age}
            </span>
          </div>
          <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.005em] text-ink">
            {item.headline}
          </h3>
          <div className="mb-[10px] font-mono text-[12px] text-ink-muted">
            <span className="font-semibold text-primary">{item.teamName}</span>
            {" · "}
            {item.teamSubtitle}
          </div>
        </div>
      </div>
      <p className="mb-[14px] text-[13.5px] leading-[1.55] text-ink-soft">
        {item.detail}
      </p>
      <div className="flex items-center gap-1">
        {item.passive ? (
          <span className="inline-flex items-center gap-[5px] rounded bg-success-soft px-[10px] py-1 font-mono text-[10.5px] font-semibold text-success-ink">
            <CheckIcon />
            Auto-advanced
          </span>
        ) : (
          <>
            <Link
              href={`/teams/${item.teamSlug}`}
              className={`inline-flex items-center gap-[6px] rounded-[7px] border-[1.5px] px-[15px] py-2 text-[13px] font-semibold transition-colors ${toneColors.btn}`}
            >
              {item.primaryLabel ?? "View team"}
              <ChevronRight />
            </Link>
            <button
              type="button"
              className="rounded-[5px] bg-transparent px-[11px] py-[7px] text-[12.5px] font-medium text-ink-muted hover:bg-bg-subtle hover:text-ink"
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function teamSub(t: TriageItem): string {
  const wave =
    t.wave !== null ? `Wave ${String(t.wave).padStart(2, "0")}` : "Unassigned";
  return `${t.cohort} · ${wave}`;
}

const TONE_STYLES: Record<
  QueueTone,
  {
    stripe: string;
    iconBg: string;
    iconInk: string;
    typeInk: string;
    btn: string;
  }
> = {
  critical: {
    stripe: "bg-danger",
    iconBg: "bg-danger-soft",
    iconInk: "text-danger-ink",
    typeInk: "text-danger-ink",
    btn: "bg-primary border-primary text-white hover:bg-primary-hover",
  },
  handoff: {
    stripe: "bg-accent",
    iconBg: "bg-accent-soft",
    iconInk: "text-accent-ink",
    typeInk: "text-accent-ink",
    btn: "bg-accent border-accent text-white hover:bg-accent-ink",
  },
  high: {
    stripe: "bg-warn",
    iconBg: "bg-warn-soft",
    iconInk: "text-warn-ink",
    typeInk: "text-warn-ink",
    btn: "bg-primary border-primary text-white hover:bg-primary-hover",
  },
  ready: {
    stripe: "bg-success",
    iconBg: "bg-success-soft",
    iconInk: "text-success-ink",
    typeInk: "text-success-ink",
    btn: "bg-bg-elevated border-primary-mid text-primary hover:bg-primary-soft",
  },
};

const TONE_ICONS: Record<QueueTone, ReactNode> = {
  critical: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  handoff: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  high: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ready: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

function CheckIcon() {
  return (
    <svg
      className="h-[11px] w-[11px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      className="h-[11px] w-[11px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
