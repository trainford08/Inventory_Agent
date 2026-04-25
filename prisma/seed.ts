import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { alphaConfig } from "./cohorts/alpha";
import { bravoConfig } from "./cohorts/bravo";
import { charlieConfig } from "./cohorts/charlie";
import type { CohortShape } from "./cohorts/_helpers";
import { deltaConfig } from "./cohorts/delta";
import { echoConfig } from "./cohorts/echo";
import { foxtrotConfig } from "./cohorts/foxtrot";
import {
  countFindings,
  generateBackgroundFindings,
  withDefaultEvidence,
  type SeedFinding,
} from "./findings-generator";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function seedCohort(cfg: CohortShape) {
  // Combine generator-emitted background findings with persona-curated ones.
  const background: SeedFinding[] = generateBackgroundFindings({
    repos: cfg.repos,
    workflows: cfg.workflows,
    jtbds: cfg.jtbds,
    customizations: cfg.customizations,
    risks: cfg.risks,
    members: cfg.members,
    adoProjects: cfg.adoProjects,
    serviceConnections: cfg.serviceConnections,
    releaseDefinitions: cfg.releaseDefinitions,
    extensions: cfg.extensions,
    ownership: cfg.ownership,
    codebase: {
      primaryLang: cfg.codebase.primaryLang ?? null,
      usesLfs: cfg.codebase.usesLfs ?? false,
      totalSizeGb: cfg.codebase.totalSizeGb ?? null,
    },
    counters: {
      workItemsActive: cfg.workItemsActive,
      workItemsClosed90d: cfg.workItemsClosed90d,
      buildArtifactCount: cfg.buildArtifactCount,
      wikiPageCount: cfg.wikiPageCount,
    },
  });

  const allFindings: SeedFinding[] = withDefaultEvidence([
    ...background,
    ...cfg.curatedFindings,
  ]);
  const counts = countFindings(allFindings);

  const team = await prisma.team.create({
    data: {
      name: cfg.name,
      slug: cfg.slug,
      tagline: cfg.tagline,
      description: cfg.description,
      cohort: cfg.cohort,
      wave: cfg.wave,
      migrationState: cfg.migrationState,
      engineerCount: cfg.engineerCount,
      tier: cfg.tier,
      securityClassification: cfg.securityClassification,
      healthStatus: cfg.healthStatus,
      effortEstimateLowWeeks: cfg.effortEstimateLowWeeks,
      effortEstimateHighWeeks: cfg.effortEstimateHighWeeks,
      effortConfidence: cfg.effortConfidence,
      effortProgressWeeks: cfg.effortProgressWeeks,
      targetCutoverAt: cfg.targetCutoverAt,
      slackWeeks: cfg.slackWeeks,
      workItemsActive: cfg.workItemsActive,
      workItemsClosed90d: cfg.workItemsClosed90d,
      buildArtifactCount: cfg.buildArtifactCount,
      wikiPageCount: cfg.wikiPageCount,
      org: { connect: { id: cfg.orgId } },
      members: { create: cfg.members },
      codebase: {
        create: {
          primaryLang: cfg.codebase.primaryLang,
          usesLfs: cfg.codebase.usesLfs,
          totalSizeGb: cfg.codebase.totalSizeGb,
          repos: cfg.repos.length > 0 ? { create: cfg.repos } : undefined,
        },
      },
      workflows:
        cfg.workflows.length > 0 ? { create: cfg.workflows } : undefined,
      jtbds: cfg.jtbds.length > 0 ? { create: cfg.jtbds } : undefined,
      customizations:
        cfg.customizations.length > 0
          ? { create: cfg.customizations }
          : undefined,
      risks: cfg.risks.length > 0 ? { create: cfg.risks } : undefined,
      ownership: { create: cfg.ownership },
      adoProjects:
        cfg.adoProjects.length > 0 ? { create: cfg.adoProjects } : undefined,
      serviceConnections:
        cfg.serviceConnections.length > 0
          ? { create: cfg.serviceConnections }
          : undefined,
      releaseDefinitions:
        cfg.releaseDefinitions.length > 0
          ? { create: cfg.releaseDefinitions }
          : undefined,
      extensions:
        cfg.extensions.length > 0 ? { create: cfg.extensions } : undefined,
    },
  });

  const champion = await prisma.teamMember.findFirst({
    where: { teamId: team.id, email: cfg.championEmail },
  });
  if (!champion) {
    throw new Error(
      `Champion not found for ${cfg.slug}: expected member with email ${cfg.championEmail}`,
    );
  }

  const agentRun = await prisma.agentRun.create({
    data: {
      agentName: "ado-discovery-agent",
      startedAt: cfg.agentRun.startedAt,
      completedAt: cfg.agentRun.completedAt,
      durationMs: cfg.agentRun.durationMs,
      triggeredBy: cfg.agentRun.triggeredBy ?? "system-scheduler",
      scopeTeamId: team.id,
      ...counts,
      findings: {
        create: allFindings.map((f) => {
          // Agent auto-accept: anything the discovery agent pulled from ADO
          // with HIGH confidence lands pre-accepted. Champion only actively
          // reviews needs-input + lower-confidence items; auto-accepted ones
          // still render (compact verified row) and can be Edited if wrong.
          const isAgentAutoAccept =
            f.confidence === "HIGH" &&
            (f.source === "ADO_API" || f.source === "INFERRED");
          return {
            category: f.category,
            fieldPath: f.fieldPath,
            fieldLabel: f.fieldLabel,
            value: f.value,
            source: f.source,
            confidence: f.confidence,
            triedNote: f.triedNote,
            status: isAgentAutoAccept ? "ACCEPTED" : "PENDING",
            lastActor: isAgentAutoAccept ? "AGENT" : null,
            evidence:
              f.evidence && f.evidence.length > 0
                ? {
                    create: f.evidence.map((e) => ({
                      kind: e.kind,
                      path: e.path,
                      snippet: e.snippet ?? null,
                      metadata: e.metadata ?? null,
                      sourceUrl: e.sourceUrl ?? null,
                    })),
                  }
                : undefined,
          };
        }),
      },
    },
  });

  await prisma.team.update({
    where: { id: team.id },
    data: {
      championId: champion.id,
      latestFindingsId: agentRun.id,
    },
  });

  return { slug: cfg.slug, counts, total: allFindings.length };
}

// ---------------------------------------------------------------------------
// Wipe existing data (idempotent re-run)
// ---------------------------------------------------------------------------

// For the demo default team, mark all Scope and Access findings as
// human-reviewed (so they show "done") and mark ~40% of Customizations
// findings as human-reviewed (so that section shows partial progress).
async function applyDemoReviewState(teamSlug: string) {
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    select: { id: true, latestFindingsId: true },
  });
  if (!team || !team.latestFindingsId) return;

  const scopePrefixes = ["ownership.", "members.", "jtbds.", "adoProjects."];
  const accessPrefixes = [
    "serviceConnections.",
    "secrets.",
    "variableGroups.",
    "target.fedramp",
  ];
  const customizationPrefixes = [
    "customizations.",
    "extensions.",
    "serviceHooks.",
    "templates.",
  ];

  const markHuman = async (prefixes: string[], fraction: number) => {
    const findings = await prisma.finding.findMany({
      where: { agentRunId: team.latestFindingsId ?? undefined },
      select: { id: true, fieldPath: true },
    });
    const matching = findings.filter((f) =>
      prefixes.some((p) => f.fieldPath.startsWith(p)),
    );
    const take = Math.ceil(matching.length * fraction);
    const ids = matching.slice(0, take).map((f) => f.id);
    if (ids.length === 0) return;
    await prisma.finding.updateMany({
      where: { id: { in: ids } },
      data: { status: "ACCEPTED", lastActor: "HUMAN" },
    });
  };

  await markHuman(scopePrefixes, 1); // 100% done
  await markHuman(accessPrefixes, 1); // 100% done
  await markHuman(customizationPrefixes, 0.4); // partial ~40%
}

async function wipe() {
  await prisma.evidence.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.repo.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.jtbdEntry.deleteMany();
  await prisma.customization.deleteMany();
  await prisma.customizationCatalog.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.ownership.deleteMany();
  await prisma.codebase.deleteMany();
  await prisma.adoProject.deleteMany();
  await prisma.serviceConnection.deleteMany();
  await prisma.releaseDefinition.deleteMany();
  await prisma.extension.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.team.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.org.deleteMany();
}

async function seedCustomizationCatalog() {
  const { CUSTOMIZATION_CATALOG } =
    await import("./cohorts/customization-catalog");
  for (const entry of CUSTOMIZATION_CATALOG) {
    await prisma.customizationCatalog.create({ data: entry });
  }
  console.log(
    `  Seeded customization catalog (${CUSTOMIZATION_CATALOG.length} entries)`,
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding Migration Hub (realistic discovery run)...");

  await wipe();

  await seedCustomizationCatalog();

  const contoso = await prisma.org.create({
    data: { name: "Contoso", adoOrgSlug: "contoso-dev" },
  });

  const results = [];
  results.push(await seedCohort(alphaConfig(contoso.id)));
  results.push(await seedCohort(bravoConfig(contoso.id)));
  results.push(await seedCohort(charlieConfig(contoso.id)));
  results.push(await seedCohort(deltaConfig(contoso.id)));
  results.push(await seedCohort(echoConfig(contoso.id)));
  results.push(await seedCohort(foxtrotConfig(contoso.id)));

  // Demo fixup: for the first team (alphabetical), mark some sections as
  // human-reviewed so the sidebar sub-nav shows realistic "done" / partial
  // progress at the landing page. Without this every section reads 0/N.
  await applyDemoReviewState(results[0].slug);

  console.log("\nSeeded teams:");
  console.log("  slug      auto   input   anom   total");
  for (const r of results) {
    console.log(
      `  ${r.slug.padEnd(8)}  ${String(r.counts.autoPopulatedCount).padStart(4)}    ${String(r.counts.needsInputCount).padStart(4)}   ${String(r.counts.anomalyCount).padStart(4)}    ${String(r.total).padStart(4)}`,
    );
  }
  console.log(`\nOrg: ${contoso.name} (${contoso.adoOrgSlug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
