import { notFound } from "next/navigation";
import {
  AnomalyGroups,
  type AnomalyGroup,
} from "@/components/findings/AnomalyGroups";
import { TeamProfileHeader } from "@/components/team/TeamProfileHeader";

export const dynamic = "force-dynamic";
import {
  FindingsSummary,
  type DrawerFinding,
  type SummaryCardData,
} from "@/components/findings/FindingsSummary";
import {
  InventoryGrid,
  InventoryIcons,
  type InventoryTile,
} from "@/components/findings/InventoryGrid";
import { RunMetadata } from "@/components/findings/RunMetadata";
import { getTeamBySlug, type TeamProfile } from "@/server/teams";

const COHORT_LABEL: Record<string, string> = {
  ALPHA: "Alpha",
  BRAVO: "Bravo",
  CHARLIE: "Charlie",
  DELTA: "Delta",
  ECHO: "Echo",
  FOXTROT: "Foxtrot",
  UNASSIGNED: "Unassigned",
};

export default async function TeamFindingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  // eslint-disable-next-line react-hooks/purity -- server component renders once per request
  const nowMs = Date.now();
  const run = team.latestFindings;

  if (!run) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-6 px-[32px] py-[28px]">
        <TeamProfileHeader team={team} nowMs={nowMs} />
        <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center">
          <div className="mb-1 text-[15px] font-semibold text-ink">
            No agent findings yet
          </div>
          <p className="text-[12.5px] text-ink-muted">
            The discovery agent hasn&apos;t run for this team.
          </p>
        </div>
      </div>
    );
  }

  const cards = buildSummary(run);
  const tiles = buildInventory(team);
  const groups = buildAnomalyGroups(run.findings);
  const drawerFindings: DrawerFinding[] = run.findings.map((f) => ({
    id: f.id,
    fieldPath: f.fieldPath,
    fieldLabel: f.fieldLabel,
    category: f.category,
    source: f.source,
    confidence: f.confidence,
    value: f.value,
    triedNote: f.triedNote,
    status: f.status,
    lastActor: f.lastActor,
    evidence: f.evidence,
  }));

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-[32px] py-[28px]">
      <TeamProfileHeader team={team} nowMs={nowMs} />
      <div className="space-y-8">
        <FindingsSummary
          cards={cards}
          teamSlug={slug}
          findings={drawerFindings}
        />

        <section>
          <h3 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-ink">
            What the agent scanned
          </h3>
          <InventoryGrid tiles={tiles} />
        </section>

        <section>
          <h3 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Anomalies worth a look
          </h3>
          <AnomalyGroups groups={groups} />
        </section>

        <section>
          <RunMetadata
            run={{
              agentName: run.agentName,
              startedAt: run.startedAt,
              completedAt: run.completedAt,
              durationMs: run.durationMs,
              triggeredBy: run.triggeredBy,
            }}
          />
        </section>
      </div>
    </div>
  );
}

function buildSummary(
  run: NonNullable<TeamProfile["latestFindings"]>,
): SummaryCardData[] {
  return [
    {
      tone: "auto",
      label: "Auto-populated",
      count: run.autoPopulatedCount,
      description: "Fields the agent filled with high confidence.",
    },
    {
      tone: "input",
      label: "Need human input",
      count: run.needsInputCount,
      description: "Fields the agent couldn't determine.",
    },
    {
      tone: "anomaly",
      label: "Anomalies",
      count: run.anomalyCount,
      description: "Unusual patterns flagged for human awareness.",
    },
  ];
}

function buildInventory(team: TeamProfile): InventoryTile[] {
  const repos = team.codebase?.repos ?? [];
  const activeRepos = repos.filter((r) => !r.isArchived).length;
  const archivedRepos = repos.length - activeRepos;

  const yamlPipelines = team.workflows.filter((w) => !w.isClassic).length;
  const classicPipelines = team.workflows.length - yamlPipelines;

  const openRisks = team.risks.filter((r) => r.status === "OPEN").length;
  const mitigatedRisks = team.risks.filter(
    (r) => r.status === "MITIGATED",
  ).length;

  const customNeedsHuman = team.customizations.filter(
    (c) => c.status === "NEEDS_HUMAN",
  ).length;
  const customHandled = team.customizations.filter(
    (c) => c.status === "AGENT_HANDLED" || c.status === "RESOLVED",
  ).length;

  const memberTotal = team.members.length + (team.champion ? 1 : 0);
  const cohortLabel = COHORT_LABEL[team.cohort] ?? team.cohort;
  const waveLabel =
    team.wave !== null
      ? `Wave ${String(team.wave).padStart(2, "0")}`
      : "Unassigned wave";

  return [
    {
      key: "org",
      icon: InventoryIcons.org,
      count: 1,
      label: "Organization",
      sublabel: team.org.name,
    },
    {
      key: "cohort",
      icon: InventoryIcons.cohort,
      count:
        team.wave !== null ? `W${String(team.wave).padStart(2, "0")}` : "—",
      label: "Cohort & wave",
      sublabel: `${cohortLabel} · ${waveLabel}`,
    },
    {
      key: "repo",
      icon: InventoryIcons.repo,
      count: repos.length,
      label: "Repositories",
      sublabel:
        repos.length === 0
          ? "none scanned"
          : `${activeRepos} active · ${archivedRepos} archived`,
    },
    {
      key: "pipeline",
      icon: InventoryIcons.pipeline,
      count: team.workflows.length,
      label: "Pipelines",
      sublabel:
        team.workflows.length === 0
          ? "none detected"
          : `${yamlPipelines} YAML · ${classicPipelines} classic`,
    },
    {
      key: "jtbd",
      icon: InventoryIcons.jtbd,
      count: team.jtbds.length,
      label: "JTBDs",
      sublabel: jtbdSublabel(team.jtbds),
    },
    {
      key: "custom",
      icon: InventoryIcons.custom,
      count: team.customizations.length,
      label: "Customizations",
      sublabel:
        team.customizations.length === 0
          ? "none tracked"
          : `${customNeedsHuman} need human · ${customHandled} handled`,
    },
    {
      key: "risk",
      icon: InventoryIcons.risk,
      count: team.risks.length,
      label: "Risks",
      sublabel:
        team.risks.length === 0
          ? "none open"
          : `${openRisks} open · ${mitigatedRisks} mitigated`,
    },
    {
      key: "member",
      icon: InventoryIcons.member,
      count: memberTotal,
      label: "Team members",
      sublabel: team.champion
        ? `Champion: ${team.champion.name}`
        : "No champion",
    },
    {
      key: "ownership",
      icon: InventoryIcons.ownership,
      count: team.ownership ? "yes" : "no",
      label: "Ownership",
      sublabel: team.ownership?.onCallGroup ?? "Unassigned",
    },
  ];
}

function jtbdSublabel(jtbds: TeamProfile["jtbds"]): string {
  if (jtbds.length === 0) return "none scanned";
  const freqs = new Set(
    jtbds.map((j) => j.frequency).filter((f): f is string => f !== null),
  );
  if (freqs.size === 0) return `${jtbds.length} captured`;
  const order = ["daily", "weekly", "monthly", "quarterly", "ad-hoc", "rarely"];
  const sorted = order.filter((f) => freqs.has(f));
  if (sorted.length === 1) return `${sorted[0]} cadence`;
  return `${sorted[0]} → ${sorted[sorted.length - 1]} cadence`;
}

type FindingForAnomaly = NonNullable<
  TeamProfile["latestFindings"]
>["findings"][number];

function buildAnomalyGroups(findings: FindingForAnomaly[]): AnomalyGroup[] {
  const anomalies = findings.filter((f) => f.confidence === "LOW");
  if (anomalies.length === 0) return [];

  const byCategory = new Map<string, typeof anomalies>();
  for (const a of anomalies) {
    const key = a.category;
    const arr = byCategory.get(key) ?? [];
    arr.push(a);
    byCategory.set(key, arr);
  }

  return Array.from(byCategory.entries()).map(([category, list]) => ({
    category,
    accent: accentForCategory(category),
    anomalies: list.map((f) => ({
      id: f.id,
      title: f.fieldLabel,
      detail:
        f.triedNote ?? "Agent flagged this as inferred but low confidence.",
      confidence: f.confidence,
      fieldPath: f.fieldPath,
      value: f.value,
      updatedAt: f.updatedAt,
      evidence: f.evidence,
    })),
  }));
}

function accentForCategory(category: string): AnomalyGroup["accent"] {
  const lower = category.toLowerCase();
  if (lower.includes("repo") || lower.includes("code")) return "repos";
  if (lower.includes("pipe") || lower.includes("workflow")) return "pipes";
  if (
    lower.includes("auth") ||
    lower.includes("secret") ||
    lower.includes("sign")
  )
    return "auth";
  return "other";
}
