import "server-only";
import type {
  Confidence,
  FindingSource,
  LastActor,
} from "@/generated/prisma/enums";
import { prisma } from "./db";
import type {
  ReviewChunk,
  ReviewField,
  ReviewSubsection,
} from "./review-chunk";

function stateFor(
  status: "PENDING" | "ACCEPTED" | "CORRECTED" | "OVERRIDDEN",
  lastActor: LastActor | null,
): ReviewField["state"] {
  if (lastActor === "HUMAN") {
    if (status === "ACCEPTED") return "accepted";
    if (status === "CORRECTED") return "corrected";
    if (status === "OVERRIDDEN") return "flagged";
    return "pending";
  }
  if (lastActor === "AGENT" && status === "ACCEPTED") return "agent_accepted";
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

type ItemInput = {
  fieldPath: string;
  question: string;
  value: string | null;
  source: FindingSource;
  confidence: Confidence;
  description: string;
  whyItMatters: string;
  synthId: string;
  label: string;
  editKind?: "text" | "boolean" | "enum" | "multiselect";
  editOptions?: string[];
};

/**
 * Build the Code & repos chunk — section 02 of the review flow. Subsections
 * mirror the mock: Organization, Projects, Repositories, Pipelines,
 * Classic releases. Each item is framed as a question the Champion answers
 * with Accept / Edit / Not sure / Flag.
 */
export async function getCodeReposChunk(
  slug: string,
  nowMs: number,
  requestedSubsectionKey?: string,
  /** Which repo to scope the Repositories subsection to. The reviewer
   *  confirms one repo's attributes at a time, then advances. */
  requestedRepoId?: string,
): Promise<ReviewChunk | null> {
  const team = await prisma.team.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      org: { select: { name: true, adoOrgSlug: true } },
      members: { select: { name: true, email: true } },
      adoProjects: {
        select: {
          id: true,
          name: true,
          description: true,
          visibility: true,
          repoCount: true,
          pipelineCount: true,
        },
      },
      codebase: {
        select: {
          repos: {
            select: {
              id: true,
              name: true,
              defaultBranch: true,
              sizeGb: true,
              hasLfs: true,
              hasSubmodules: true,
              lastCommitAt: true,
              isArchived: true,
              primaryOwner: true,
              branchProtected: true,
              contributorCount: true,
              commits90d: true,
              lfsSizeGb: true,
            },
          },
        },
      },
      workflows: {
        select: {
          id: true,
          name: true,
          type: true,
          averageDurationMin: true,
          triggersPerWeek: true,
        },
      },
      releaseDefinitions: {
        select: {
          id: true,
          name: true,
          stages: true,
          isClassic: true,
          hasManualGates: true,
          gateTypes: true,
        },
      },
      latestFindings: {
        select: {
          findings: {
            where: {
              OR: [
                { category: "Code & repos" },
                { category: "Pipelines" },
                { category: "Organization" },
              ],
            },
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

  function toField(i: ItemInput): ReviewField {
    const finding = findingByPath.get(i.fieldPath);
    const state = finding
      ? stateFor(finding.status, finding.lastActor)
      : "pending";
    return {
      id: finding?.id ?? i.synthId,
      label: i.label,
      fieldPath: i.fieldPath,
      value: finding?.value ?? i.value,
      source: (finding?.source ?? i.source) as FindingSource,
      confidence: (finding?.confidence ?? i.confidence) as Confidence,
      triedNote: finding?.triedNote ?? null,
      description: i.description,
      whyItMatters: i.whyItMatters,
      question: i.question,
      editKind: i.editKind,
      editOptions: i.editOptions,
      state,
      reviewedAgoLabel:
        finding &&
        (state === "accepted" || state === "corrected" || state === "flagged")
          ? relativeAgo(finding.updatedAt, nowMs)
          : null,
    };
  }

  // ─── Organization ──────────────────────────────────────────────────────
  const org = team.org;
  const organizationItems: ReviewField[] = [
    toField({
      synthId: `syn-org-name`,
      fieldPath: "organization.name",
      question: "Is this the right ADO organization?",
      value: org?.name ?? null,
      source: "ADO_API",
      confidence: "HIGH",
      description:
        "The Azure DevOps organization this team lives under. Everything in this review scopes to it.",
      whyItMatters:
        "If the org is wrong, every repository, pipeline, and permission downstream is wrong. Catch it before the team spends time reviewing the rest.",
      label: "Organization",
      editKind: "text",
    }),
  ];

  // ─── Projects ──────────────────────────────────────────────────────────
  const projectItems: ReviewField[] = team.adoProjects.map((p) =>
    toField({
      synthId: `syn-proj-${p.id}`,
      fieldPath: `adoProjects.${p.id}.name`,
      question: `Does project "${p.name}" still belong to this team?`,
      value: `${p.name} · ${p.repoCount} repo${p.repoCount === 1 ? "" : "s"} · ${p.pipelineCount} pipeline${p.pipelineCount === 1 ? "" : "s"}`,
      source: "ADO_API",
      confidence: "HIGH",
      description:
        p.description ??
        "An Azure DevOps project — the container for repos, pipelines, boards, and feeds under this team.",
      whyItMatters:
        "Projects not owned by this team shouldn't be in scope. Catching a wrong one here saves hours of rework.",
      label: p.name,
      editKind: "text",
    }),
  );

  // ─── Repositories ──────────────────────────────────────────────────────
  // Each repo emits a set of pre-filled attribute fields the agent found
  // in ADO. The Champion confirms (or edits) each. Label text matches the
  // mock: "Repository name", "Primary owner", "Default branch",
  // "Uses Git LFS?", etc.
  //
  // DEMO STARTING STATE: the first N repos are pre-marked "accepted" so
  // the reviewer lands on a partially-completed page (mock: 4 of 18
  // repositories reviewed). Drop this block when real persistence lands.
  const DEMO_PREACCEPTED_REPO_COUNT = 4;
  const repos = team.codebase?.repos ?? [];
  const memberEmails = team.members.map((m) => m.email);
  const visibilityOptions = ["private", "internal", "public", "archived"];
  // Common default-branch choices. Include the repo's current value so the
  // select doesn't force a change to pick one of the defaults.
  const branchOptionsBase = ["main", "master", "develop", "trunk"];
  const branchProtectionOptions = [
    "required reviewers",
    "build validation",
    "work item linked",
    "comment resolution",
    "no protections set",
  ];
  const preacceptedRepoIds = new Set(
    repos.slice(0, DEMO_PREACCEPTED_REPO_COUNT).map((r) => r.id),
  );
  // Attributes that the reviewer has already confirmed on the currently-
  // in-progress repo. Six of the eight attrs start accepted; LFS and
  // submodules remain pending so the Champion can see active cards.
  const DEMO_CURRENT_REPO_PREACCEPTED_ATTRS = new Set([
    "primaryOwner",
    "defaultBranch",
    "visibility",
    "contributorCount",
    "branchProtected",
    "hasSubmodules",
  ]);
  const currentRepo =
    (requestedRepoId && repos.find((r) => r.id === requestedRepoId)) ||
    repos.find((r) => !preacceptedRepoIds.has(r.id)) ||
    repos[0];
  const currentRepoId = currentRepo?.id ?? null;
  const currentRepoName = currentRepo?.name ?? null;
  const repoItems: ReviewField[] = repos.flatMap((r) => {
    const items: ReviewField[] = [];

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-name`,
        fieldPath: `repos.${r.name}.name`,
        question: "Repository name",
        value: r.name,
        source: "ADO_API",
        confidence: "HIGH",
        description:
          "The repository's name in Azure DevOps. It'll carry over as the GitHub repo name unless you rename it during migration.",
        whyItMatters:
          "Renaming mid-migration breaks URLs baked into pipelines, docs, and bookmarks. Confirm now rather than after cutover.",
        label: "Repository name",
        editKind: "text",
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-owner`,
        fieldPath: `repos.${r.name}.primaryOwner`,
        question: "Primary owner",
        value: r.primaryOwner ?? null,
        source: r.primaryOwner ? "ADO_API" : "INFERRED",
        confidence: r.primaryOwner ? "HIGH" : "LOW",
        description:
          "Who owns this repository day-to-day — the person who approves changes, manages access, and fields questions.",
        whyItMatters:
          "Ownership drives who signs off on cutover, who gets admin access on GitHub, and who the migration agent pings for decisions.",
        label: "Primary owner",
        editKind: "enum",
        editOptions: memberEmails,
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-branch`,
        fieldPath: `repos.${r.name}.defaultBranch`,
        question: "Default branch",
        value: r.defaultBranch,
        source: "ADO_API",
        confidence: "HIGH",
        description:
          "The branch that opens by default and that PRs target unless otherwise specified.",
        whyItMatters:
          "Many teams use this migration to rename master → main. If you want to switch, flag this item so the agent does the rename at cutover.",
        label: "Default branch",
        editKind: "enum",
        editOptions: Array.from(
          new Set([r.defaultBranch, ...branchOptionsBase]),
        ),
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-visibility`,
        fieldPath: `repos.${r.name}.visibility`,
        question: "Visibility",
        value: r.isArchived ? "archived" : "private",
        source: "ADO_API",
        confidence: "HIGH",
        description:
          "Whether the repo is private, internal, public, or archived in ADO.",
        whyItMatters:
          "Mapping visibility wrong at cutover means either a private repo exposed, or collaborators losing access. Double-check archived repos — they often shouldn't migrate at all.",
        label: "Visibility",
        editKind: "enum",
        editOptions: visibilityOptions,
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-lfs`,
        fieldPath: `repos.${r.name}.hasLfs`,
        question: "Uses Git LFS?",
        value: r.hasLfs
          ? r.lfsSizeGb != null
            ? `true · ${r.lfsSizeGb.toFixed(1)} GB of LFS objects`
            : "true"
          : "false",
        source: "ADO_API",
        confidence: "HIGH",
        description:
          "Whether this repo uses Git Large File Storage to track large binary files outside the main Git history.",
        whyItMatters:
          "Changes the migration strategy. LFS repos need a different GEI path and additional post-migration steps.",
        label: "Uses Git LFS?",
        editKind: "boolean",
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-submodules`,
        fieldPath: `repos.${r.name}.hasSubmodules`,
        question: "Has submodules?",
        value: r.hasSubmodules ? "true" : "false",
        source: "ADO_API",
        confidence: "HIGH",
        description:
          "Whether this repo references other repos as git submodules.",
        whyItMatters:
          "Submodule URLs need to be rewritten after migration — every consuming repo must be updated or builds break.",
        label: "Has submodules?",
        editKind: "boolean",
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-protection`,
        fieldPath: `repos.${r.name}.branchProtected`,
        question: "Active branch-protection rules?",
        value: r.branchProtected
          ? "yes · default branch protected"
          : "no protections set",
        source: "ADO_API",
        confidence: "HIGH",
        description:
          "Whether this repo enforces branch policies (required reviewers, build validation, linked work items) on its default branch.",
        whyItMatters:
          "These rules need to be recreated as GitHub branch-protection rules after migration. Missing them means code can merge without the checks your team relies on.",
        label: "Active branch-protection rules?",
        editKind: "multiselect",
        editOptions: branchProtectionOptions,
      }),
    );

    items.push(
      toField({
        synthId: `syn-repo-${r.id}-contributors`,
        fieldPath: `repos.${r.name}.contributorCount`,
        question: "Who else commits here regularly?",
        value:
          r.contributorCount != null
            ? `${r.contributorCount} contributor${r.contributorCount === 1 ? "" : "s"} in the last 90 days · ${r.commits90d ?? 0} commit${(r.commits90d ?? 0) === 1 ? "" : "s"}`
            : "unknown — agent could not infer contributor list",
        source: "INFERRED",
        confidence: r.contributorCount != null ? "MEDIUM" : "LOW",
        description:
          "Contributors beyond the primary owner — who's been actively committing code to this repo in the last 90 days.",
        whyItMatters:
          "These people need GitHub access provisioned before cutover weekend. Missing someone means they can't commit after migration until access is fixed.",
        label: "Who else commits here regularly?",
        editKind: "multiselect",
        editOptions: memberEmails,
      }),
    );

    // DEMO: pre-accept every attribute of the first N repos so the Champion
    // lands on a partially-reviewed page. Only overrides items still in
    // their default agent-accepted state — once the user has touched an
    // item (accepted / edited / flagged / undone), respect the DB.
    if (preacceptedRepoIds.has(r.id)) {
      for (const it of items) {
        if (it.state === "agent_accepted") {
          it.state = "accepted";
          it.reviewedAgoLabel = "2 min ago";
        }
      }
    }
    // DEMO: on the currently-in-progress repo, pre-accept the top attrs so
    // the reviewer sees "mid-review" state (matches the mock: name, owner,
    // branch, visibility reviewed; LFS, submodules, protection, contributors
    // still pending). Same gating — don't clobber user-touched state.
    if (r.id === currentRepoId) {
      for (const it of items) {
        const attr = it.fieldPath.split(".").pop() ?? "";
        if (
          DEMO_CURRENT_REPO_PREACCEPTED_ATTRS.has(attr) &&
          it.state === "agent_accepted"
        ) {
          it.state = "accepted";
          it.reviewedAgoLabel =
            attr === "name" || attr === "primaryOwner"
              ? "2 min ago"
              : "3 min ago";
        }
      }
    }

    return items;
  });

  // Scope the Repositories subsection to only the currently-in-progress repo.
  // The sidebar still shows "4/18 repositories" — that count is subject-level.
  const visibleRepoItems = repoItems.filter((f) =>
    currentRepoName
      ? f.fieldPath.startsWith(`repos.${currentRepoName}.`)
      : false,
  );

  // ─── Pipelines ─────────────────────────────────────────────────────────
  const pipelineItems: ReviewField[] = team.workflows.map((w) =>
    toField({
      synthId: `syn-wf-${w.id}`,
      fieldPath: `workflows.${w.id}.name`,
      question: `Does ${w.name} run today?`,
      value: `${w.type} · ~${w.averageDurationMin} min · ${w.triggersPerWeek}/week`,
      source: "ADO_API",
      confidence: "HIGH",
      description: `${w.type} pipeline averaging ${w.averageDurationMin} min per run, triggered ~${w.triggersPerWeek} times per week.`,
      whyItMatters:
        "Stale pipelines waste review cycles and cloud more important decisions. Confirm what's actually in use.",
      label: w.name,
      editKind: "text",
    }),
  );

  // ─── Classic releases ──────────────────────────────────────────────────
  const classicReleases = team.releaseDefinitions.filter((r) => r.isClassic);
  const releaseItems: ReviewField[] = classicReleases.map((r) =>
    toField({
      synthId: `syn-rel-${r.id}`,
      fieldPath: `releaseDefinitions.${r.id}.name`,
      question: `Keep ${r.name} in ADO for the hybrid?`,
      value: `${r.stages} stage${r.stages === 1 ? "" : "s"}${r.hasManualGates ? " · manual gates" : ""}${r.gateTypes.length ? ` · ${r.gateTypes.join(", ")}` : ""}`,
      source: "ADO_API",
      confidence: "MEDIUM",
      description:
        "A Classic (UI-configured) Release Definition. These have no direct GitHub Actions migration path.",
      whyItMatters:
        "Classic releases usually stay in ADO under the hybrid model because rebuild cost is high. Confirm the call before a pipeline rewrite lands on someone's plate.",
      label: r.name,
      editKind: "text",
    }),
  );

  const isHumanTouched = (f: ReviewField) =>
    f.state === "accepted" || f.state === "corrected" || f.state === "flagged";

  // Subject-level progress for Repositories: count a repo "reviewed" when
  // every attribute item for that repo is human-touched. Sidebar uses this
  // so the Champion sees "0 of 18 repositories" not "0 of 144 items".
  const repoItemsByRepo = new Map<string, ReviewField[]>();
  for (const r of repos) {
    repoItemsByRepo.set(
      r.id,
      repoItems.filter((f) => f.fieldPath.startsWith(`repos.${r.name}.`)),
    );
  }
  const reposReviewed = Array.from(repoItemsByRepo.values()).filter(
    (itemsForRepo) =>
      itemsForRepo.length > 0 && itemsForRepo.every(isHumanTouched),
  ).length;

  const subsectionDefs: Array<{
    key: string;
    name: string;
    fields: ReviewField[];
    subjectTotalCount?: number;
    subjectReviewedCount?: number;
    subjectNoun?: string;
    currentSubjectName?: string;
    nextSubjectHref?: string;
    nextSubjectName?: string;
  }> = [
    { key: "organization", name: "Organization", fields: organizationItems },
    { key: "projects", name: "Projects", fields: projectItems },
    {
      key: "repositories",
      name: "Repositories",
      fields: visibleRepoItems,
      subjectTotalCount: repos.length,
      subjectReviewedCount: reposReviewed,
      subjectNoun: "repositories",
      currentSubjectName: currentRepo?.name,
      nextSubjectHref: (() => {
        if (!currentRepoId) return undefined;
        const idx = repos.findIndex((r) => r.id === currentRepoId);
        const nextRepo = repos
          .slice(idx + 1)
          .find((r) => !preacceptedRepoIds.has(r.id));
        return nextRepo
          ? `/teams/${team.slug}/review/code-and-repos?sub=repositories&repo=${nextRepo.id}`
          : undefined;
      })(),
      nextSubjectName: (() => {
        if (!currentRepoId) return undefined;
        const idx = repos.findIndex((r) => r.id === currentRepoId);
        const nextRepo = repos
          .slice(idx + 1)
          .find((r) => !preacceptedRepoIds.has(r.id));
        return nextRepo?.name;
      })(),
    },
    { key: "pipelines", name: "Pipelines", fields: pipelineItems },
    { key: "classic-releases", name: "Classic releases", fields: releaseItems },
  ];

  const subsections: ReviewSubsection[] = subsectionDefs.map((def) => ({
    key: def.key,
    name: def.name,
    fields: def.fields,
    totalCount: def.fields.length,
    reviewedCount: def.fields.filter(isHumanTouched).length,
    subjectTotalCount: def.subjectTotalCount,
    subjectReviewedCount: def.subjectReviewedCount,
    subjectNoun: def.subjectNoun,
    currentSubjectName: def.currentSubjectName,
    nextSubjectHref: def.nextSubjectHref,
    nextSubjectName: def.nextSubjectName,
    isCurrent: false,
  }));

  // Current = requested subsection if valid, otherwise default to
  // Repositories. (Organization / Projects / Pipelines / Classic releases
  // don't have designs yet — the reviewer always lands on Repositories.)
  const requestedIdx = requestedSubsectionKey
    ? subsections.findIndex(
        (s) => s.key === requestedSubsectionKey && s.totalCount > 0,
      )
    : -1;
  const repositoriesIdx = subsections.findIndex(
    (s) => s.key === "repositories" && s.totalCount > 0,
  );
  const firstNonEmpty = subsections.findIndex((s) => s.totalCount > 0);
  const idx =
    requestedIdx !== -1
      ? requestedIdx
      : repositoriesIdx !== -1
        ? repositoriesIdx
        : Math.max(firstNonEmpty, 0);
  if (subsections[idx]) subsections[idx].isCurrent = true;

  const totalFields = subsections.reduce((sum, s) => sum + s.totalCount, 0);
  const totalReviewed = subsections.reduce(
    (sum, s) => sum + s.reviewedCount,
    0,
  );

  return {
    teamName: team.name,
    teamSlug: team.slug,
    chunkLabel: "Code & repos",
    chunkNumber: 1,
    chunkTotal: 5,
    chunkTitle: "Code & repositories",
    chunkSubtitle:
      "Confirm or correct each item below. The agents found these from Azure DevOps — you decide what's right.",
    totalFields,
    totalReviewed,
    subsections,
  };
}
