"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type {
  Confidence,
  EvidenceKind,
  FindingSource,
} from "@/generated/prisma/enums";

type Tone = "auto" | "input" | "anomaly";

export type DrawerEvidence = {
  id: string;
  kind: EvidenceKind;
  path: string;
  snippet: string | null;
  metadata: string | null;
  sourceUrl: string | null;
};

export type DrawerFinding = {
  id: string;
  fieldPath: string;
  fieldLabel: string;
  category: string;
  source: FindingSource;
  confidence: Confidence;
  value: string | null;
  triedNote: string | null;
  status: "PENDING" | "ACCEPTED" | "CORRECTED" | "OVERRIDDEN";
  lastActor: "AGENT" | "HUMAN" | null;
  evidence: DrawerEvidence[];
};

const TONE_BORDER: Record<Tone, string> = {
  auto: "border-l-success",
  input: "border-l-warn",
  anomaly: "border-l-accent",
};

const TONE_DOT: Record<Tone, string> = {
  auto: "bg-success",
  input: "bg-warn",
  anomaly: "bg-accent",
};

const TONE_CHEVRON_OPEN: Record<Tone, string> = {
  auto: "bg-success text-white",
  input: "bg-warn text-white",
  anomaly: "bg-accent text-white",
};

export type SummaryCardData = {
  tone: Tone;
  label: string;
  count: number;
  description: string;
};

export function FindingsSummary({
  cards,
  teamSlug,
  findings,
}: {
  cards: SummaryCardData[];
  teamSlug: string;
  findings: DrawerFinding[];
}) {
  const [openTone, setOpenTone] = useState<Tone | null>(null);

  useEffect(() => {
    if (openTone !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openTone]);

  useEffect(() => {
    if (openTone === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenTone(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openTone]);

  return (
    <>
      <div className="grid grid-cols-1 gap-[26px] md:grid-cols-3">
        {cards.map((card) => (
          <SummaryCard
            key={card.tone}
            card={card}
            isOpen={openTone === card.tone}
            onClick={() =>
              setOpenTone(openTone === card.tone ? null : card.tone)
            }
          />
        ))}
      </div>

      {openTone !== null ? (
        <DrawerShell onClose={() => setOpenTone(null)}>
          {openTone === "auto" ? (
            <AutoDrawer
              findings={findings.filter(
                (f) =>
                  (f.source === "ADO_API" || f.source === "INFERRED") &&
                  f.confidence !== "LOW",
              )}
              teamSlug={teamSlug}
            />
          ) : openTone === "input" ? (
            <InputDrawer
              findings={findings.filter((f) => f.source === "NEEDS_INPUT")}
              teamSlug={teamSlug}
            />
          ) : (
            <AnomalyDrawer
              findings={findings.filter((f) => f.confidence === "LOW")}
              teamSlug={teamSlug}
            />
          )}
        </DrawerShell>
      ) : null}
    </>
  );
}

function SummaryCard({
  card,
  isOpen,
  onClick,
}: {
  card: SummaryCardData;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left transition-colors ${
        isOpen ? "bg-bg-subtle" : "bg-bg-elevated hover:bg-bg-subtle"
      } rounded-lg border border-border p-[22px_26px]`}
    >
      <div
        className={`flex flex-col gap-[5px] rounded-r-[6px] border-l-[3px] pl-[14px] pr-[10px] pt-0.5 pb-1 ${TONE_BORDER[card.tone]}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${TONE_DOT[card.tone]}`}
          />
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
            {card.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[32px] font-bold leading-none tracking-[-0.025em] text-ink">
            {card.count}
          </span>
          <span
            className={`ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
              isOpen
                ? TONE_CHEVRON_OPEN[card.tone]
                : "bg-bg-subtle text-ink-muted"
            }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                isOpen
                  ? "rotate-90 transition-transform"
                  : "transition-transform"
              }
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
        <div className="mt-0.5 text-[12.5px] leading-[1.5] text-ink-soft">
          {card.description}
        </div>
      </div>
    </button>
  );
}

// -----------------------------------------------------------------------
// Drawer shell
// -----------------------------------------------------------------------

function DrawerShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[rgba(10,10,10,0.28)] transition-opacity"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-bg-elevated shadow-[-8px_0_32px_rgba(10,10,10,0.12)]">
        {children}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-bg-subtle hover:text-ink"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DrawerHeader({
  tone,
  eyebrow,
  title,
  subtitle,
}: {
  tone: Tone;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex-shrink-0 border-b border-border px-[26px] py-[22px] pr-12">
      <div className="mb-1 flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
        {eyebrow}
      </div>
      <div className="mb-0.5 text-[18px] font-semibold tracking-[-0.015em] text-ink">
        {title}
      </div>
      <div className="font-mono text-[11px] text-ink-muted">{subtitle}</div>
    </div>
  );
}

function DrawerFooter({ hint, cta }: { hint: string; cta: ReactNode }) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-border px-[26px] py-[14px]">
      <div className="text-[12px] text-ink-muted">{hint}</div>
      {cta}
    </div>
  );
}

// -----------------------------------------------------------------------
// Filter chips
// -----------------------------------------------------------------------

function FilterChips({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-bg-subtle px-[26px] py-[12px]">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        Filter
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-md border px-2.5 py-[3px] text-[11.5px] font-medium transition-colors ${
            active === opt
              ? "border-ink bg-ink text-white"
              : "border-border bg-bg-elevated text-ink-soft hover:border-border-strong"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Drawer: Auto-populated
// -----------------------------------------------------------------------

function AutoDrawer({
  findings,
  teamSlug,
}: {
  findings: DrawerFinding[];
  teamSlug: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All sections");
  const categories = unique(findings.map((f) => f.category));
  const filtered =
    activeCategory === "All sections"
      ? findings
      : findings.filter((f) => f.category === activeCategory);
  const grouped = groupBy(filtered, (f) => f.category);

  return (
    <>
      <DrawerHeader
        tone="auto"
        eyebrow="Auto-populated"
        title={`${findings.length} fields filled with high confidence`}
        subtitle="Read-only · grouped by section"
      />
      <FilterChips
        options={["All sections", ...categories]}
        active={activeCategory}
        onChange={setActiveCategory}
      />
      <div className="flex-1 overflow-y-auto px-[26px] py-[18px]">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <section key={cat} className="mb-6 last:mb-0">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
                {cat}
              </div>
              <div className="font-mono text-[11px] text-ink-muted">
                {items.length} {items.length === 1 ? "field" : "fields"}
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              {items.map((f) => (
                <AutoRow key={f.id} finding={f} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <DrawerFooter
        hint="Need to act on these? Open the review surface."
        cta={
          <Link
            href={`/teams/${teamSlug}/review`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-[13px] py-[7px] text-[12.5px] font-semibold text-white hover:bg-primary-hover"
          >
            Go to Review
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        }
      />
    </>
  );
}

function AutoRow({ finding }: { finding: DrawerFinding }) {
  const isHumanVerified =
    finding.lastActor === "HUMAN" && finding.status !== "PENDING";
  return (
    <div className="grid grid-cols-[1.3fr_1fr_auto] items-baseline gap-3 py-[10px]">
      <div className="min-w-0">
        <div className="truncate text-[12.5px] font-medium text-ink">
          {finding.fieldLabel}
        </div>
        <div className="truncate font-mono text-[10.5px] text-ink-muted">
          {finding.fieldPath}
        </div>
      </div>
      <div className="min-w-0 font-mono text-[11px] text-ink-soft">
        {finding.value ? (
          <span className="inline-block max-w-full truncate rounded bg-bg-subtle px-2 py-[2px]">
            {finding.value}
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <SourceBadge source={finding.source} />
        {isHumanVerified ? <HumanVerifiedBadge /> : null}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Drawer: Needs input
// -----------------------------------------------------------------------

function InputDrawer({
  findings,
  teamSlug,
}: {
  findings: DrawerFinding[];
  teamSlug: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All sections");
  const categories = unique(findings.map((f) => f.category));
  const filtered =
    activeCategory === "All sections"
      ? findings
      : findings.filter((f) => f.category === activeCategory);
  const grouped = groupBy(filtered, (f) => f.category);
  const verifiedCount = findings.filter(
    (f) => f.lastActor === "HUMAN" && f.status !== "PENDING",
  ).length;

  return (
    <>
      <DrawerHeader
        tone="input"
        eyebrow="Need human input"
        title={`${findings.length} fields waiting on a reviewer`}
        subtitle={
          verifiedCount > 0
            ? `${verifiedCount} already human-verified · ${findings.length - verifiedCount} remaining`
            : "Read-only · grouped by section"
        }
      />
      <FilterChips
        options={["All sections", ...categories]}
        active={activeCategory}
        onChange={setActiveCategory}
      />
      <div className="flex-1 overflow-y-auto px-[26px] py-[18px]">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <section key={cat} className="mb-6 last:mb-0">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
                {cat}
              </div>
              <div className="font-mono text-[11px] text-ink-muted">
                {items.length} {items.length === 1 ? "field" : "fields"}
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              {items.map((f) => (
                <InputRow key={f.id} finding={f} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <DrawerFooter
        hint="Ready to fill these in? Open the review surface."
        cta={
          <Link
            href={`/teams/${teamSlug}/review`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-[13px] py-[7px] text-[12.5px] font-semibold text-white hover:bg-primary-hover"
          >
            Go to Review
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        }
      />
    </>
  );
}

function InputRow({ finding }: { finding: DrawerFinding }) {
  const isHumanVerified =
    finding.lastActor === "HUMAN" && finding.status !== "PENDING";
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-3 py-[12px]">
      <div className="min-w-0">
        <div className="mb-0.5 text-[12.5px] font-medium text-ink">
          {finding.fieldLabel}
        </div>
        <div className="mb-1.5 font-mono text-[10.5px] text-ink-muted">
          {finding.fieldPath}
        </div>
        {isHumanVerified && finding.value ? (
          <div className="mb-1 rounded bg-success-soft px-2 py-1 text-[11.5px] text-success-ink">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.05em]">
              Answer
            </span>{" "}
            {finding.value}
          </div>
        ) : finding.triedNote ? (
          <div className="rounded bg-bg-subtle px-2 py-1 text-[11.5px] italic text-ink-muted">
            <span className="font-mono not-italic text-[10px] font-semibold uppercase tracking-[0.05em]">
              Tried
            </span>{" "}
            {finding.triedNote}
          </div>
        ) : null}
      </div>
      <div className="flex-shrink-0">
        {isHumanVerified ? (
          <HumanVerifiedBadge />
        ) : (
          <span className="inline-flex items-center rounded-md bg-bg-subtle px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
            Needs input
          </span>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Drawer: Anomalies
// -----------------------------------------------------------------------

function AnomalyDrawer({
  findings,
  teamSlug,
}: {
  findings: DrawerFinding[];
  teamSlug: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All areas");
  const categories = unique(findings.map((f) => f.category));
  const filtered =
    activeCategory === "All areas"
      ? findings
      : findings.filter((f) => f.category === activeCategory);
  const grouped = groupBy(filtered, (f) => f.category);

  return (
    <>
      <DrawerHeader
        tone="anomaly"
        eyebrow="Anomalies"
        title={`${findings.length} anomalies worth a look`}
        subtitle="Read-only · grouped by area · evidence expandable"
      />
      <FilterChips
        options={["All areas", ...categories]}
        active={activeCategory}
        onChange={setActiveCategory}
      />
      <div className="flex-1 overflow-y-auto px-[26px] py-[18px]">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <section key={cat} className="mb-5 last:mb-0">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
                {cat}
              </div>
              <div className="font-mono text-[11px] text-ink-muted">
                {items.length} {items.length === 1 ? "anomaly" : "anomalies"}
              </div>
            </div>
            <div className="divide-y divide-dashed divide-border-subtle">
              {items.map((f) => (
                <AnomalyRow key={f.id} finding={f} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <DrawerFooter
        hint={`Same ${findings.length} findings also shown on the main page below the fold.`}
        cta={
          <Link
            href={`/teams/${teamSlug}/review`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-[13px] py-[7px] text-[12.5px] font-semibold text-white hover:bg-primary-hover"
          >
            Go to Review
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        }
      />
    </>
  );
}

function AnomalyRow({ finding }: { finding: DrawerFinding }) {
  const [expanded, setExpanded] = useState(false);
  const hasEvidence = finding.evidence.length > 0;
  return (
    <div className="py-[12px]">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="text-[13px] font-semibold leading-[1.3] text-ink">
          {finding.fieldLabel}
        </div>
        <ConfidencePill confidence={finding.confidence} />
      </div>
      <div className="mb-1 font-mono text-[10.5px] text-ink-muted">
        {finding.fieldPath}
      </div>
      {finding.triedNote ? (
        <div className="text-[12px] leading-[1.5] text-ink-soft">
          {finding.triedNote}
        </div>
      ) : null}
      {hasEvidence ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
          >
            <svg
              className={`h-[10px] w-[10px] transition-transform ${expanded ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {expanded ? "Hide" : "Show"} evidence
            <span className="font-mono text-[10px] text-ink-muted">
              {finding.evidence.length}{" "}
              {finding.evidence.length === 1 ? "item" : "items"}
            </span>
          </button>
          {expanded ? (
            <div className="mt-2 space-y-2 rounded border border-border bg-bg-subtle px-2.5 py-2">
              {finding.evidence.map((e) => (
                <DrawerEvidenceRow key={e.id} item={e} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DrawerEvidenceRow({ item }: { item: DrawerEvidence }) {
  return (
    <div>
      <div className="mb-0.5 flex items-baseline gap-1.5">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
          {item.kind.replace("_", " ")}
        </span>
        <span className="truncate font-mono text-[10.5px] font-semibold text-ink">
          {item.path}
        </span>
      </div>
      {item.snippet ? (
        <pre className="max-h-[140px] overflow-auto whitespace-pre-wrap rounded border border-border bg-bg-elevated px-2 py-1 font-mono text-[10px] leading-[1.4] text-ink-soft">
          {item.snippet}
        </pre>
      ) : null}
      {item.metadata ? (
        <div className="mt-0.5 font-mono text-[9.5px] text-ink-muted">
          {item.metadata}
        </div>
      ) : null}
      {item.sourceUrl ? (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-[10.5px] font-semibold text-primary hover:underline"
        >
          View source →
        </a>
      ) : null}
    </div>
  );
}

// -----------------------------------------------------------------------
// Small shared bits
// -----------------------------------------------------------------------

function SourceBadge({ source }: { source: FindingSource }) {
  const label =
    source === "ADO_API"
      ? "ADO API"
      : source === "INFERRED"
        ? "Inferred"
        : "Needs input";
  const classes =
    source === "ADO_API"
      ? "bg-info-soft text-info-ink"
      : source === "INFERRED"
        ? "bg-bg-subtle text-ink-muted"
        : "bg-warn-soft text-warn-ink";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${classes}`}
    >
      {label}
    </span>
  );
}

function HumanVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-success-ink">
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified
    </span>
  );
}

function ConfidencePill({ confidence }: { confidence: Confidence }) {
  const classes =
    confidence === "HIGH"
      ? "bg-success-soft text-success-ink"
      : confidence === "MEDIUM"
        ? "bg-warn-soft text-warn-ink"
        : "bg-bg-subtle text-ink-muted";
  const label =
    confidence === "HIGH" ? "HIGH" : confidence === "MEDIUM" ? "MED" : "LOW";
  return (
    <span
      className={`inline-flex items-center gap-[4px] rounded-full px-2 py-[2px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em] ${classes}`}
    >
      <span className="h-[4px] w-[4px] rounded-full bg-current" />
      {label}
    </span>
  );
}

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}

function groupBy<T>(arr: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const item of arr) {
    const k = key(item);
    const list = m.get(k) ?? [];
    list.push(item);
    m.set(k, list);
  }
  return m;
}
