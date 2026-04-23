import Link from "next/link";
import type { CompleteProfileSection } from "@/server/complete-profile";

export function ProfileSectionsGrid({
  teamSlug,
  sections,
}: {
  teamSlug: string;
  sections: CompleteProfileSection[];
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
          Team profile sections
        </h2>
        <div className="text-[12px] text-ink-muted">
          Review in any order · start yourself or delegate
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <SectionCard
            key={section.key}
            section={section}
            teamSlug={teamSlug}
          />
        ))}
      </div>
    </section>
  );
}

function SectionCard({
  section,
  teamSlug,
}: {
  section: CompleteProfileSection;
  teamSlug: string;
}) {
  const isActive = section.progressPct > 0 && section.progressPct < 100;
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-bg-elevated p-[22px_24px] ${
        isActive ? "border-primary-mid" : "border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <ProgressRing percent={section.progressPct} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-[-0.005em] text-ink">
              {section.title}
            </h3>
            <span className="inline-flex flex-shrink-0 items-center rounded-md bg-bg-subtle px-2 py-[2px] font-mono text-[10.5px] font-semibold text-ink-soft">
              ~{section.estimateMin} min
            </span>
          </div>
          <p className="text-[12.5px] leading-[1.5] text-ink-soft">
            {section.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              section.reviewedCount > 0 ? "bg-primary" : "bg-bg-muted"
            }`}
          />
          <span className="font-mono font-semibold text-ink">
            {section.reviewedCount} of {section.totalCount}
          </span>{" "}
          {section.totalLabel} reviewed
        </span>
        {section.bestFit ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-primary-soft px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Best fit: {section.bestFit}
          </span>
        ) : section.better ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-bg-subtle px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            <span className="h-1 w-1 rounded-full bg-ink-muted" />
            Better: {section.better}
          </span>
        ) : null}
      </div>

      <div className="flex items-stretch gap-2">
        <Link
          href={`/teams/${teamSlug}/review`}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-ink px-4 py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#18181b]"
        >
          {section.progressPct === 100
            ? "Review"
            : section.reviewedCount > 0
              ? "Continue"
              : "Start"}
          <ArrowRight />
        </Link>
        <button
          type="button"
          className="flex h-auto w-[44px] items-center justify-center rounded-md border border-border bg-bg-elevated text-ink-muted transition-colors hover:bg-bg-subtle hover:text-ink"
          aria-label="Delegate"
          title="Delegate (coming soon)"
        >
          <DelegateIcon />
        </button>
      </div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 44;
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashoffset = circumference * (1 - clamped / 100);
  const ringColor = percent === 100 ? "#16a34a" : "#5b5fcf";
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-bg-muted"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold tracking-[-0.02em] text-ink">
        {percent}%
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function DelegateIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
