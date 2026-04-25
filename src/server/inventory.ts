import "server-only";
import { cache } from "react";
import {
  ENTITIES,
  ENTITY_BY_ID,
  FEATURE_BY_ID,
  FEATURES_BY_ENTITY,
  JTBDS,
  JTBDS_BY_FEATURE,
  type Entity,
  type Feature,
  type Jtbd,
} from "@/lib/inventory-framework";
import { FIELDS_BY_ENTITY, type Field } from "@/lib/inventory-fields";
import { prisma } from "./db";

export type EntityNode = Entity & {
  /** How many features in scope reference this entity. >1 means shared (M:N). */
  sharedAcrossFeatures: number;
  /** Fields belonging to this entity (from the framework field inventory). */
  fields: Field[];
};

export type FeatureNode = Feature & {
  entityNodes: EntityNode[];
  /** How many JTBDs in scope reference this feature. >1 means shared (M:N). */
  sharedAcrossJtbds: number;
};

export type JtbdNode = Jtbd & {
  performed: boolean;
  featureNodes: FeatureNode[];
};

export type CategoryGroup = {
  category: string;
  categoryLabel: string;
  jtbds: JtbdNode[];
};

export type CoverageCell = {
  /** "primary" = first feature listed for the JTBD; "secondary" = additional. */
  kind: "primary" | "secondary";
};

export type InventoryCoverage = {
  jtbds: JtbdNode[];
  features: FeatureNode[];
  /** key: `${jtbdId}::${featureId}` */
  cells: Record<string, CoverageCell>;
  orphanFeatures: FeatureNode[];
};

export type TeamInventory = {
  team: { id: string; name: string; slug: string };
  totals: {
    jtbdsInScope: number;
    jtbdsTotal: number;
    featuresInScope: number;
    entitiesInScope: number;
    sharedFeatures: number;
    sharedEntities: number;
  };
  groups: CategoryGroup[];
  coverage: InventoryCoverage;
};

export const getTeamInventory = cache(
  async (slug: string): Promise<TeamInventory | null> => {
    const team = await prisma.team.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        jtbds: {
          select: { jtbdCode: true, performed: true },
        },
      },
    });
    if (!team) return null;

    const performedSet = new Set(
      team.jtbds.filter((j) => j.performed).map((j) => j.jtbdCode),
    );

    const inScopeJtbds: Jtbd[] = JTBDS.filter((j) => performedSet.has(j.id));

    const featureIdsInScope = new Set<string>();
    for (const j of inScopeJtbds) {
      for (const fid of j.features) featureIdsInScope.add(fid);
    }
    const inScopeFeatures: Feature[] = [...featureIdsInScope]
      .map((id) => FEATURE_BY_ID[id])
      .filter((f): f is Feature => Boolean(f));

    const entityIdsInScope = new Set<string>();
    for (const f of inScopeFeatures) {
      for (const eid of f.entities) entityIdsInScope.add(eid);
    }

    const sharedFeatureCount = (fid: string) =>
      (JTBDS_BY_FEATURE[fid] ?? []).filter((jid) => performedSet.has(jid))
        .length;

    const sharedEntityCount = (eid: string) =>
      (FEATURES_BY_ENTITY[eid] ?? []).filter((fid) =>
        featureIdsInScope.has(fid),
      ).length;

    const buildEntityNode = (eid: string): EntityNode | null => {
      const e = ENTITY_BY_ID[eid];
      if (!e) return null;
      return {
        ...e,
        sharedAcrossFeatures: sharedEntityCount(eid),
        fields: FIELDS_BY_ENTITY[eid] ?? [],
      };
    };

    const buildFeatureNode = (fid: string): FeatureNode | null => {
      const f = FEATURE_BY_ID[fid];
      if (!f) return null;
      const entityNodes = f.entities
        .map(buildEntityNode)
        .filter((n): n is EntityNode => Boolean(n));
      return {
        ...f,
        entityNodes,
        sharedAcrossJtbds: sharedFeatureCount(fid),
      };
    };

    const featureNodeCache = new Map<string, FeatureNode>();
    const featureNode = (fid: string): FeatureNode | null => {
      if (featureNodeCache.has(fid)) return featureNodeCache.get(fid)!;
      const node = buildFeatureNode(fid);
      if (node) featureNodeCache.set(fid, node);
      return node;
    };

    const jtbdNodes: JtbdNode[] = inScopeJtbds.map((j) => ({
      ...j,
      performed: true,
      featureNodes: j.features
        .map(featureNode)
        .filter((n): n is FeatureNode => Boolean(n)),
    }));

    // Group by category in JTBDS document order.
    const seenCategories: string[] = [];
    const byCategory = new Map<string, JtbdNode[]>();
    for (const j of jtbdNodes) {
      if (!byCategory.has(j.category)) {
        byCategory.set(j.category, []);
        seenCategories.push(j.category);
      }
      byCategory.get(j.category)!.push(j);
    }
    const groups: CategoryGroup[] = seenCategories.map((cat) => {
      const list = byCategory.get(cat)!;
      return {
        category: cat,
        categoryLabel: list[0]!.categoryLabel,
        jtbds: list,
      };
    });

    // Coverage matrix
    const featuresList: FeatureNode[] = [...featureIdsInScope]
      .map(featureNode)
      .filter((n): n is FeatureNode => Boolean(n));

    const cells: Record<string, CoverageCell> = {};
    for (const j of jtbdNodes) {
      j.features.forEach((fid, idx) => {
        cells[`${j.id}::${fid}`] = {
          kind: idx === 0 ? "primary" : "secondary",
        };
      });
    }

    const orphanFeatures: FeatureNode[] = featuresList.filter(
      (f) => f.sharedAcrossJtbds === 0,
    );

    const sharedFeatures = featuresList.filter(
      (f) => f.sharedAcrossJtbds > 1,
    ).length;
    const sharedEntities = [...entityIdsInScope].filter(
      (eid) => sharedEntityCount(eid) > 1,
    ).length;

    return {
      team: { id: team.id, name: team.name, slug: team.slug },
      totals: {
        jtbdsInScope: inScopeJtbds.length,
        jtbdsTotal: JTBDS.length,
        featuresInScope: featureIdsInScope.size,
        entitiesInScope: entityIdsInScope.size,
        sharedFeatures,
        sharedEntities,
      },
      groups,
      coverage: {
        jtbds: jtbdNodes,
        features: featuresList,
        cells,
        orphanFeatures,
      },
    };
  },
);

export function totalEntitiesInFramework(): number {
  return ENTITIES.length;
}
