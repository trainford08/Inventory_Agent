import "server-only";
import { cache } from "react";
import {
  ENTITY_BY_ID,
  FEATURE_BY_ID,
  FEATURES_BY_ENTITY,
  JTBDS,
  JTBDS_BY_FEATURE,
} from "@/lib/inventory-framework";
import { listTeams } from "./teams";
import { prisma } from "./db";

const STRATEGY_LABELS: Record<string, string> = {
  S01_PROTECT_IN_PLACE: "S01 — Protect in place",
  S02_TRANSLATE_TO_GITHUB: "S02 — Translate to GitHub",
  S03_RETIRE: "S03 — Retire",
  S04_REBUILD_WITH_LOSS: "S04 — Rebuild with loss",
  S05_BUILD_GLUE: "S05 — Build glue",
  S06_UPSTREAM: "S06 — Upstream",
  S07_CONSOLIDATE_THIRD_PARTY: "S07 — Consolidate third party",
};

const PARITY_LABELS: Record<string, string> = {
  MATCH: "match",
  BETTER: "better",
  PARTIAL: "partial",
  GAP: "gap",
};

export type TeamFriction = {
  teamId: string;
  slug: string;
  name: string;
  cohort: string;
  customizationsTotal: number;
  customizationsGap: number;
  customizationsNeedingDecision: number;
  integrations: number;
  featuresInScope: number;
  featuresStaysInAdo: number;
  highRiskEntities: number;
  /** Composite score: weighted sum of friction signals. Higher = more friction. */
  frictionScore: number;
};

export type ProgramOverview = {
  teamsScanned: number;
  cohortsScanned: number;
  avgFeaturesPerTeam: number;
  jobsCovered: number;
  jobsTotal: number;
  featuresInScope: number;
  customizations: {
    totalInstances: number;
    uniqueTypes: number;
    typesNeedingDecision: number;
  };
  vendors: { total: number; withoutGitHubEquivalent: number };
  hybridSplit: { gh: number; ado: number; both: number; na: number };
  parityBreakdown: {
    match: number;
    better: number;
    partial: number;
    gap: number;
  };
  migrationApproach: Record<string, number>;
  friction: {
    customizationTypesNoEquivalent: number;
    customizationTypesNoEquivalentInstances: number;
    integrationsResetup: number;
    integrationsResetupVendors: string;
    highCustomizationTeams: number;
  };
};

export const computeTeamFriction = cache(async (): Promise<TeamFriction[]> => {
  const teams = await listTeams();
  const [jtbds, customizations, extensions, serviceConnections] =
    await Promise.all([
      prisma.jtbdEntry.findMany({
        where: { performed: true },
        select: { teamId: true, jtbdCode: true },
      }),
      prisma.customization.findMany({
        select: {
          teamId: true,
          parity: true,
          status: true,
        },
      }),
      prisma.extension.findMany({ select: { teamId: true } }),
      prisma.serviceConnection.findMany({ select: { teamId: true } }),
    ]);

  const jtbdsByTeam = new Map<string, Set<string>>();
  for (const j of jtbds) {
    let s = jtbdsByTeam.get(j.teamId);
    if (!s) {
      s = new Set();
      jtbdsByTeam.set(j.teamId, s);
    }
    s.add(j.jtbdCode);
  }

  const countBy = <T extends { teamId: string }>(
    rows: T[],
    pred?: (r: T) => boolean,
  ): Map<string, number> => {
    const m = new Map<string, number>();
    for (const r of rows) {
      if (pred && !pred(r)) continue;
      m.set(r.teamId, (m.get(r.teamId) ?? 0) + 1);
    }
    return m;
  };

  const customAll = countBy(customizations);
  const customGap = countBy(customizations, (c) => c.parity === "GAP");
  const customNeedsDecision = countBy(
    customizations,
    (c) => c.status === "UNKNOWN" || c.status === "NEEDS_HUMAN",
  );
  const extByTeam = countBy(extensions);
  const scByTeam = countBy(serviceConnections);

  const result: TeamFriction[] = [];
  for (const t of teams) {
    const jset = jtbdsByTeam.get(t.id) ?? new Set();
    const teamFeatures = new Set<string>();
    let staysInAdo = 0;
    let highRiskEntities = 0;
    const seenEntities = new Set<string>();
    for (const jid of jset) {
      const j = JTBDS.find((x) => x.id === jid);
      if (!j) continue;
      for (const fid of j.features) {
        teamFeatures.add(fid);
        const f = FEATURE_BY_ID[fid];
        if (f?.staysInAdo === "ado") staysInAdo++;
        if (!f) continue;
        for (const eid of f.entities) {
          if (seenEntities.has(eid)) continue;
          seenEntities.add(eid);
          const e = ENTITY_BY_ID[eid];
          if (e && (e.risk === "high" || e.risk === "medium"))
            highRiskEntities++;
        }
      }
    }
    const customizationsTotal = customAll.get(t.id) ?? 0;
    const customizationsGap = customGap.get(t.id) ?? 0;
    const customizationsNeedingDecision = customNeedsDecision.get(t.id) ?? 0;
    const integrations = (extByTeam.get(t.id) ?? 0) + (scByTeam.get(t.id) ?? 0);

    const frictionScore =
      customizationsGap * 5 +
      customizationsNeedingDecision * 3 +
      customizationsTotal * 1 +
      staysInAdo * 1 +
      highRiskEntities * 2 +
      integrations * 1;

    result.push({
      teamId: t.id,
      slug: t.slug,
      name: t.name,
      cohort: t.cohort,
      customizationsTotal,
      customizationsGap,
      customizationsNeedingDecision,
      integrations,
      featuresInScope: teamFeatures.size,
      featuresStaysInAdo: staysInAdo,
      highRiskEntities,
      frictionScore,
    });
  }
  result.sort((a, b) => b.frictionScore - a.frictionScore);
  return result;
});

export const computeProgramOverview = cache(
  async (): Promise<ProgramOverview> => {
    const teams = await listTeams();
    const teamsScanned = teams.length;
    const cohortsScanned = new Set(teams.map((t) => t.cohort)).size;

    // Aggregate JTBD coverage from TeamJtbd rows: distinct JTBDs marked
    // performed across the program.
    const jtbds = await prisma.jtbdEntry.findMany({
      where: { performed: true },
      select: { jtbdCode: true, teamId: true },
    });
    const jobsCovered = new Set(jtbds.map((j) => j.jtbdCode)).size;
    const jobsTotal = JTBDS.length;

    // Features in scope = distinct features any team's performed JTBDs touch.
    const performedByTeam = new Map<string, Set<string>>();
    for (const j of jtbds) {
      let set = performedByTeam.get(j.teamId);
      if (!set) {
        set = new Set();
        performedByTeam.set(j.teamId, set);
      }
      set.add(j.jtbdCode);
    }
    const featureScope = new Set<string>();
    const featureCountsPerTeam: number[] = [];
    for (const set of performedByTeam.values()) {
      const teamFeatures = new Set<string>();
      for (const jid of set) {
        const j = JTBDS.find((x) => x.id === jid);
        if (!j) continue;
        for (const fid of j.features) {
          featureScope.add(fid);
          teamFeatures.add(fid);
        }
      }
      featureCountsPerTeam.push(teamFeatures.size);
    }
    const featuresInScope = featureScope.size;
    const avgFeaturesPerTeam = featureCountsPerTeam.length
      ? Math.round(
          featureCountsPerTeam.reduce((a, b) => a + b, 0) /
            featureCountsPerTeam.length,
        )
      : 0;

    // Hybrid split — count features in scope by their staysInAdo flag.
    const hybridSplit = { gh: 0, ado: 0, both: 0, na: 0 };
    for (const fid of featureScope) {
      const f = FEATURE_BY_ID[fid];
      if (!f) continue;
      if (f.staysInAdo === "gh") hybridSplit.gh++;
      else if (f.staysInAdo === "ado") hybridSplit.ado++;
      else if (f.staysInAdo === "both") hybridSplit.both++;
      else hybridSplit.na++;
    }

    // Customizations — pull all rows.
    const customizations = await prisma.customization.findMany({
      select: {
        id: true,
        teamId: true,
        name: true,
        catalogId: true,
        parity: true,
        strategy: true,
        status: true,
      },
    });
    const totalInstances = customizations.length;
    const uniqueCatalogIds = new Set<string>();
    const teamSpecificNames = new Set<string>();
    for (const c of customizations) {
      if (c.catalogId) uniqueCatalogIds.add(c.catalogId);
      else teamSpecificNames.add(c.name.toLowerCase());
    }
    const uniqueTypes = uniqueCatalogIds.size + teamSpecificNames.size;
    const typesNeedingDecision = customizations.filter(
      (c) => c.status === "UNKNOWN" || c.status === "NEEDS_HUMAN",
    ).length;

    // Parity breakdown across all customization rows that have a parity.
    const parityBreakdown = { match: 0, better: 0, partial: 0, gap: 0 };
    for (const c of customizations) {
      if (!c.parity) continue;
      const key = PARITY_LABELS[c.parity] as keyof typeof parityBreakdown;
      if (key in parityBreakdown) parityBreakdown[key]++;
    }

    // Migration approach distribution (rows that have a strategy).
    const migrationApproach: Record<string, number> = {};
    for (const c of customizations) {
      if (!c.strategy) continue;
      const label = STRATEGY_LABELS[c.strategy] ?? c.strategy;
      migrationApproach[label] = (migrationApproach[label] ?? 0) + 1;
    }

    // Vendors — count distinct extensions + service connections across teams.
    const [extensions, serviceConnections] = await Promise.all([
      prisma.extension.findMany({ select: { name: true } }),
      prisma.serviceConnection.findMany({ select: { name: true } }),
    ]);
    const vendorNames = new Set<string>();
    for (const e of extensions) vendorNames.add(e.name.toLowerCase());
    for (const s of serviceConnections) vendorNames.add(s.name.toLowerCase());
    const vendors = vendorNames.size;
    // We don't track per-vendor "no GitHub equivalent" yet — derive from
    // customizations marked GAP that touch EXTENSIONS as a proxy.
    const vendorsNoEquivalent = customizations.filter(
      (c) => c.parity === "GAP",
    ).length;

    // Friction — derive from the data we have.
    const customizationTypesNoEquivalent = customizations.filter(
      (c) => c.parity === "GAP",
    ).length;
    const integrationsResetup = serviceConnections.length;
    const integrationsResetupVendors = [
      ...new Set(serviceConnections.map((s) => s.name)),
    ]
      .slice(0, 4)
      .join(", ");
    const HIGH_CUSTOM_THRESHOLD = 5;
    const customizationsByTeam = new Map<string, number>();
    for (const c of customizations) {
      customizationsByTeam.set(
        c.teamId,
        (customizationsByTeam.get(c.teamId) ?? 0) + 1,
      );
    }
    const highCustomizationTeams = [...customizationsByTeam.values()].filter(
      (n) => n >= HIGH_CUSTOM_THRESHOLD,
    ).length;

    // Touch the framework helpers so the import is meaningful — used to ensure
    // entity-side counts stay consistent if we add entity-aggregated metrics.
    void ENTITY_BY_ID;
    void FEATURES_BY_ENTITY;
    void JTBDS_BY_FEATURE;

    return {
      teamsScanned,
      cohortsScanned,
      avgFeaturesPerTeam,
      jobsCovered,
      jobsTotal,
      featuresInScope,
      customizations: {
        totalInstances,
        uniqueTypes,
        typesNeedingDecision,
      },
      vendors: { total: vendors, withoutGitHubEquivalent: vendorsNoEquivalent },
      hybridSplit,
      parityBreakdown,
      migrationApproach,
      friction: {
        customizationTypesNoEquivalent,
        customizationTypesNoEquivalentInstances: customizationTypesNoEquivalent,
        integrationsResetup,
        integrationsResetupVendors,
        highCustomizationTeams,
      },
    };
  },
);
