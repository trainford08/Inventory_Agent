import Link from "next/link";
import type { ReactNode } from "react";
import type { TriageItem } from "@/server/dashboard";

type Tone = "danger" | "ada" | "warn" | "success";

const TONE_ICON_CLASSES: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger-ink",
  ada: "bg-accent-soft text-accent-ink",
  warn: "bg-warn-soft text-warn-ink",
  success: "bg-success-soft text-success-ink",
};

const TONE_AGE_CLASSES: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger-ink",
  ada: "bg-accent-soft text-accent-ink",
  warn: "bg-warn-soft text-warn-ink",
  success: "bg-success-soft text-success-ink",
};

export function TriageInbox({
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
  return (
    <section className="mb-[44px]">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
          Triage inbox
        </h2>
        <RefreshIndicator />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TriageCard
          tone="danger"
          title="New blockers"
          count={blockers.count}
          items={blockers.items}
          icon={<BlockerIcon />}
          emptyText="No new blockers."
        />
        <TriageCard
          tone="ada"
          title="Ada handoffs"
          count={adaHandoffs.count}
          items={adaHandoffs.items}
          icon={<AdaIcon />}
          emptyText="Ada isn't available yet — handoffs light up when M4 ships."
        />
        <TriageCard
          tone="warn"
          title="Cutover slippage"
          count={cutoverSlips.count}
          items={cutoverSlips.items}
          icon={<ClockIcon />}
          emptyText="No teams behind target cutover."
        />
        <TriageCard
          tone="success"
          title="Ready to advance"
          count={readyToAdvance.count}
          items={readyToAdvance.items}
          icon={<CheckIcon />}
          emptyText="No teams are ready to advance yet."
        />
      </div>
    </section>
  );
}

function TriageCard({
  tone,
  title,
  count,
  items,
  icon,
  emptyText,
}: {
  tone: Tone;
  title: string;
  count: number;
  items: TriageItem[];
  icon: ReactNode;
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
      <div className="flex items-center gap-3 border-b border-border-subtle px-[16px] py-[12px]">
        <span
          className={`flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[7px] ${TONE_ICON_CLASSES[tone]}`}
        >
          {icon}
        </span>
        <div className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
          {title}
        </div>
        <div className="ml-auto font-mono text-[13px] font-bold text-ink">
          {count}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="px-[16px] py-[18px] text-[12px] italic text-ink-muted">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {items.map((item, i) => (
            <Link
              key={i}
              href={`/teams/${item.slug}`}
              className="flex items-start gap-3 px-[16px] py-[10px] hover:bg-bg-subtle"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">
                  {item.name}
                </div>
                <div className="truncate text-[11.5px] text-ink-muted">
                  {item.subtitle}
                </div>
              </div>
              <span
                className={`inline-flex flex-shrink-0 items-center rounded-md px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${TONE_AGE_CLASSES[tone]}`}
              >
                {item.age}
              </span>
            </Link>
          ))}
        </div>
      )}
      {items.length > 0 && count > items.length ? (
        <div className="border-t border-border-subtle px-[16px] py-[8px]">
          <span className="text-[11.5px] text-primary">
            + {count - items.length} more
          </span>
        </div>
      ) : null}
    </div>
  );
}

function RefreshIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
      Live · last refresh just now
    </div>
  );
}

function BlockerIcon() {
  return (
    <svg
      width="15"
      height="15"
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
  );
}

function AdaIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
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
