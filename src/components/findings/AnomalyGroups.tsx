"use client";

import { useState, type ReactNode } from "react";
import type { Confidence, EvidenceKind } from "@/generated/prisma/enums";
import { relativeTime } from "@/lib/time";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  path: string;
  snippet: string | null;
  metadata: string | null;
  sourceUrl: string | null;
};

export type Anomaly = {
  id: string;
  title: string;
  detail: string;
  confidence: Confidence;
  fieldPath: string;
  value: string | null;
  updatedAt: Date;
  evidence: EvidenceItem[];
};

export type AnomalyGroup = {
  category: string;
  accent: "repos" | "pipes" | "auth" | "other";
  anomalies: Anomaly[];
};

const GROUP_ICON_CLASSES: Record<AnomalyGroup["accent"], string> = {
  repos: "bg-primary-soft text-primary",
  pipes: "bg-warn-soft text-warn-ink",
  auth: "bg-danger-soft text-danger-ink",
  other: "bg-bg-subtle text-ink-muted",
};

export function AnomalyGroups({ groups }: { groups: AnomalyGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated p-8 text-center">
        <div className="mb-1 text-[14px] font-semibold text-ink">
          No anomalies to review
        </div>
        <p className="text-[12.5px] text-ink-muted">
          Nothing the agent found needs a second look.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <Group key={group.category} group={group} />
      ))}
    </div>
  );
}

function Group({ group }: { group: AnomalyGroup }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
      <div className="flex items-center gap-3 border-b border-border bg-bg-subtle px-[22px] py-[13px]">
        <span
          className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[7px] ${GROUP_ICON_CLASSES[group.accent]}`}
        >
          <GroupIcon accent={group.accent} />
        </span>
        <div className="text-[13.5px] font-semibold tracking-[-0.005em] text-ink">
          {group.category}
        </div>
        <div className="ml-auto font-mono text-[11px] text-ink-muted">
          {group.anomalies.length}{" "}
          {group.anomalies.length === 1 ? "finding" : "findings"}
        </div>
      </div>
      <div className="divide-y divide-dashed divide-border-subtle">
        {group.anomalies.map((a) => (
          <AnomalyItem key={a.id} anomaly={a} />
        ))}
      </div>
    </div>
  );
}

function AnomalyItem({ anomaly }: { anomaly: Anomaly }) {
  const [expanded, setExpanded] = useState(false);
  const hasEvidence = anomaly.evidence.length > 0;
  return (
    <div className="px-[22px] py-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 text-[14px] font-semibold leading-[1.4] tracking-[-0.005em] text-ink">
          {anomaly.title}
        </div>
        <ConfidencePill confidence={anomaly.confidence} />
      </div>
      <p className="mt-1.5 pl-1 text-[13px] leading-[1.55] text-ink-soft">
        {anomaly.detail}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          disabled={!hasEvidence}
          className="inline-flex items-center gap-[7px] rounded-md border border-border bg-bg-elevated px-3 py-[6px] text-[12px] font-medium text-ink-soft transition-colors hover:border-border-strong hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-elevated"
        >
          <Chevron expanded={expanded} />
          {hasEvidence
            ? expanded
              ? "Hide evidence"
              : "Show evidence"
            : "No evidence captured"}
          {hasEvidence ? (
            <span className="ml-0.5 font-mono text-[10.5px] text-ink-muted">
              {anomaly.evidence.length}{" "}
              {anomaly.evidence.length === 1 ? "item" : "items"}
            </span>
          ) : null}
        </button>
      </div>
      {expanded && hasEvidence ? <Evidence anomaly={anomaly} /> : null}
    </div>
  );
}

const KIND_ICON_CLASS = "h-2.5 w-2.5";

function evidenceIcon(kind: EvidenceKind): ReactNode {
  const common = {
    className: KIND_ICON_CLASS,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "FILE") {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (kind === "FOLDER") {
    return (
      <svg {...common}>
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    );
  }
  if (kind === "URL") {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    );
  }
  if (kind === "API_RESPONSE") {
    return (
      <svg {...common}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (kind === "CONFIG") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    );
  }
  if (kind === "LOG") {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function Evidence({ anomaly }: { anomaly: Anomaly }) {
  return (
    <div className="mt-[14px] rounded-[7px] border border-border bg-bg-subtle px-[16px] py-[14px]">
      <div className="mb-2.5 flex items-baseline justify-between">
        <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Evidence
        </div>
        <div className="font-mono text-[10.5px] text-ink-muted">
          Last seen {relativeTime(anomaly.updatedAt)}
        </div>
      </div>
      <div className="space-y-3">
        {anomaly.evidence.map((e) => (
          <EvidenceRow key={e.id} item={e} />
        ))}
      </div>
    </div>
  );
}

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="flex items-start gap-[10px]">
      <span
        className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded bg-bg-elevated text-ink-muted ring-1 ring-inset ring-border"
        title={item.kind.replace("_", " ").toLowerCase()}
      >
        {evidenceIcon(item.kind)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
            {item.kind.replace("_", " ")}
          </span>
          <span className="truncate font-mono text-[11.5px] font-semibold text-ink">
            {item.path}
          </span>
        </div>
        {item.snippet ? (
          <pre className="mt-1 max-h-[220px] overflow-auto whitespace-pre-wrap rounded border border-border bg-bg-elevated px-[9px] py-[6px] font-mono text-[11px] leading-[1.5] text-ink-soft">
            {item.snippet}
          </pre>
        ) : null}
        {item.metadata ? (
          <div className="mt-1 font-mono text-[10.5px] text-ink-muted">
            {item.metadata}
          </div>
        ) : null}
        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline"
          >
            View source
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : null}
      </div>
    </div>
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
      className={`inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${classes}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {label}
    </span>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-[11px] w-[11px] transition-transform ${expanded ? "rotate-90" : ""}`}
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

function GroupIcon({ accent }: { accent: AnomalyGroup["accent"] }): ReactNode {
  const common = {
    className: "h-[14px] w-[14px]",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (accent === "repos") {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    );
  }
  if (accent === "pipes") {
    return (
      <svg {...common}>
        <rect x="2" y="4" width="20" height="6" rx="1" />
        <rect x="2" y="14" width="20" height="6" rx="1" />
        <path d="M6 10v4" />
        <path d="M12 10v4" />
        <path d="M18 10v4" />
      </svg>
    );
  }
  if (accent === "auth") {
    return (
      <svg {...common}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
