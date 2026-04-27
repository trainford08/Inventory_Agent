"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  acceptFinding,
  editFinding,
  flagFinding,
  undoFinding,
} from "@/server/actions/finding-actions";
import type { ReviewChunk, ReviewField } from "@/server/review-chunk";
import type { ReviewSectionDef } from "@/lib/review-sections";
import { nextSection } from "@/lib/review-sections";

export function ChunkMain({
  chunk,
  section,
  teamSlug,
}: {
  chunk: ReviewChunk;
  section: ReviewSectionDef;
  teamSlug: string;
}) {
  // The page shows only the currently-selected subsection. Navigation to
  // other subsections happens via the sidebar's sub-item links. Falls back
  // to the first non-empty subsection if isCurrent isn't set.
  const current =
    chunk.subsections.find((s) => s.isCurrent && s.totalCount > 0) ??
    chunk.subsections.find((s) => s.totalCount > 0) ??
    null;
  const next = nextSection(section.slug);

  return (
    <div className="max-w-[860px] px-11 pb-10 pt-9">
      {/* Hero */}
      <div className="mb-[26px] border-b border-border pb-[18px]">
        <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Section {String(section.number).padStart(2, "0")} of 05 ·{" "}
          {section.label.toUpperCase()}
        </div>
        <h2 className="mb-1.5 text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
          {section.label}
        </h2>
        <p className="text-[15px] font-medium leading-[1.5] tracking-[-0.005em] text-ink-soft">
          {section.subtitle}
        </p>
      </div>

      {current ? <SubsectionPanel subsection={current} /> : null}

      {next ? (
        <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-dashed border-border-strong bg-bg-elevated px-[18px] py-3.5">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Next
          </span>
          <span className="text-[13.5px] font-semibold tracking-[-0.005em] text-ink">
            {next.label}
          </span>
          <Link
            href={`/teams/${teamSlug}/review/${next.slug}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-ink bg-ink px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-ink-soft"
          >
            Go to {next.label.toLowerCase()}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SubsectionPanel({
  subsection,
}: {
  subsection: ReviewChunk["subsections"][number];
}) {
  // Prefer subject-level counts ("4 of 18 repositories") when the
  // subsection groups multiple attribute items per subject.
  const headerTotal = subsection.subjectTotalCount ?? subsection.totalCount;
  const headerReviewed =
    subsection.subjectReviewedCount ?? subsection.reviewedCount;
  const headerNoun = subsection.subjectNoun ?? "items";
  const remaining = headerTotal - headerReviewed;
  // Items render in their declared order regardless of state. A row's
  // visual style (compact reviewed vs pending card) flips based on state,
  // but its position in the list stays put — so undo returns a field to
  // the exact slot it was in, preserving the reviewer's mental map.
  const isHumanTouched = (f: ReviewField) =>
    f.state === "accepted" || f.state === "corrected" || f.state === "flagged";

  return (
    <section className="mb-8">
      <div className="mb-[14px] flex items-baseline gap-3.5 border-b border-border py-3">
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
          {subsection.name}
        </h3>
        <span className="font-mono text-[11.5px] font-medium text-ink-muted">
          {headerReviewed} of {headerTotal}
          {subsection.subjectNoun ? ` ${headerNoun}` : ""} reviewed
        </span>
        {remaining > 0 ? (
          <span className="ml-auto rounded-full bg-primary-soft px-2.5 py-[3px] font-mono text-[11.5px] font-semibold text-primary">
            {remaining} remaining
          </span>
        ) : (
          <span className="ml-auto rounded-full bg-success-soft px-2.5 py-[3px] font-mono text-[11.5px] font-semibold text-success-ink">
            All clear
          </span>
        )}
        <AddFieldHeaderButton subsectionName={subsection.name} />
      </div>

      {subsection.currentSubjectName ? (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-bg-subtle px-3 py-2 text-[12.5px] text-ink-soft">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Now reviewing
          </span>
          <span className="font-mono text-[12px] font-semibold text-ink">
            {subsection.currentSubjectName}
          </span>
          {subsection.nextSubjectName && subsection.nextSubjectHref ? (
            <a
              href={subsection.nextSubjectHref}
              className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-hover"
            >
              Skip to {subsection.nextSubjectName}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          ) : null}
        </div>
      ) : null}

      <div>
        {subsection.fields.map((f) =>
          isHumanTouched(f) ? (
            <ReviewedRow key={f.id} field={f} />
          ) : (
            <PendingCard key={f.id} field={f} />
          ),
        )}
        <AddFieldRow subsectionName={subsection.name} />
      </div>
    </section>
  );
}

function AddFieldHeaderButton(_props: { subsectionName: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-bg-elevated px-2.5 py-[5px] text-[11.5px] font-semibold text-primary hover:border-primary hover:bg-primary-soft"
    >
      <span className="text-[14px] leading-none">+</span>
      Add field
    </button>
  );
}

function AddFieldRow({ subsectionName }: { subsectionName: string }) {
  return (
    <button
      type="button"
      className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border-strong bg-transparent px-4 py-3 text-left text-[13px] font-medium text-ink-muted transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
    >
      <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-current text-[12px] leading-none">
        +
      </span>
      Add a field to {subsectionName}
    </button>
  );
}

// ─── Field editor ──────────────────────────────────────────────────────────
// Renders the appropriate control for the field's editKind.
//   text         single-line input
//   boolean      two-button Yes / No toggle
//   enum         segmented control (pick one)
//   multiselect  comma-separated chip toggles (pick many)
// Always serializes to a plain string for editFinding.
function parseMulti(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(/[·,]/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function truthyBoolean(value: string | null): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v.startsWith("yes") || v.startsWith("y");
}

function FieldEditor({
  field,
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  field: ReviewField;
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const kind = field.editKind ?? "text";
  const options = field.editOptions ?? [];
  const iconSize = "12";
  const btnSize = "h-6 w-6";

  const SaveCancel = (
    <>
      <button
        type="button"
        onClick={onSave}
        className={`inline-flex ${btnSize} items-center justify-center rounded text-primary hover:bg-primary-soft`}
        aria-label="Save"
        title="Save (Enter)"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={`inline-flex ${btnSize} items-center justify-center rounded text-ink-muted hover:bg-bg-subtle hover:text-ink`}
        aria-label="Cancel"
        title="Cancel (Esc)"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </>
  );

  if (kind === "boolean") {
    const current = truthyBoolean(draft);
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-primary bg-bg-elevated px-1 py-0.5">
        <span className="inline-flex gap-1">
          {["true", "false"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setDraft(opt)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSave();
                }
              }}
              className={`rounded px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] ${
                (opt === "true" && current) || (opt === "false" && !current)
                  ? "bg-primary text-white"
                  : "bg-bg-subtle text-ink-muted hover:bg-bg hover:text-ink"
              }`}
            >
              {opt === "true" ? "Yes" : "No"}
            </button>
          ))}
        </span>
        {SaveCancel}
      </span>
    );
  }

  if (kind === "enum" && options.length > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-primary bg-bg-elevated px-1 py-0.5">
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          autoFocus
          className="min-w-[180px] rounded bg-bg-elevated px-2 py-1 font-mono text-[12px] text-ink focus:outline-none"
        >
          {!options.includes(draft) && draft ? (
            <option value={draft}>{draft}</option>
          ) : null}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {SaveCancel}
      </span>
    );
  }

  if (kind === "multiselect" && options.length > 0) {
    const selected = parseMulti(draft);
    const toggle = (opt: string) => {
      const next = new Set(selected);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      setDraft(Array.from(next).join(" · "));
    };
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5 rounded-[5px] border border-primary bg-bg-elevated p-1">
        <span className="inline-flex flex-wrap gap-1">
          {options.map((opt) => {
            const on = selected.has(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  on
                    ? "bg-primary text-white"
                    : "bg-bg-subtle text-ink-muted hover:bg-bg hover:text-ink"
                }`}
              >
                {on ? "✓ " : ""}
                {opt}
              </button>
            );
          })}
        </span>
        {SaveCancel}
      </span>
    );
  }

  // Default: text
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-primary bg-bg-elevated px-1 py-0.5 focus-within:ring-2 focus-within:ring-primary-mid">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSave();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        autoFocus
        className="min-w-[240px] rounded bg-bg-elevated px-2 py-1 font-mono text-[12px] text-ink focus:outline-none"
      />
      {SaveCancel}
    </span>
  );
}

// ─── Reviewed row (compact single-line) ────────────────────────────────────
function ReviewedRow({ field }: { field: ReviewField }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value ?? "");
  const doUndo = () =>
    startTransition(async () => {
      await undoFinding({ findingId: field.id });
    });
  const submitEdit = () => {
    if (!draft.trim()) return;
    startTransition(async () => {
      await editFinding({ findingId: field.id, value: draft.trim() });
      setEditing(false);
    });
  };
  const cancelEdit = () => {
    setDraft(field.value ?? "");
    setEditing(false);
  };

  return (
    <div
      className={`mb-1.5 rounded-lg border border-border-subtle bg-bg-subtle px-4 py-2.5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-success text-white">
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
        <span className="flex min-w-0 flex-1 items-center gap-2 text-[13px] font-medium text-ink-soft">
          {field.question ?? field.label}
          {!editing && field.value ? (
            <span className="font-mono text-[11.5px] text-ink-muted">
              {field.value}
            </span>
          ) : null}
        </span>
        {!editing && field.reviewedAgoLabel ? (
          <span className="font-mono text-[10.5px] text-ink-muted">
            {field.reviewedAgoLabel}
          </span>
        ) : null}
        <div className="flex items-center gap-1">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded px-2 py-[3px] text-[11.5px] font-medium text-ink-muted hover:bg-bg-elevated hover:text-primary"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Edit
            </button>
          ) : null}
          {!editing ? (
            <button
              type="button"
              onClick={doUndo}
              className="inline-flex items-center gap-1 rounded px-2 py-[3px] text-[11.5px] font-medium text-ink-muted hover:bg-bg-elevated hover:text-ink"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Undo
            </button>
          ) : null}
        </div>
      </div>
      {editing ? (
        <div className="mt-2.5 pl-7">
          <FieldEditor
            field={field}
            draft={draft}
            setDraft={setDraft}
            onSave={submitEdit}
            onCancel={cancelEdit}
          />
        </div>
      ) : null}
    </div>
  );
}

// ─── Pending card (question + info + 4 buttons) ────────────────────────────
function PendingCard({ field }: { field: ReviewField }) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<"accept" | "edit" | "flag" | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value ?? "");

  const onAccept = () => {
    setSelected("accept");
    startTransition(async () => {
      await acceptFinding({ findingId: field.id });
    });
  };
  const onFlag = () => {
    setSelected("flag");
    startTransition(async () => {
      await flagFinding({ findingId: field.id });
    });
  };
  const submitEdit = () => {
    if (!draft.trim()) return;
    startTransition(async () => {
      await editFinding({ findingId: field.id, value: draft.trim() });
      setSelected("edit");
      setEditing(false);
    });
  };

  const sourceLabel =
    field.source === "ADO_API"
      ? "ADO API"
      : field.source === "INFERRED"
        ? "Inferred"
        : "Needs input";
  const sourcePillClasses =
    field.source === "ADO_API"
      ? "bg-success-soft text-success-ink"
      : field.source === "INFERRED"
        ? "bg-warn-soft text-warn-ink"
        : "bg-bg-muted text-ink-muted";

  return (
    <div
      className={`mb-2 rounded-lg border border-border bg-bg-elevated px-[18px] py-3.5 transition hover:border-border-strong hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${pending ? "opacity-60" : ""}`}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="text-[14.5px] font-semibold leading-[1.35] tracking-[-0.005em] text-ink">
          {field.question ?? field.label}
        </div>
        {field.description || field.whyItMatters ? (
          <InfoIcon what={field.description} why={field.whyItMatters} />
        ) : null}
        <span
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-[2.5px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${sourcePillClasses}`}
        >
          <span className="h-1 w-1 rounded-full bg-current" />
          {sourceLabel}
        </span>
      </div>

      {!editing ? (
        <div className="mb-3 inline-block rounded-[5px] border border-border-subtle bg-bg-subtle px-[11px] py-1.5 font-mono text-[12px] text-ink">
          {field.value ?? <span className="italic text-ink-faint">—</span>}
          {field.triedNote ? (
            <span className="ml-1 font-sans italic text-ink-muted">
              · {field.triedNote.slice(0, 140)}
              {field.triedNote.length > 140 ? "…" : ""}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mb-3">
          <FieldEditor
            field={field}
            draft={draft}
            setDraft={setDraft}
            onSave={submitEdit}
            onCancel={() => {
              setDraft(field.value ?? "");
              setEditing(false);
            }}
          />
        </div>
      )}

      <div className="mt-1">
        <div className="flex flex-wrap gap-2">
          <SegBtn
            label="Accept"
            icon={<CheckIcon />}
            selected={selected === "accept"}
            onClick={onAccept}
          />
          <SegBtn
            label="Edit"
            icon={<PencilIcon />}
            selected={selected === "edit" || editing}
            onClick={() => setEditing((v) => !v)}
          />
          <AdaSegBtn fieldId={field.id} />
          <SegBtn
            label="Flag"
            icon={<FlagIcon />}
            selected={selected === "flag"}
            onClick={onFlag}
          />
        </div>
      </div>
    </div>
  );
}

function SegBtn({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg border-[1.5px] px-[18px] py-[9px] text-[13px] font-semibold tracking-[-0.003em] transition";
  const selectedClasses =
    "bg-primary text-white border-primary shadow-[0_1px_3px_rgba(91,95,207,0.3)]";
  const idleClasses =
    "bg-bg-elevated text-primary border-primary-mid hover:bg-primary-soft hover:border-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${selected ? selectedClasses : idleClasses}`}
    >
      {icon}
      {label}
    </button>
  );
}

function AdaSegBtn({ fieldId }: { fieldId: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentAda = params.get("ada");
  const isOpen = currentAda === fieldId;

  const next = new URLSearchParams(params.toString());
  if (isOpen) next.delete("ada");
  else next.set("ada", fieldId);
  const qs = next.toString();
  const href = qs ? `${pathname}?${qs}` : pathname;

  const base =
    "inline-flex items-center gap-1.5 rounded-lg border-[1.5px] px-[18px] py-[9px] text-[13px] font-semibold tracking-[-0.003em] transition";
  const openClasses =
    "bg-accent text-white border-accent shadow-[0_1px_3px_rgba(8,145,178,0.3)]";
  const closedClasses =
    "bg-bg-elevated text-primary border-primary-mid hover:bg-primary-soft hover:border-primary";
  return (
    <Link
      href={href}
      className={`${base} ${isOpen ? openClasses : closedClasses}`}
    >
      <svg
        className="h-[13px] w-[13px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {isOpen ? "Ada is helping" : "Not sure"}
    </Link>
  );
}

function InfoIcon({ what, why }: { what: string | null; why: string | null }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      tabIndex={0}
      className="relative inline-flex h-4 w-4 cursor-help items-center justify-center text-ink-faint hover:text-primary"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label="What is this and why it matters"
    >
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {hover ? (
        <span
          role="tooltip"
          className="absolute left-[-8px] top-[calc(100%+8px)] z-20 w-[320px] rounded-lg bg-ink px-4 py-3.5 text-left text-[12.5px] leading-[1.55] text-white shadow-[0_12px_24px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          <span
            aria-hidden="true"
            className="absolute left-[14px] top-[-5px] block h-2.5 w-2.5 rotate-45 bg-ink"
          />
          {what ? <span className="block">{what}</span> : null}
          {why ? (
            <span className="mt-2 block border-t border-white/10 pt-2 text-white/80">
              <span className="mr-[5px] inline-block font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#a5b4fc]">
                Why it matters
              </span>
              {why}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
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

function PencilIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
