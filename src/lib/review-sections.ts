/**
 * Single source of truth for the review flow's 6 sections.
 * Each section has a URL slug, display number, label, and a short
 * job-to-be-done description used as the hero subtitle.
 *
 * Section 01 (Jobs to be done) is the only one wired to real data
 * today — 02–06 are scaffolded.
 */

export type ReviewSectionSlug =
  | "code-and-repos"
  | "pipelines-and-releases"
  | "customizations-and-integrations"
  | "identity-and-access"
  | "risks-and-mitigations";

export type ReviewSectionDef = {
  slug: ReviewSectionSlug;
  number: number; // 1..6
  label: string;
  /** Hero subtitle — framed as what the reviewer is doing in this section. */
  subtitle: string;
};

export const REVIEW_SECTIONS: ReviewSectionDef[] = [
  {
    slug: "code-and-repos",
    number: 1,
    label: "Code & repos",
    subtitle:
      "Confirm or correct each item below. The agents found these from Azure DevOps — you decide what's right.",
  },
  {
    slug: "pipelines-and-releases",
    number: 2,
    label: "Pipelines & releases",
    subtitle:
      "Confirm your build, release, and deployment picture. What stays, what moves, what needs to be rebuilt.",
  },
  {
    slug: "customizations-and-integrations",
    number: 3,
    label: "Customizations & integrations",
    subtitle:
      "Team-specific tooling the agents flagged — tasks, extensions, and third-party bridges that need a call.",
  },
  {
    slug: "identity-and-access",
    number: 4,
    label: "Identity & access",
    subtitle:
      "Users, teams, permissions, and CODEOWNERS. Who has access to what after cutover.",
  },
  {
    slug: "risks-and-mitigations",
    number: 5,
    label: "Risks & mitigations",
    subtitle: "Open risks, owners, and mitigation plans. Sign off or flag.",
  },
];

export const SECTION_BY_SLUG = new Map(REVIEW_SECTIONS.map((s) => [s.slug, s]));

export function nextSection(slug: ReviewSectionSlug): ReviewSectionDef | null {
  const current = SECTION_BY_SLUG.get(slug);
  if (!current) return null;
  return REVIEW_SECTIONS.find((s) => s.number === current.number + 1) ?? null;
}

export function prevSection(slug: ReviewSectionSlug): ReviewSectionDef | null {
  const current = SECTION_BY_SLUG.get(slug);
  if (!current) return null;
  return REVIEW_SECTIONS.find((s) => s.number === current.number - 1) ?? null;
}
