import Link from "next/link";
import type { ReactNode } from "react";
import { AdaPanel } from "@/components/ada/AdaPanel";
import type { ReviewChunk } from "@/server/review-chunk";
import type { ReviewSectionDef } from "@/lib/review-sections";

type ShellProps = {
  section: ReviewSectionDef;
  teamSlug: string;
  children: ReactNode;
  /** The chunk drives the in-section sub-item rail and per-section progress.
   *  Pass null for sections that don't have content yet — the rail shows a
   *  placeholder and the main renders whatever children supply. */
  chunk: ReviewChunk | null;
  /** When set, Ada panel renders as a 3rd column, scoped to this field. */
  ada?: {
    fieldLabel: string;
    fieldSubject?: string | null;
    fieldValue?: string | null;
  } | null;
};

export function ReviewShell({
  section,
  teamSlug,
  chunk,
  children,
  ada,
}: ShellProps) {
  return (
    // Sits inside AppShell's main column. Page-scoped secondary nav on the
    // left, review content in the middle, Ada assistant on the right.
    // Ada's column is always visible; its content is empty until the user
    // clicks "Not sure" on a field.
    <div className="grid min-h-full grid-cols-[260px_1fr_380px] bg-bg">
      <ReviewRail section={section} teamSlug={teamSlug} chunk={chunk} />
      <div className="min-w-0 overflow-x-hidden">{children}</div>
      <AdaPanel
        fieldLabel={ada?.fieldLabel ?? null}
        fieldSubject={ada?.fieldSubject ?? null}
        fieldValue={ada?.fieldValue ?? null}
      />
    </div>
  );
}

function ReviewRail({
  section,
  teamSlug,
  chunk,
}: {
  section: ReviewSectionDef;
  teamSlug: string;
  chunk: ReviewChunk | null;
}) {
  // The section card's progress line is scoped to the current subsection —
  // matches the mock ("4 of 18 repositories reviewed"). When a subsection
  // has subject-level counts (e.g. Repositories with 8 attrs per repo),
  // the sidebar shows subject counts, not attribute counts.
  const currentSub = chunk?.subsections.find(
    (s) => s.isCurrent && s.totalCount > 0,
  );
  const total = currentSub?.subjectTotalCount ?? currentSub?.totalCount ?? 0;
  const reviewed =
    currentSub?.subjectReviewedCount ?? currentSub?.reviewedCount ?? 0;
  const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  const subLabel =
    currentSub?.subjectNoun ?? currentSub?.name.toLowerCase() ?? "items";

  return (
    <aside className="flex flex-col gap-4 border-r border-border bg-bg-subtle px-[14px] py-[18px]">
      {/* Section tag — identifies this rail as page-scoped within the app shell */}
      <div className="px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Review · {section.label}
      </div>

      {/* Section card */}
      <div className="rounded-lg bg-bg-subtle px-3 py-[14px]">
        <div className="mb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Reviewing section
        </div>
        <div className="mb-2 text-[14px] font-semibold tracking-[-0.01em] text-ink">
          {section.label}
        </div>
        <div className="mb-2 font-mono text-[11px] text-ink-muted">
          {chunk ? (
            <>
              <span className="font-semibold text-ink">
                {reviewed} of {total}
              </span>{" "}
              {subLabel} reviewed
            </>
          ) : (
            <span className="italic text-ink-faint">Not started</span>
          )}
        </div>
        <div className="h-1 overflow-hidden rounded-sm bg-bg-muted">
          <div
            className="h-full rounded-sm bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* In this section */}
      {chunk && chunk.subsections.some((s) => s.totalCount > 0) ? (
        <div>
          <div className="mb-1.5 px-2.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-ink-faint">
            In this section
          </div>
          <ul className="space-y-0.5">
            {chunk.subsections
              .filter((s) => s.totalCount > 0)
              .map((sub) => {
                const subTotal = sub.subjectTotalCount ?? sub.totalCount;
                const subReviewed =
                  sub.subjectReviewedCount ?? sub.reviewedCount;
                const done = subReviewed === subTotal;
                const isCurrent = sub.isCurrent;
                // Only Repositories has designs today; other sub-items
                // render as plain rows (no hover, no link).
                const clickable = sub.key === "repositories";
                const baseRow = `flex items-center gap-[9px] rounded-md px-2.5 py-[7px] text-[12.5px] ${
                  isCurrent
                    ? "bg-sidebar-active font-semibold text-primary"
                    : "text-ink-muted"
                }`;
                const rowContent = (
                  <>
                    <SubIcon done={done} current={isCurrent} />
                    <span className="flex-1 truncate">{sub.name}</span>
                    <span
                      className={`font-mono text-[10.5px] ${
                        isCurrent
                          ? "font-semibold text-primary"
                          : "text-ink-muted"
                      }`}
                    >
                      {done ? String(subTotal) : `${subReviewed}/${subTotal}`}
                    </span>
                  </>
                );
                return (
                  <li key={sub.key}>
                    {clickable ? (
                      <Link
                        href={`/teams/${teamSlug}/review/${section.slug}?sub=${sub.key}`}
                        className={`${baseRow} ${
                          !isCurrent
                            ? "hover:bg-sidebar-hover hover:text-ink"
                            : ""
                        }`}
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      <div
                        className={baseRow}
                        aria-disabled="true"
                        title="Designs for this subsection coming soon"
                      >
                        {rowContent}
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-auto">
        <div className="inline-flex items-center gap-[7px] rounded-full bg-success-soft px-3 py-2 text-[11.5px] font-medium text-success-ink">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          All progress saves
        </div>
      </div>
    </aside>
  );
}

function SubIcon({ done, current }: { done: boolean; current: boolean }) {
  if (done) {
    return (
      <span className="flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-success bg-success text-white">
        <svg
          width="8"
          height="8"
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
  if (current) {
    return (
      <span className="relative flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary bg-primary">
        <span className="h-1 w-1 rounded-full bg-white" />
      </span>
    );
  }
  return (
    <span className="h-[14px] w-[14px] flex-shrink-0 rounded-full border-[1.5px] border-border-strong bg-bg-elevated" />
  );
}
