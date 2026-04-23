import "server-only";
import type {
  Confidence,
  FindingSource,
  LastActor,
} from "@/generated/prisma/enums";
import {
  CANONICAL_CATEGORIES,
  CANONICAL_JTBDS,
} from "../../prisma/cohorts/canonical-jtbds";
import { prisma } from "./db";

const CANONICAL_DESCRIPTION_BY_CODE = new Map(
  CANONICAL_JTBDS.map((j) => [j.code, j.description]),
);

export type ReviewFieldState =
  | "pending"
  | "agent_accepted"
  | "accepted"
  | "corrected"
  | "flagged";

export type ReviewField = {
  id: string;
  label: string;
  fieldPath: string;
  value: string | null;
  source: FindingSource;
  confidence: Confidence;
  triedNote: string | null;
  /** Plain-English description of the item — the "what it is" half of the
   *  info tooltip on pending cards. For JTBDs this comes from the doc. */
  description: string | null;
  /** One-line "why it matters" — the lower half of the info tooltip. Tells
   *  the reviewer what changes if they get this wrong. */
  whyItMatters: string | null;
  /** Question-framed label shown above the value pill (e.g. "Uses Git LFS?").
   *  Falls back to `label` when not set. */
  question: string | null;
  /** Editor input type — drives which control renders when the user clicks
   *  Edit. Falls back to "text" if omitted. */
  editKind?: "text" | "boolean" | "enum" | "multiselect";
  /** Options for enum / multiselect editors. Ignored for other kinds. */
  editOptions?: string[];
  state: ReviewFieldState;
  reviewedAgoLabel: string | null;
};

export type ReviewSubsection = {
  key: string;
  name: string;
  fields: ReviewField[];
  /** Items in this subsection (one per pre-filled finding). */
  totalCount: number;
  reviewedCount: number;
  /** Subject-level totals: when the subsection reviews multiple attributes
   *  per underlying thing (e.g. 8 attrs × 18 repos = 144 items, 18 subjects),
   *  these count the subjects. Sidebar progress uses these so the Champion
   *  sees "0 of 18 repositories" not "0 of 144 items". Falls back to
   *  item-level counts when subjects aren't defined. */
  subjectTotalCount?: number;
  subjectReviewedCount?: number;
  /** Noun to use in sidebar progress text ("repositories", "projects"). */
  subjectNoun?: string;
  /** Name of the specific subject being reviewed right now (e.g. the repo
   *  name). Shown under the subsection header when items are scoped to a
   *  single subject — "Now reviewing: coreai-backend-main". */
  currentSubjectName?: string;
  /** If set, URL to the next subject awaiting review (e.g. next repo).
   *  Used by the subsection's advance button. */
  nextSubjectHref?: string;
  nextSubjectName?: string;
  isCurrent: boolean;
};

export type ReviewChunk = {
  teamName: string;
  teamSlug: string;
  chunkLabel: string;
  chunkNumber: number;
  chunkTotal: number;
  chunkTitle: string;
  chunkSubtitle: string;
  totalFields: number;
  totalReviewed: number;
  subsections: ReviewSubsection[];
};

function stateFor(
  status: "PENDING" | "ACCEPTED" | "CORRECTED" | "OVERRIDDEN",
  lastActor: LastActor | null,
): ReviewFieldState {
  if (lastActor === "HUMAN") {
    if (status === "ACCEPTED") return "accepted";
    if (status === "CORRECTED") return "corrected";
    if (status === "OVERRIDDEN") return "flagged";
    return "pending";
  }
  if (lastActor === "AGENT" && status === "ACCEPTED") {
    return "agent_accepted";
  }
  return "pending";
}

function relativeAgo(then: Date, nowMs: number): string {
  const diffMs = nowMs - then.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const days = Math.floor(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * Build the Jobs to be done chunk. The item count matches team.jtbds.length
 * (one review item per JTBD) — same number the findings page shows on the
 * JTBDs inventory tile. Each item is grouped by its migration approach.
 */
export async function getJtbdsChunk(
  slug: string,
  nowMs: number,
): Promise<ReviewChunk | null> {
  const team = await prisma.team.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      jtbds: {
        orderBy: { jtbdCode: "asc" },
        select: {
          id: true,
          jtbdCode: true,
          title: true,
          category: true,
          frequency: true,
          migrationApproach: true,
        },
      },
      latestFindings: {
        select: {
          findings: {
            where: { category: "JTBDs" },
            select: {
              id: true,
              fieldPath: true,
              value: true,
              source: true,
              confidence: true,
              triedNote: true,
              status: true,
              lastActor: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });
  if (!team) return null;

  const findings = team.latestFindings?.findings ?? [];
  const findingByPath = new Map(findings.map((f) => [f.fieldPath, f]));

  // One review item per JTBD, grouped by the doc's canonical category.
  const items: Array<{ field: ReviewField; category: string }> = team.jtbds.map(
    (j) => {
      const fieldPath = `jtbds.${j.jtbdCode}.approach`;
      const finding = findingByPath.get(fieldPath);
      const state = finding
        ? stateFor(finding.status, finding.lastActor)
        : "pending";
      const approach = j.migrationApproach;
      const valueLabel =
        approach === null
          ? null
          : approach === "MOVES"
            ? "Moves to GitHub"
            : approach === "BOTH"
              ? "Runs on both"
              : approach === "MIXED"
                ? "Mixed"
                : "Stays on ADO";
      return {
        category: j.category,
        field: {
          id: finding?.id ?? `synth-${j.id}`,
          label: `${j.jtbdCode} · ${j.title}`,
          fieldPath,
          value: valueLabel,
          source: (finding?.source ?? "INFERRED") as FindingSource,
          confidence: (finding?.confidence ?? "MEDIUM") as Confidence,
          triedNote: finding?.triedNote ?? null,
          description: CANONICAL_DESCRIPTION_BY_CODE.get(j.jtbdCode) ?? null,
          whyItMatters:
            "Picking the wrong approach here means the team's daily work breaks at cutover. Make sure this matches how your team actually works.",
          question: `Does your team do this? How should it migrate?`,
          state,
          reviewedAgoLabel:
            finding &&
            (state === "accepted" ||
              state === "corrected" ||
              state === "flagged")
              ? relativeAgo(finding.updatedAt, nowMs)
              : null,
        },
      };
    },
  );

  // Render subsections in doc order; any unknown category (future-proof)
  // gets appended at the end.
  const knownCategories = new Set(CANONICAL_CATEGORIES);
  const extraCategories = Array.from(
    new Set(
      items.map((i) => i.category).filter((c) => !knownCategories.has(c)),
    ),
  ).sort();
  const orderedCategories = [...CANONICAL_CATEGORIES, ...extraCategories];

  const isHumanTouched = (f: ReviewField) =>
    f.state === "accepted" || f.state === "corrected" || f.state === "flagged";

  const subsections: ReviewSubsection[] = orderedCategories.map((name) => {
    const fields = items.filter((i) => i.category === name).map((i) => i.field);
    const reviewed = fields.filter(isHumanTouched).length;
    return {
      key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      fields,
      totalCount: fields.length,
      reviewedCount: reviewed,
      isCurrent: false,
    };
  });

  const firstPending = subsections.findIndex(
    (s) => s.totalCount > 0 && s.reviewedCount < s.totalCount,
  );
  const firstNonEmpty = subsections.findIndex((s) => s.totalCount > 0);
  const currentIdx =
    firstPending !== -1
      ? firstPending
      : firstNonEmpty !== -1
        ? firstNonEmpty
        : 0;
  if (subsections[currentIdx]) subsections[currentIdx].isCurrent = true;

  const totalFields = items.length;
  const totalReviewed = items.filter((i) => isHumanTouched(i.field)).length;

  return {
    teamName: team.name,
    teamSlug: team.slug,
    chunkLabel: "Jobs to be done",
    chunkNumber: 1,
    chunkTotal: 6,
    chunkTitle: "Jobs to be done",
    chunkSubtitle:
      "Confirm what your team does today and how each job maps to GitHub. The agent pre-accepted high-confidence items — edit any that look wrong.",
    totalFields,
    totalReviewed,
    subsections,
  };
}
