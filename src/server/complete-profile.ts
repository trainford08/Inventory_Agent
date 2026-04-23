import "server-only";
import { completionPercent } from "@/lib/completion";
import { getTeamBySlug, type TeamProfile } from "./teams";

export type CompleteProfileSection = {
  key:
    | "scope"
    | "code"
    | "access"
    | "customizations"
    | "dependencies"
    | "readiness";
  title: string;
  description: string;
  estimateMin: number;
  totalCount: number;
  totalLabel: string;
  reviewedCount: number;
  progressPct: number;
  bestFit: string | null;
  better: string | null;
};

export type CompleteProfileData = {
  teamName: string;
  teamSlug: string;
  lastSavedLabel: string;
  hasStarted: boolean;
  counters: {
    autoPopulated: number;
    needHumanInput: number;
    judgmentCalls: number;
    profileComplete: number;
  };
  sections: CompleteProfileSection[];
};

const SECTION_DEFS: Array<{
  key: CompleteProfileSection["key"];
  title: string;
  description: string;
  estimateMin: number;
  totalLabel: string;
  bestFit: string | null;
  better: string | null;
  fieldPathPrefixes: string[];
  getTotal: (team: TeamProfile) => number;
}> = [
  {
    key: "scope",
    title: "Scope & stakeholders",
    description:
      "Who owns this team, what's in-scope for migration, and who the stakeholders are.",
    estimateMin: 4,
    totalLabel: "details",
    bestFit: "EM",
    better: null,
    fieldPathPrefixes: ["ownership.", "members.", "jtbds.", "adoProjects."],
    getTotal: (t) =>
      (t.champion ? 1 : 0) +
      t.members.length +
      t.jtbds.length +
      t.adoProjects.length,
  },
  {
    key: "code",
    title: "Code & repos",
    description:
      "Repositories, pipelines, build customizations. Most auto-populated — mostly confirmations.",
    estimateMin: 8,
    totalLabel: "repositories",
    bestFit: null,
    better: "RELEASE ENG",
    fieldPathPrefixes: [
      "codebase.",
      "repos.",
      "workflows.",
      "releaseDefinitions.",
    ],
    getTotal: (t) => t.codebase?.repos.length ?? 0,
  },
  {
    key: "access",
    title: "Access & identity",
    description:
      "Service accounts, PATs, permission groups, and secret references.",
    estimateMin: 5,
    totalLabel: "accounts",
    bestFit: null,
    better: "OPS / SECURITY",
    fieldPathPrefixes: [
      "serviceConnections.",
      "secrets.",
      "variableGroups.",
      "target.fedramp",
    ],
    getTotal: (t) => t.serviceConnections.length,
  },
  {
    key: "customizations",
    title: "Customizations",
    description:
      "Service hooks, extensions, custom tasks, and things that don't map 1:1 to GitHub.",
    estimateMin: 6,
    totalLabel: "customizations",
    bestFit: null,
    better: "PLATFORM LEAD",
    fieldPathPrefixes: [
      "customizations.",
      "extensions.",
      "serviceHooks.",
      "templates.",
    ],
    getTotal: (t) => t.customizations.length + t.extensions.length,
  },
  {
    key: "dependencies",
    title: "Dependencies",
    description:
      "Teams your team relies on, and teams that rely on you. Drives migration sequencing.",
    estimateMin: 4,
    totalLabel: "dependencies",
    bestFit: null,
    better: null,
    fieldPathPrefixes: ["submodules.", "adoProjects.", "workItems."],
    getTotal: (t) => {
      const submoduleCount = (t.codebase?.repos ?? []).reduce(
        (n, r) => n + (r.submoduleUrls?.length ?? 0),
        0,
      );
      return submoduleCount + t.adoProjects.length;
    },
  },
  {
    key: "readiness",
    title: "Readiness & risks",
    description:
      "Training, leadership alignment, blockers, compliance constraints.",
    estimateMin: 3,
    totalLabel: "items",
    bestFit: "EM",
    better: null,
    fieldPathPrefixes: ["risks.", "migration.", "workflows.deprecated"],
    getTotal: (t) => t.risks.length,
  },
];

function matchesPrefix(fieldPath: string, prefixes: string[]): boolean {
  return prefixes.some((p) => fieldPath.startsWith(p));
}

function formatLastSaved(date: Date | null, nowMs: number): string {
  if (date === null) return "not started yet";
  const diffMs = nowMs - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export async function getCompleteProfileData(
  slug: string,
  nowMs: number,
): Promise<CompleteProfileData | null> {
  const team = await getTeamBySlug(slug);
  if (!team) return null;

  const findings = team.latestFindings?.findings ?? [];
  const humanReviewed = findings.filter(
    (f) => f.lastActor === "HUMAN" && f.status !== "PENDING",
  );
  const lastSavedAt =
    humanReviewed
      .map((f) => f.updatedAt)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const autoPopulated = team.latestFindings?.autoPopulatedCount ?? 0;
  const needHumanInput = team.latestFindings?.needsInputCount ?? 0;
  const judgmentCalls = team.latestFindings?.anomalyCount ?? 0;
  const profileComplete = completionPercent(findings);

  const sections: CompleteProfileSection[] = SECTION_DEFS.map((def) => {
    const total = def.getTotal(team);
    // Reviewed count = how many findings that match this section's prefixes
    // have been human-verified. Capped at total so the ring never over-fills.
    const matched = findings.filter((f) =>
      matchesPrefix(f.fieldPath, def.fieldPathPrefixes),
    );
    const reviewedRaw = matched.filter(
      (f) => f.lastActor === "HUMAN" && f.status !== "PENDING",
    ).length;
    const reviewedCount = Math.min(reviewedRaw, total);
    const progressPct =
      total > 0 ? Math.round((reviewedCount / total) * 100) : 0;
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      estimateMin: def.estimateMin,
      totalCount: total,
      totalLabel: def.totalLabel,
      reviewedCount,
      progressPct,
      bestFit: def.bestFit,
      better: def.better,
    };
  });

  return {
    teamName: team.name,
    teamSlug: team.slug,
    lastSavedLabel: formatLastSaved(lastSavedAt, nowMs),
    hasStarted: humanReviewed.length > 0,
    counters: {
      autoPopulated,
      needHumanInput,
      judgmentCalls,
      profileComplete,
    },
    sections,
  };
}
