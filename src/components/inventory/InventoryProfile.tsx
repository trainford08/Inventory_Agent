"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Field } from "@/lib/inventory-fields";
import type {
  CategoryGroup,
  CustomizationsBlock,
  FeatureNode,
  JtbdNode,
} from "@/server/inventory";
import { CustomizationsTable } from "./CustomizationsTable";

type Row =
  | { kind: "cat"; id: string; label: string; count: number }
  | { kind: "featcat"; id: string; label: string; count: number }
  | { kind: "featadd"; id: string; category: string }
  | {
      kind: "jtbd";
      id: string;
      parentId: null;
      jtbd: JtbdNode;
    }
  | {
      kind: "feature";
      id: string;
      rowKey: string;
      parentId: string;
      feature: FeatureNode;
      isRef: boolean;
    }
  | {
      kind: "entity";
      id: string;
      rowKey: string;
      parentId: string;
      entity: FeatureNode["entityNodes"][number];
      isRef: boolean;
    }
  | {
      kind: "field";
      id: string;
      rowKey: string;
      parentId: string;
      field: Field;
    };

type PatternFilter = "all" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
type FidelityFilter = "all" | "high" | "medium" | "low" | "gap" | "na";
type LayerFilter = "jtbd" | "feature" | "entity" | "field" | "customization";

export function InventoryProfile({
  groups,
  customizations,
}: {
  groups: CategoryGroup[];
  customizations: CustomizationsBlock;
}) {
  const rows = useMemo(() => buildRows(groups), [groups]);

  // Cross-reference maps so shared-row markers can list the IDs they're
  // shared with. Built in canonical iteration order (preserves stable display).
  const sharedRefs = useMemo(() => {
    const featureToJtbds = new Map<string, string[]>();
    const entityToFeatures = new Map<string, string[]>();
    const featureNameById = new Map<string, string>();
    const jtbdNameById = new Map<string, string>();
    for (const cat of groups) {
      for (const j of cat.jtbds) {
        jtbdNameById.set(j.id, j.name);
        for (const f of j.featureNodes) {
          featureNameById.set(f.id, f.name);
          const arr = featureToJtbds.get(f.id) ?? [];
          if (!arr.includes(j.id)) arr.push(j.id);
          featureToJtbds.set(f.id, arr);
          for (const e of f.entityNodes) {
            const earr = entityToFeatures.get(e.id) ?? [];
            if (!earr.includes(f.id)) earr.push(f.id);
            entityToFeatures.set(e.id, earr);
          }
        }
      }
    }
    return {
      featureToJtbds,
      entityToFeatures,
      featureNameById,
      jtbdNameById,
    };
  }, [groups]);

  const [patternFilter, setPatternFilter] = useState<PatternFilter>("all");
  const [fidelityFilter, setFidelityFilter] = useState<FidelityFilter>("all");
  const [capabilityFilter, setCapabilityFilter] =
    useState<FidelityFilter>("all");
  const [layer, setLayer] = useState<LayerFilter>("jtbd");
  const [jtbdDepth, setJtbdDepth] = useState<"jtbd" | "feature" | "entity">(
    "jtbd",
  );
  const [featureDepth, setFeatureDepth] = useState<
    "category" | "feature" | "entity" | "field"
  >("feature");
  const [entityDepth, setEntityDepth] = useState<
    "category" | "entity" | "field"
  >("entity");

  const initialExpanded = useMemo(() => {
    const set = new Set<string>();
    // Initial defaults that match the per-layer depth defaults: JTBD view
    // shows only category headers + JTBD rows (no features/entities below).
    // Feature view default = "feature" (categories open, features visible,
    // entities/fields collapsed). Entity view default = "entity"
    // (categories open, entities visible, fields collapsed).
    for (const r of rows) {
      if (r.kind === "cat") set.add(r.id);
      // featcats open so feature-view feature rows are visible by default
      if (r.kind === "feature" && !r.isRef) {
        set.add(`featcat:${r.feature.category}`);
      }
      // entcats open so entity-view entity rows are visible by default
      if (r.kind === "entity" && !r.isRef) {
        set.add(`entcat:${r.entity.service}`);
      }
    }
    return set;
  }, [rows]);

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  // Customizations section — collapsed by default in All-layers view.
  const [customExpanded, setCustomExpanded] = useState(false);

  // Track the previous layer so we re-apply the layer's depth exactly once
  // on layer change (and not on subsequent re-renders). Inlining the
  // expansion logic here keeps the effect self-contained — no references to
  // the apply* helpers declared further down the component.
  // Null on first render so the effect runs on initial mount too.
  const prevLayerRef = useRef<LayerFilter | null>(null);
  useEffect(() => {
    if (prevLayerRef.current === layer) return;
    prevLayerRef.current = layer;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (layer === "jtbd") {
        // Strip jtbd-view-controlled ids: jtbd own expansion (gates
        // features), feature rowKey (gates entities), entity rowKey
        // (gates fields, though fields aren't in jtbd view).
        for (const r of rows) {
          if (r.kind === "jtbd") next.delete(r.id);
          if (r.kind === "feature" && !r.isRef) next.delete(r.rowKey);
          if (r.kind === "entity") next.delete(r.rowKey);
        }
        // Categories always open so JTBDs show.
        for (const r of rows) {
          if (r.kind === "cat") next.add(r.id);
        }
        if (jtbdDepth === "jtbd") return next;
        // depth >= feature: open each JTBD to reveal its features.
        for (const r of rows) {
          if (r.kind === "jtbd") next.add(r.id);
        }
        if (jtbdDepth === "feature") return next;
        // depth === entity: open features to reveal their entities.
        for (const r of rows) {
          if (r.kind === "feature" && !r.isRef) next.add(r.rowKey);
        }
        return next;
      }
      if (layer === "feature") {
        for (const r of rows) {
          if (r.kind === "feature" && !r.isRef) {
            next.delete(`featcat:${r.feature.category}`);
            next.delete(r.rowKey);
          } else if (r.kind === "entity") {
            next.delete(r.rowKey);
          }
        }
        if (featureDepth === "category") return next;
        for (const r of rows) {
          if (r.kind === "feature" && !r.isRef)
            next.add(`featcat:${r.feature.category}`);
        }
        if (featureDepth === "feature") return next;
        for (const r of rows) {
          if (r.kind === "feature" && !r.isRef) next.add(r.rowKey);
        }
        if (featureDepth === "entity") return next;
        for (const r of rows) {
          if (r.kind === "entity") next.add(r.rowKey);
        }
        return next;
      }
      if (layer === "entity") {
        for (const r of rows) {
          if (r.kind === "entity" && !r.isRef) {
            next.delete(`entcat:${r.entity.service}`);
            next.delete(`fldent:${r.entity.id}`);
          }
        }
        if (entityDepth === "category") return next;
        for (const r of rows) {
          if (r.kind === "entity" && !r.isRef)
            next.add(`entcat:${r.entity.service}`);
        }
        if (entityDepth === "entity") return next;
        for (const r of rows) {
          if (r.kind === "entity" && !r.isRef)
            next.add(`fldent:${r.entity.id}`);
        }
        return next;
      }
      return next;
    });
    // Run only when layer changes; depth values are read snapshot-style.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center text-[13px] text-ink-muted">
        No JTBDs in scope for this team.
      </div>
    );
  }

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const next = new Set<string>();
    for (const r of rows) {
      if (r.kind === "cat" || r.kind === "jtbd") next.add(r.id);
      else if ((r.kind === "feature" || r.kind === "entity") && !r.isRef)
        next.add(r.rowKey);
    }
    // Entity-table service categories + field-table per-entity sections.
    for (const r of rows) {
      if (r.kind === "entity" && !r.isRef) {
        next.add(`entcat:${r.entity.service}`);
        next.add(`fldent:${r.entity.id}`);
      }
      if (r.kind === "feature" && !r.isRef) {
        next.add(`featcat:${r.feature.category}`);
      }
    }
    setExpanded(next);
  };

  const collapseAll = () => {
    const next = new Set<string>();
    for (const r of rows) if (r.kind === "cat") next.add(r.id);
    setExpanded(next);
  };

  const applyJtbdDepth = (depth: "jtbd" | "feature" | "entity") => {
    setJtbdDepth(depth);
    setExpanded((prev) => {
      const next = new Set(prev);
      // Strip jtbd-view-controlled ids first.
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef) next.delete(r.rowKey);
        if (r.kind === "entity") next.delete(r.rowKey);
      }
      // Always expand category headers + JTBD rows so JTBDs show.
      for (const r of rows) {
        if (r.kind === "cat") next.add(r.id);
        if (r.kind === "jtbd") next.add(r.id);
      }
      if (depth === "jtbd") return next;
      // depth >= feature: expand each JTBD's features
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef) next.add(r.rowKey);
      }
      if (depth === "feature") return next;
      // depth === entity: expand features so entities appear
      for (const r of rows) {
        if (r.kind === "entity") next.add(r.rowKey);
      }
      return next;
    });
  };

  const applyEntityDepth = (depth: "category" | "entity" | "field") => {
    setEntityDepth(depth);
    setExpanded((prev) => {
      const next = new Set(prev);
      // Strip entity-view ids first.
      for (const r of rows) {
        if (r.kind === "entity" && !r.isRef) {
          next.delete(`entcat:${r.entity.service}`);
          next.delete(`fldent:${r.entity.id}`);
        }
      }
      if (depth === "category") return next;
      // depth >= entity: open all service category cards
      for (const r of rows) {
        if (r.kind === "entity" && !r.isRef)
          next.add(`entcat:${r.entity.service}`);
      }
      if (depth === "entity") return next;
      // depth === field: open entities so fields surface
      for (const r of rows) {
        if (r.kind === "entity" && !r.isRef) next.add(`fldent:${r.entity.id}`);
      }
      return next;
    });
  };

  const applyFeatureDepth = (
    depth: "category" | "feature" | "entity" | "field",
  ) => {
    setFeatureDepth(depth);
    setExpanded((prev) => {
      const next = new Set(prev);
      // Strip all feature-view ids first, then re-add per chosen depth.
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef) {
          next.delete(`featcat:${r.feature.category}`);
          next.delete(r.rowKey);
        } else if (r.kind === "entity") {
          next.delete(r.rowKey);
        }
      }
      if (depth === "category") return next;
      // depth >= feature: open all category cards
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef)
          next.add(`featcat:${r.feature.category}`);
      }
      if (depth === "feature") return next;
      // depth >= entity: open features so entities surface
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef) next.add(r.rowKey);
      }
      if (depth === "entity") return next;
      // depth === field: open entities so fields surface
      for (const r of rows) {
        if (r.kind === "entity") next.add(r.rowKey);
      }
      return next;
    });
  };

  const matchesFilters = (r: Row): boolean => {
    if (r.kind === "cat" || r.kind === "featcat" || r.kind === "featadd")
      return true;
    if (r.kind === "field") {
      if (patternFilter !== "all" && r.field.pattern !== patternFilter)
        return false;
      if (
        fidelityFilter !== "all" &&
        r.field.dataPreservation !== fidelityFilter
      )
        return false;
      return true;
    }
    if (patternFilter !== "all") {
      if (r.kind === "jtbd") {
        // JTBDs have no pattern themselves — keep if any descendant matches.
        const has = r.jtbd.featureNodes.some(
          (f) =>
            f.pattern === patternFilter ||
            f.entityNodes.some((e) => e.pattern === patternFilter),
        );
        if (!has) return false;
      } else {
        const p = r.kind === "feature" ? r.feature.pattern : r.entity.pattern;
        if (p !== patternFilter) return false;
      }
    }
    if (fidelityFilter !== "all") {
      // Features have no dataPreservation; JTBDs have no dataPreservation.
      // Entities have it directly. For non-entity rows, keep if any
      // entity descendant matches.
      if (r.kind === "entity") {
        if (r.entity.dataPreservation !== fidelityFilter) return false;
      } else if (r.kind === "feature") {
        const has = r.feature.entityNodes.some(
          (e) => e.dataPreservation === fidelityFilter,
        );
        if (!has) return false;
      } else if (r.kind === "jtbd") {
        const has = r.jtbd.featureNodes.some((f) =>
          f.entityNodes.some((e) => e.dataPreservation === fidelityFilter),
        );
        if (!has) return false;
      }
    }
    if (capabilityFilter !== "all") {
      // Capability preservation lives on entities only.
      if (r.kind === "entity") {
        if (r.entity.capabilityPreservation !== capabilityFilter) return false;
      } else if (r.kind === "feature") {
        const has = r.feature.entityNodes.some(
          (e) => e.capabilityPreservation === capabilityFilter,
        );
        if (!has) return false;
      } else if (r.kind === "jtbd") {
        const has = r.jtbd.featureNodes.some((f) =>
          f.entityNodes.some(
            (e) => e.capabilityPreservation === capabilityFilter,
          ),
        );
        if (!has) return false;
      }
    }
    return true;
  };

  // Tree-with-collapse for All / JTBD / Feature / Entity layers.
  // Each layer view shows the chosen layer + descendants (nested), except
  // Field which falls through to the flat FieldTable below.
  const visibleRows: Row[] = (() => {
    if (layer === "jtbd") {
      // Cat headers + JTBDs + nested feat/entity descendants (no fields)
      return rows.filter((r) => {
        if (!matchesFilters(r)) return false;
        if (r.kind === "field") return false;
        if (r.kind === "cat") return true;
        if (r.kind === "jtbd") return expanded.has(`cat:${r.jtbd.category}`);
        if (r.kind === "feature") return expanded.has(r.parentId);
        if (r.kind === "entity") return expanded.has(r.parentId);
        return false;
      });
    }
    if (layer === "feature") {
      // Features as top-level (deduped) with nested entities, grouped by
      // canonical category. Skip cats/JTBDs.
      const seen = new Set<string>();
      const allowedFeatureKey = new Set<string>();
      const featureRowsByCat = new Map<string, Row[]>();
      const catOrder: string[] = [];
      // Track entities under each feature (in canonical row order)
      const entitiesByParent = new Map<string, Row[]>();
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef && matchesFilters(r)) {
          if (seen.has(r.feature.id)) continue;
          seen.add(r.feature.id);
          allowedFeatureKey.add(r.rowKey);
          const cat = r.feature.category;
          if (!featureRowsByCat.has(cat)) {
            featureRowsByCat.set(cat, []);
            catOrder.push(cat);
          }
          featureRowsByCat.get(cat)!.push(r);
        } else if (
          r.kind === "entity" &&
          matchesFilters(r) &&
          expanded.has(r.parentId)
        ) {
          if (!entitiesByParent.has(r.parentId))
            entitiesByParent.set(r.parentId, []);
          entitiesByParent.get(r.parentId)!.push(r);
        }
      }
      const out: Row[] = [];
      for (const cat of catOrder) {
        const featRows = featureRowsByCat.get(cat)!;
        const catId = `featcat:${cat}`;
        out.push({
          kind: "featcat",
          id: catId,
          label: cat,
          count: featRows.length,
        });
        if (!expanded.has(catId)) continue;
        for (const fr of featRows) {
          out.push(fr);
          if (fr.kind === "feature" && allowedFeatureKey.has(fr.rowKey)) {
            const ents = entitiesByParent.get(fr.rowKey);
            if (ents) out.push(...ents);
          }
        }
        out.push({
          kind: "featadd",
          id: `featadd:${cat}`,
          category: cat,
        });
      }
      return out;
    }
    if (layer === "entity") {
      // Entities as top-level (deduped) with nested fields.
      const seen = new Set<string>();
      const allowedEntityKey = new Set<string>();
      const out: Row[] = [];
      for (const r of rows) {
        if (r.kind === "entity" && !r.isRef && matchesFilters(r)) {
          if (seen.has(r.entity.id)) continue;
          seen.add(r.entity.id);
          allowedEntityKey.add(r.rowKey);
          out.push(r);
          continue;
        }
        if (
          r.kind === "field" &&
          allowedEntityKey.has(r.parentId) &&
          expanded.has(r.parentId)
        ) {
          out.push(r);
        }
      }
      return out;
    }
    // layer === "field" → flat view; filter at field level
    // (an entity is kept if it has any matching field).
    const seenEnt = new Set<string>();
    const flat: Row[] = [];
    for (const r of rows) {
      if (r.kind !== "entity" || r.isRef) continue;
      if (seenEnt.has(r.entity.id)) continue;
      const hasFieldMatch = r.entity.fields.some(
        (f) =>
          (patternFilter === "all" || f.pattern === patternFilter) &&
          (fidelityFilter === "all" || f.dataPreservation === fidelityFilter),
      );
      if (!hasFieldMatch) continue;
      seenEnt.add(r.entity.id);
      flat.push(r);
    }
    return flat;
  })();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-bg-elevated p-3">
        {layer !== "customization" ? (
          <ExpandToggle
            isExpanded={isMostlyExpanded(rows, expanded, layer)}
            onClick={() =>
              isMostlyExpanded(rows, expanded, layer)
                ? collapseAll()
                : expandAll()
            }
          />
        ) : null}
        <ChipGroup
          label="View"
          value={layer}
          onChange={(v) => setLayer(v as LayerFilter)}
          options={[
            { value: "jtbd", label: "JTBDs" },
            { value: "feature", label: "Features" },
            { value: "entity", label: "Entities" },
            { value: "field", label: "Fields" },
            { value: "customization", label: "Customizations" },
          ]}
        />
        {layer === "jtbd" ? (
          <ChipGroup
            label="Show depth"
            value={jtbdDepth}
            onChange={(v) => applyJtbdDepth(v as "jtbd" | "feature" | "entity")}
            options={[
              { value: "jtbd", label: "JTBDs" },
              { value: "feature", label: "Features" },
              { value: "entity", label: "Entities" },
            ]}
          />
        ) : null}
        {layer === "feature" ? (
          <ChipGroup
            label="Show depth"
            value={featureDepth}
            onChange={(v) =>
              applyFeatureDepth(
                v as "category" | "feature" | "entity" | "field",
              )
            }
            options={[
              { value: "category", label: "Categories" },
              { value: "feature", label: "Features" },
              { value: "entity", label: "Entities" },
              { value: "field", label: "Fields" },
            ]}
          />
        ) : null}
        {layer === "entity" ? (
          <ChipGroup
            label="Show depth"
            value={entityDepth}
            onChange={(v) =>
              applyEntityDepth(v as "category" | "entity" | "field")
            }
            options={[
              { value: "category", label: "Categories" },
              { value: "entity", label: "Entities" },
              { value: "field", label: "Fields" },
            ]}
          />
        ) : null}
        {layer !== "customization" ? (
          <ChipGroup
            label="Pattern"
            value={patternFilter}
            onChange={(v) => setPatternFilter(v as PatternFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "P1", label: "P1" },
              { value: "P2", label: "P2" },
              { value: "P3", label: "P3" },
              { value: "P4", label: "P4" },
              { value: "P5", label: "P5" },
              { value: "P6", label: "P6" },
            ]}
          />
        ) : null}
        {layer !== "customization" ? (
          <ChipGroup
            label="Data preservation"
            value={fidelityFilter}
            onChange={(v) => setFidelityFilter(v as FidelityFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
              { value: "gap", label: "Gap" },
              { value: "na", label: "N/A" },
            ]}
          />
        ) : null}
        {layer !== "customization" && layer !== "field" ? (
          <ChipGroup
            label="Capability preservation"
            value={capabilityFilter}
            onChange={(v) => setCapabilityFilter(v as FidelityFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
              { value: "gap", label: "Gap" },
              { value: "na", label: "N/A" },
            ]}
          />
        ) : null}
      </div>

      {(() => {
        let summary = "";
        if (layer === "customization") {
          summary = `${customizations.total} customizations`;
        } else if (layer === "jtbd") {
          summary = `${rows.filter((r) => r.kind === "jtbd").length} JTBDs`;
        } else if (layer === "feature") {
          const set = new Set<string>();
          for (const r of rows)
            if (r.kind === "feature" && !r.isRef) set.add(r.feature.id);
          summary = `${set.size} features`;
        } else if (layer === "entity") {
          const set = new Set<string>();
          for (const r of rows)
            if (r.kind === "entity" && !r.isRef) set.add(r.entity.id);
          summary = `${set.size} entities`;
        } else {
          // field
          const entitySet = new Set<string>();
          const fieldSet = new Set<string>();
          for (const r of rows) {
            if (r.kind === "entity" && !r.isRef) {
              entitySet.add(r.entity.id);
              for (const f of r.entity.fields) fieldSet.add(f.id);
            }
          }
          summary = `${fieldSet.size} fields across ${entitySet.size} entities`;
        }
        return (
          <div className="flex items-center">
            <span className="font-mono text-[11px] text-ink-muted">
              {summary}
            </span>
          </div>
        );
      })()}

      {layer === "customization" ? (
        <CustomizationsTable block={customizations} />
      ) : layer === "field" ? (
        <FieldTable
          rows={visibleRows}
          patternFilter={patternFilter}
          fidelityFilter={fidelityFilter}
          expanded={expanded}
          onToggle={toggle}
        />
      ) : layer === "entity" ? (
        <EntityTable rows={visibleRows} expanded={expanded} onToggle={toggle} />
      ) : layer === "feature" ? (
        <FeatureTable
          rows={visibleRows}
          expanded={expanded}
          onToggle={toggle}
          featureToJtbds={sharedRefs.featureToJtbds}
          entityToFeatures={sharedRefs.entityToFeatures}
          featureNameById={sharedRefs.featureNameById}
          jtbdNameById={sharedRefs.jtbdNameById}
        />
      ) : (
        <div className="overflow-x-auto">
          <table
            className="border-collapse text-[12.5px]"
            style={{ minWidth: "1258px", width: "auto" }}
          >
            <thead>
              <tr>
                <Th className="w-[44px] text-right">#</Th>
                <Th className="w-[80px]">ID</Th>
                <Th className="min-w-[260px]">Feature</Th>
                <Th className="w-[150px]">Depends on</Th>
                <Th className="w-[150px]">Hybrid Approach</Th>
                <Th className="w-[120px]">Migration pattern</Th>
                <Th className="w-[68px]">Capability preservation</Th>
                <Th className="w-[66px]">Risk</Th>
                <Th className="w-[240px]">Preservation strategy</Th>
                <Th className="w-[338px]">Shared with</Th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowNum = 0;
                return visibleRows.map((r) => {
                  const num =
                    r.kind === "cat" ||
                    r.kind === "featcat" ||
                    r.kind === "featadd"
                      ? null
                      : ++rowNum;
                  return (
                    <RowView
                      key={rowKey(r)}
                      row={r}
                      rowNum={num}
                      expanded={expanded}
                      onToggle={toggle}
                      featureToJtbds={sharedRefs.featureToJtbds}
                      entityToFeatures={sharedRefs.entityToFeatures}
                      featureNameById={sharedRefs.featureNameById}
                      jtbdNameById={sharedRefs.jtbdNameById}
                    />
                  );
                });
              })()}
              <tr>
                <td colSpan={10} className="px-3 py-2">
                  <AddRowButton label={addLabelFor(layer)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {layer === "jtbd" && customizations.total > 0 ? (
        <div className="rounded-xl border border-border bg-bg-elevated">
          <button
            type="button"
            onClick={() => setCustomExpanded((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-bg-hover"
          >
            <span className="font-mono text-[10px] text-ink-muted">
              {customExpanded ? "▼" : "▸"}
            </span>
            <span className="font-medium text-ink">Customizations</span>
            <span className="font-mono text-[11px] text-ink-muted">
              {customizations.total} · {customizations.cataloged} cataloged ·{" "}
              {customizations.teamSpecific} team-specific
            </span>
            <span className="ml-auto text-[11px] text-ink-faint">
              Sibling category — does not nest under JTBDs/Features
            </span>
          </button>
          {customExpanded ? (
            <div className="border-t border-border p-3">
              <CustomizationsTable block={customizations} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function renderGithubTarget(s: string): ReactNode[] {
  // Split on backticks first to isolate code spans, then split remaining text on asterisks for italics.
  const nodes: ReactNode[] = [];
  const codeParts = s.split(/(`[^`]+`)/g);
  let key = 0;
  for (const part of codeParts) {
    if (!part) continue;
    if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="font-mono text-[10.5px] not-italic bg-bg-muted px-1 py-px rounded text-ink border border-rule-soft"
        >
          {part.slice(1, -1)}
        </code>,
      );
    } else {
      const italicParts = part.split(/(\*[^*]+\*)/g);
      for (const ip of italicParts) {
        if (!ip) continue;
        if (ip.startsWith("*") && ip.endsWith("*")) {
          nodes.push(
            <em key={key++} className="italic">
              {ip.slice(1, -1)}
            </em>,
          );
        } else {
          nodes.push(<span key={key++}>{ip}</span>);
        }
      }
    }
  }
  return nodes;
}

function FieldTable({
  rows,
  patternFilter,
  fidelityFilter,
  expanded,
  onToggle,
}: {
  rows: Row[];
  patternFilter: PatternFilter;
  fidelityFilter: FidelityFilter;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  let rowNum = 0;
  const fieldsForEntity = (e: Row & { kind: "entity" }) =>
    e.entity.fields.filter(
      (f) =>
        (patternFilter === "all" || f.pattern === patternFilter) &&
        (fidelityFilter === "all" || f.dataPreservation === fidelityFilter),
    );
  const entityRows = rows.filter(
    (r): r is Row & { kind: "entity" } => r.kind === "entity",
  );
  return (
    <div className="w-[76.5%] space-y-4">
      {entityRows.map((r) => {
        const visibleFields = fieldsForEntity(r);
        if (visibleFields.length === 0) return null;
        const fldKey = `fldent:${r.entity.id}`;
        const isOpen = expanded.has(fldKey);
        return (
          <div
            key={r.entity.id}
            className="overflow-x-auto rounded-xl border border-border bg-bg-elevated"
          >
            <button
              type="button"
              onClick={() => onToggle(fldKey)}
              className="flex w-full items-baseline gap-2 border-y border-border bg-bg-muted px-4 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-bg-hover"
            >
              <span className="inline-block w-3 text-ink-muted">
                {isOpen ? "▼" : "▸"}
              </span>
              <span>
                {r.entity.id} · {r.entity.name} fields
              </span>
              <span className="ml-auto font-normal text-ink-muted">
                {visibleFields.length}{" "}
                {visibleFields.length === 1 ? "field" : "fields"}
              </span>
            </button>
            {isOpen && (
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    <Th className="w-[44px] text-right">#</Th>
                    <Th className="w-[7.99%]">Field ID</Th>
                    <Th className="w-[12.5%]">ADO Field</Th>
                    <Th className="w-[8.03%]">Data type</Th>
                    <Th className="w-[15.96%]">GitHub target</Th>
                    <Th className="w-[17.74%]">Migration pattern</Th>
                    <Th className="w-[7.1%]">Data preservation</Th>
                    <Th className="w-[14.47%]">Preservation strategy</Th>
                    <Th className="w-[17.09%]">Notes</Th>
                  </tr>
                </thead>
                <tbody>
                  {visibleFields.map((fld) => {
                    const num = ++rowNum;
                    return (
                      <tr
                        key={fld.id}
                        className="border-b border-border/60 hover:bg-bg-hover"
                      >
                        <NumTd>{num}</NumTd>
                        <Td className="font-mono text-[10px] text-ink-muted">
                          {fld.id}
                        </Td>
                        <Td>
                          <span className="font-medium text-ink">
                            {fld.name}
                          </span>
                        </Td>
                        <Td className="font-mono text-[10.5px] text-ink-soft">
                          {fld.dataType}
                        </Td>
                        <Td className="text-[11.5px] text-ink-soft">
                          {renderGithubTarget(fld.githubTarget)}
                        </Td>
                        <Td>
                          {fld.pattern === "na" ? (
                            <span className="font-mono text-[10px] text-ink-faint">
                              N/A
                            </span>
                          ) : (
                            <PatternBadge value={fld.pattern} withDescription />
                          )}
                        </Td>
                        <Td>
                          <FidelityBadge value={fld.dataPreservation} />
                        </Td>
                        <Td className="text-[11.5px] italic leading-snug text-ink-soft">
                          {fld.strategy}
                        </Td>
                        <Td className="text-[11.5px] italic leading-snug text-ink-soft">
                          {fld.notes}
                        </Td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={9} className="px-3 py-2">
                      <AddRowButton label="Add field" />
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      <div className="grid w-1/2 grid-cols-1 gap-6 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-[11.5px] md:grid-cols-2">
        <div>
          <div className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Migration pattern
          </div>
          <ul className="space-y-1 text-ink-soft">
            <li className="flex items-baseline gap-2">
              <PatternBadge value="P1" />
              <span>Exact 1:1 mapping</span>
            </li>
            <li className="flex items-baseline gap-2">
              <PatternBadge value="P2" />
              <span>Lossy 1:1 mapping</span>
            </li>
            <li className="flex items-baseline gap-2">
              <PatternBadge value="P3" />
              <span>Compositional (many fields → one capability)</span>
            </li>
            <li className="flex items-baseline gap-2">
              <PatternBadge value="P4" />
              <span>Decompositional (one field → many)</span>
            </li>
            <li className="flex items-baseline gap-2">
              <PatternBadge value="P5" />
              <span>Capability substitution</span>
            </li>
            <li className="flex items-baseline gap-2">
              <PatternBadge value="P6" />
              <span>Gap (no preservation)</span>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Data preservation
          </div>
          <ul className="space-y-1 text-ink-soft">
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="high" />
              <span>Data and structure transfer intact</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="medium" />
              <span>Data transfers; some structure or semantics degrade</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="low" />
              <span>Significant loss of structure or fidelity</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="gap" />
              <span>No equivalent — capability not preserved</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="na" />
              <span>Not applicable</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function EntityTable({
  rows,
  expanded,
  onToggle,
}: {
  rows: Row[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  // Collect entity rows in order; dedupe by entity.id (visibleRows already
  // dedupes for the entity layer, but be defensive). Group by service.
  const entityRows = rows.filter(
    (r): r is Row & { kind: "entity" } => r.kind === "entity" && !r.isRef,
  );
  const seen = new Set<string>();
  const grouped = new Map<
    string,
    { label: string; entities: (Row & { kind: "entity" })["entity"][] }
  >();
  const order: string[] = [];
  for (const r of entityRows) {
    if (seen.has(r.entity.id)) continue;
    seen.add(r.entity.id);
    const key = r.entity.service;
    if (!grouped.has(key)) {
      grouped.set(key, { label: r.entity.serviceLabel, entities: [] });
      order.push(key);
    }
    grouped.get(key)!.entities.push(r.entity);
  }

  let rowNum = 0;
  return (
    <div className="w-4/5 space-y-4">
      {order.map((key) => {
        const group = grouped.get(key)!;
        const catId = `entcat:${key}`;
        const isOpen = expanded.has(catId);
        return (
          <div
            key={key}
            className="overflow-x-auto rounded-xl border border-border bg-bg-elevated"
          >
            <button
              type="button"
              onClick={() => onToggle(catId)}
              className="flex w-full items-baseline gap-2 border-y border-border bg-bg-muted px-4 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-bg-hover"
            >
              <span className="inline-block w-3 text-ink-muted">
                {isOpen ? "▼" : "▸"}
              </span>
              <span>{group.label}</span>
              <span className="ml-auto font-normal text-ink-muted">
                {group.entities.length}{" "}
                {group.entities.length === 1 ? "entity" : "entities"}
              </span>
            </button>
            {isOpen && (
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    <Th className="w-[44px] text-right">#</Th>
                    <Th className="w-[4.56%]">ID</Th>
                    <Th className="w-[11.34%]">Entity</Th>
                    <Th className="w-[11.34%]">GitHub Target</Th>
                    <Th className="w-[6.48%]">Data Preservation</Th>
                    <Th className="w-[6.48%]">Capability Preservation</Th>
                    <Th className="w-[16.2%]">Migration pattern</Th>
                    <Th className="w-[10.63%]">Hybrid Approach</Th>
                    <Th>Migration Note</Th>
                  </tr>
                </thead>
                <tbody>
                  {group.entities.flatMap((e) => {
                    const num = ++rowNum;
                    const isNoTarget = /^no direct target$/i.test(
                      e.githubTarget,
                    );
                    const fldentId = `fldent:${e.id}`;
                    const fieldsOpen =
                      expanded.has(fldentId) && e.fields.length > 0;
                    const trs: ReactNode[] = [];
                    trs.push(
                      <tr
                        key={e.id}
                        className="border-b border-border/60 hover:bg-bg-hover"
                      >
                        <NumTd>{num}</NumTd>
                        <Td className="font-mono text-[10.5px] text-ink-muted">
                          {e.id}
                        </Td>
                        <Td>
                          <button
                            type="button"
                            onClick={() => onToggle(fldentId)}
                            className="flex items-center gap-1.5 text-left"
                          >
                            <span className="inline-block w-3 font-mono text-[11px] text-ink-muted">
                              {e.fields.length === 0
                                ? ""
                                : fieldsOpen
                                  ? "▼"
                                  : "▶"}
                            </span>
                            <span className="font-medium text-ink">
                              {e.name}
                            </span>
                            {e.fields.length > 0 ? (
                              <span className="ml-1 font-mono text-[10px] text-ink-faint">
                                ({e.fields.length})
                              </span>
                            ) : null}
                          </button>
                        </Td>
                        <Td
                          className={
                            isNoTarget
                              ? "text-[11.5px] italic text-ink-faint"
                              : "text-[11.5px] text-ink-soft"
                          }
                        >
                          {e.githubTarget}
                        </Td>
                        <Td>
                          <FidelityBadge value={e.dataPreservation} />
                        </Td>
                        <Td>
                          <FidelityBadge value={e.capabilityPreservation} />
                        </Td>
                        <Td>
                          <PatternBadge value={e.pattern} withDescription />
                        </Td>
                        <Td>
                          <HybridApproachChip value={e.staysInAdo} />
                        </Td>
                        <Td className="text-[11.5px] italic leading-snug text-ink-soft">
                          {e.note}
                        </Td>
                      </tr>,
                    );
                    if (fieldsOpen) {
                      for (const fld of e.fields) {
                        const fnum = ++rowNum;
                        trs.push(
                          <tr
                            key={`${e.id}:${fld.id}`}
                            className="border-b border-border/60 bg-bg-muted/40"
                          >
                            <NumTd>{fnum}</NumTd>
                            <Td className="font-mono text-[10.5px] text-ink-muted">
                              {fld.id}
                            </Td>
                            <Td className="pl-8">
                              <span className="text-ink">{fld.name}</span>
                              <span className="ml-2 font-mono text-[10px] text-ink-faint">
                                {fld.dataType}
                              </span>
                            </Td>
                            <Td className="text-[11.5px] text-ink-soft">
                              {renderGithubTarget(fld.githubTarget)}
                            </Td>
                            <Td>
                              <FidelityBadge value={fld.dataPreservation} />
                            </Td>
                            <Td className="text-ink-faint">—</Td>
                            <Td>
                              {fld.pattern === "na" ? (
                                <span className="font-mono text-[10px] text-ink-faint">
                                  N/A
                                </span>
                              ) : (
                                <PatternBadge
                                  value={fld.pattern}
                                  withDescription
                                />
                              )}
                            </Td>
                            <Td className="text-ink-faint">—</Td>
                            <Td className="text-[11.5px] italic leading-snug text-ink-soft">
                              {fld.strategy ?? "—"}
                            </Td>
                          </tr>,
                        );
                      }
                    }
                    return trs;
                  })}
                  <tr>
                    <td colSpan={9} className="px-3 py-2">
                      <AddRowButton label="Add entity" />
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      <div className="grid w-1/2 grid-cols-1 gap-6 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-[11.5px] md:grid-cols-2">
        <div>
          <div className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Data preservation
          </div>
          <ul className="space-y-1 text-ink-soft">
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="high" />
              <span>Data and structure transfer intact</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="medium" />
              <span>Data transfers; some structure or semantics degrade</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="low" />
              <span>Significant loss of structure or fidelity</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="gap" />
              <span>No equivalent — data not preserved</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="na" />
              <span>Not applicable</span>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Capability preservation
          </div>
          <ul className="space-y-1 text-ink-soft">
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="high" />
              <span>Workflow survives intact</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="medium" />
              <span>Workflow preserved with some redesign</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="low" />
              <span>Workflow degrades significantly</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="gap" />
              <span>No equivalent — capability not preserved</span>
            </li>
            <li className="flex items-baseline gap-2">
              <FidelityBadge value="na" />
              <span>Not applicable</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureTable({
  rows,
  expanded,
  onToggle,
  featureToJtbds,
  entityToFeatures,
  featureNameById,
  jtbdNameById,
}: {
  rows: Row[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  featureToJtbds: Map<string, string[]>;
  entityToFeatures: Map<string, string[]>;
  featureNameById: Map<string, string>;
  jtbdNameById: Map<string, string>;
}) {
  // Group the pre-built rows by featcat. Rows arrive in canonical order:
  // featcat, feature, entity..., feature, entity..., featadd, featcat, ...
  type Group = {
    catId: string;
    label: string;
    count: number;
    children: Row[]; // feature + entity rows (no featcat/featadd)
  };
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const r of rows) {
    if (r.kind === "featcat") {
      current = { catId: r.id, label: r.label, count: r.count, children: [] };
      groups.push(current);
    } else if (r.kind === "featadd") {
      // Skip — we render Add manually inside each card
    } else if (current) {
      current.children.push(r);
    }
  }

  let rowNum = 0;
  return (
    <div className="w-4/5 space-y-4">
      {groups.map((group) => {
        const isOpen = expanded.has(group.catId);
        return (
          <div
            key={group.catId}
            className="overflow-x-auto rounded-xl border border-border bg-bg-elevated"
          >
            <button
              type="button"
              onClick={() => onToggle(group.catId)}
              className="flex w-full items-baseline gap-2 border-y border-border bg-bg-muted px-4 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-bg-hover"
            >
              <span className="inline-block w-3 text-ink-muted">
                {isOpen ? "▼" : "▸"}
              </span>
              <span>{group.label}</span>
              <span className="ml-auto font-normal text-ink-muted">
                {group.count} {group.count === 1 ? "feature" : "features"}
              </span>
            </button>
            {isOpen && (
              <table
                className="w-full table-fixed border-collapse text-[12.5px]"
                style={{ minWidth: "1478px" }}
              >
                <thead>
                  <tr>
                    <Th className="w-[44px] text-right">#</Th>
                    <Th className="w-[80px]">ID</Th>
                    <Th>Feature</Th>
                    <Th className="w-[170px]">Depends on</Th>
                    <Th className="w-[170px]">Hybrid Approach</Th>
                    <Th className="w-[135px]">Migration pattern</Th>
                    <Th className="w-[80px]">Capability preservation</Th>
                    <Th className="w-[75px]">Risk</Th>
                    <Th className="w-[270px]">Preservation strategy</Th>
                    <Th className="w-[338px]">Shared with</Th>
                  </tr>
                </thead>
                <tbody>
                  {group.children.flatMap((r) => {
                    const out: ReactNode[] = [];
                    const num = ++rowNum;
                    out.push(
                      <RowView
                        key={rowKey(r)}
                        row={r}
                        rowNum={num}
                        expanded={expanded}
                        onToggle={onToggle}
                        indentOffset={1}
                        featureToJtbds={featureToJtbds}
                        entityToFeatures={entityToFeatures}
                        featureNameById={featureNameById}
                        jtbdNameById={jtbdNameById}
                      />,
                    );
                    // Drill into entity → fields directly from entity.fields
                    // (works for both first-seen and "ref" entities).
                    if (
                      r.kind === "entity" &&
                      expanded.has(r.rowKey) &&
                      r.entity.fields.length > 0
                    ) {
                      for (const fld of r.entity.fields) {
                        const fnum = ++rowNum;
                        const fldRow: Row = {
                          kind: "field",
                          id: fld.id,
                          rowKey: `${r.rowKey}:fld:${fld.id}`,
                          parentId: r.rowKey,
                          field: fld,
                        };
                        out.push(
                          <RowView
                            key={fldRow.rowKey}
                            row={fldRow}
                            rowNum={fnum}
                            expanded={expanded}
                            onToggle={onToggle}
                            indentOffset={1}
                            featureToJtbds={featureToJtbds}
                            entityToFeatures={entityToFeatures}
                            featureNameById={featureNameById}
                            jtbdNameById={jtbdNameById}
                          />,
                        );
                      }
                    }
                    return out;
                  })}
                  <tr>
                    <td colSpan={10} className="px-3 py-2">
                      <AddRowButton label="Add feature" />
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FidelityBadge({
  value,
}: {
  value: "high" | "medium" | "low" | "gap" | "na";
}) {
  const map = {
    high: { label: "High", cls: "bg-emerald-100 text-emerald-800" },
    medium: { label: "Medium", cls: "bg-amber-100 text-amber-800" },
    low: { label: "Low", cls: "bg-rose-100 text-rose-800" },
    gap: { label: "Gap", cls: "bg-rose-200 text-rose-900" },
    na: { label: "N/A", cls: "bg-bg-muted text-ink-muted" },
  };
  const m = map[value] ?? map.na;
  return (
    <span
      className={`inline-block rounded-[3px] px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function RiskBadge({
  value,
}: {
  value: "trivial" | "low" | "medium" | "high" | "na";
}) {
  const map = {
    trivial: { label: "Trivial", cls: "bg-emerald-100 text-emerald-800" },
    low: { label: "Low", cls: "bg-emerald-50 text-emerald-700" },
    medium: { label: "Medium", cls: "bg-amber-100 text-amber-800" },
    high: { label: "High", cls: "bg-rose-100 text-rose-800" },
    na: { label: "N/A", cls: "bg-bg-muted text-ink-muted" },
  };
  const m = map[value] ?? map.na;
  return (
    <span
      className={`inline-block rounded-[3px] px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function rowKey(r: Row): string {
  if (r.kind === "cat") return r.id;
  if (r.kind === "featcat") return r.id;
  if (r.kind === "featadd") return r.id;
  if (r.kind === "jtbd") return r.id;
  return r.rowKey;
}

function buildRows(groups: CategoryGroup[]): Row[] {
  const out: Row[] = [];
  const seenFeatures = new Set<string>();
  const seenEntitiesPerFeature = new Set<string>();
  const seenEntitiesGlobal = new Set<string>();

  for (const g of groups) {
    const catId = `cat:${g.category}`;
    out.push({
      kind: "cat",
      id: catId,
      label: g.categoryLabel,
      count: g.jtbds.length,
    });
    for (const j of g.jtbds) {
      const jId = `jtbd:${j.id}`;
      out.push({ kind: "jtbd", id: jId, parentId: null, jtbd: j });
      for (const f of j.featureNodes) {
        const fRowKey = `feat:${j.id}:${f.id}`;
        const isFeatureRef = seenFeatures.has(f.id);
        seenFeatures.add(f.id);
        out.push({
          kind: "feature",
          id: f.id,
          rowKey: fRowKey,
          parentId: jId,
          feature: f,
          isRef: isFeatureRef,
        });
        if (isFeatureRef) continue; // don't repeat entities under a ref feature
        for (const e of f.entityNodes) {
          const eRowKey = `ent:${j.id}:${f.id}:${e.id}`;
          const seenKey = `${f.id}:${e.id}`;
          const isEntityRef =
            seenEntitiesPerFeature.has(seenKey) || seenEntitiesGlobal.has(e.id);
          seenEntitiesPerFeature.add(seenKey);
          seenEntitiesGlobal.add(e.id);
          out.push({
            kind: "entity",
            id: e.id,
            rowKey: eRowKey,
            parentId: fRowKey,
            entity: e,
            isRef: isEntityRef,
          });
          if (isEntityRef) continue;
          for (const fld of e.fields) {
            out.push({
              kind: "field",
              id: fld.id,
              rowKey: `fld:${j.id}:${f.id}:${e.id}:${fld.id}`,
              parentId: eRowKey,
              field: fld,
            });
          }
        }
      }
    }
  }
  return out;
}

function RowView({
  row,
  rowNum,
  expanded,
  onToggle,
  indentOffset = 0,
  featureToJtbds,
  entityToFeatures,
  featureNameById,
  jtbdNameById,
}: {
  row: Row;
  rowNum: number | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  /** Subtract from each row's nominal indent level (used in feature view). */
  indentOffset?: number;
  featureToJtbds?: Map<string, string[]>;
  entityToFeatures?: Map<string, string[]>;
  featureNameById?: Map<string, string>;
  jtbdNameById?: Map<string, string>;
}) {
  if (row.kind === "cat") {
    const isOpen = expanded.has(row.id);
    return (
      <tr className="border-t-2 border-ink/60 bg-bg-muted">
        <td colSpan={10} className="px-4 py-[9px]">
          <button
            onClick={() => onToggle(row.id)}
            className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink"
          >
            <Caret open={isOpen} tone="ink" />
            {row.label} · {row.count} JTBDs
          </button>
        </td>
      </tr>
    );
  }

  if (row.kind === "featadd") {
    return (
      <tr>
        <td colSpan={10} className="px-3 py-2">
          <AddRowButton label="Add feature" />
        </td>
      </tr>
    );
  }

  if (row.kind === "featcat") {
    const isOpen = expanded.has(row.id);
    const radius = isOpen ? "rounded-t-xl" : "rounded-xl";
    return (
      <>
        <tr aria-hidden>
          <td colSpan={10} className="h-3 p-0" />
        </tr>
        <tr>
          <td colSpan={10} className="p-0">
            <button
              type="button"
              onClick={() => onToggle(row.id)}
              className={`flex w-full items-baseline gap-2 border border-border bg-bg-muted px-4 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-bg-hover ${radius}`}
            >
              <span className="inline-block w-3 text-ink-muted">
                {isOpen ? "▼" : "▸"}
              </span>
              <span>{row.label}</span>
              <span className="ml-auto font-normal text-ink-muted">
                {row.count} {row.count === 1 ? "feature" : "features"}
              </span>
            </button>
          </td>
        </tr>
      </>
    );
  }

  if (row.kind === "jtbd") {
    const isOpen = expanded.has(`jtbd:${row.jtbd.id}`);
    const featCount = row.jtbd.featureNodes.length;
    return (
      <tr className="bg-white">
        <NumTd>{rowNum}</NumTd>
        <Td className="font-mono text-[10px] text-ink-muted">{row.jtbd.id}</Td>
        <Td>
          <IndentCell
            level={Math.max(0, 1 - indentOffset) as 0 | 1 | 2 | 3 | 4}
          >
            <ToggleButton
              onClick={() => onToggle(`jtbd:${row.jtbd.id}`)}
              open={isOpen}
              hasChildren={featCount > 0}
              tone="primary"
            />
            <LayerTag kind="jtbd" />
            <span className="font-semibold text-ink">{row.jtbd.name}</span>
          </IndentCell>
        </Td>
        <Td className="text-ink-faint">—</Td>
        <Td>
          <StaysBadge value={row.jtbd.staysInAdo} />
        </Td>
        <Td className="text-ink-faint">—</Td>
        <Td className="text-ink-faint">—</Td>
        <Td className="text-ink-faint">—</Td>
        <Td className="text-ink-faint">—</Td>
        <Td className="text-ink-faint">—</Td>
      </tr>
    );
  }

  if (row.kind === "feature") {
    const isOpen = expanded.has(row.rowKey);
    const entityCount = row.feature.entityNodes.length;
    return (
      <tr className="bg-white">
        <NumTd>{rowNum}</NumTd>
        <Td
          className={muted(row.isRef, "font-mono text-[10px] text-ink-muted")}
        >
          {row.feature.id}
        </Td>
        <Td>
          <IndentCell
            level={Math.max(0, 2 - indentOffset) as 0 | 1 | 2 | 3 | 4}
          >
            <ToggleButton
              onClick={() => onToggle(row.rowKey)}
              open={isOpen}
              hasChildren={!row.isRef && entityCount > 0}
              tone="warn"
            />
            <LayerTag kind="feature" />
            <span className={muted(row.isRef, "text-ink")}>
              {row.feature.name}
            </span>
          </IndentCell>
        </Td>
        <Td
          className={muted(
            row.isRef,
            "font-mono text-[10.5px] text-ink-soft leading-snug",
          )}
        >
          {!row.isRef && row.feature.dependsOn ? row.feature.dependsOn : "—"}
        </Td>
        <Td>
          <HybridApproachChip value={row.feature.staysInAdo} />
          {!row.isRef && row.feature.staysReason ? (
            <div className="mt-0.5 text-[10.5px] italic leading-snug text-ink-soft">
              {row.feature.staysReason}
            </div>
          ) : null}
        </Td>
        <Td>
          {row.feature.pattern === "na" ? (
            <span
              className={`inline-block rounded-[3px] border border-ink-faint px-[5px] py-[1px] font-mono text-[10px] font-semibold text-ink-faint ${row.isRef ? "opacity-50" : ""}`}
            >
              N/A
            </span>
          ) : (
            <PatternBadge
              value={row.feature.pattern}
              faded={row.isRef}
              withDescription
            />
          )}
        </Td>
        <Td>
          <FidelityBadge value={row.feature.preservation} />
        </Td>
        <Td>
          <RiskBadge value={row.feature.risk} />
        </Td>
        <Td
          className={muted(
            row.isRef,
            "text-[11.5px] italic leading-snug text-ink-soft",
          )}
        >
          {row.isRef ? "—" : row.feature.preservationStrategy}
        </Td>
        <Td>
          {(() => {
            const ids = featureToJtbds?.get(row.feature.id) ?? [];
            const others = ids.filter((id) => id !== row.parentId);
            return <SharedCell ids={others} nameById={jtbdNameById} />;
          })()}
        </Td>
      </tr>
    );
  }

  if (row.kind === "entity") {
    const isOpen = expanded.has(row.rowKey);
    const hasFields = !row.isRef && row.entity.fields.length > 0;
    return (
      <tr className="bg-white">
        <NumTd>{rowNum}</NumTd>
        <Td
          className={muted(row.isRef, "font-mono text-[10px] text-ink-muted")}
        >
          {row.entity.id}
        </Td>
        <Td>
          <IndentCell
            level={Math.max(0, 3 - indentOffset) as 0 | 1 | 2 | 3 | 4}
          >
            <ToggleButton
              onClick={() => onToggle(row.rowKey)}
              open={isOpen}
              hasChildren={hasFields}
              tone="success"
            />
            <LayerTag kind="entity" />
            <span className={muted(row.isRef, "text-ink")}>
              {row.entity.name}
            </span>
          </IndentCell>
        </Td>
        <Td className="text-ink-faint">—</Td>
        <Td>
          <HybridApproachChip value={row.entity.staysInAdo} />
        </Td>
        <Td>
          <PatternBadge
            value={row.entity.pattern}
            faded={row.isRef}
            withDescription
          />
        </Td>
        <Td>
          <FidelityBadge value={row.entity.dataPreservation} />
        </Td>
        <Td className="text-ink-faint">—</Td>
        <Td
          className={muted(
            row.isRef,
            "text-[11.5px] italic leading-snug text-ink-soft",
          )}
        >
          {row.isRef ? "—" : row.entity.note}
        </Td>
        <Td>
          {(() => {
            const ids = entityToFeatures?.get(row.entity.id) ?? [];
            const currentFeatureId = row.parentId.split(":")[2] ?? "";
            const others = ids.filter((id) => id !== currentFeatureId);
            return <SharedCell ids={others} nameById={featureNameById} />;
          })()}
        </Td>
      </tr>
    );
  }

  // field
  const fld = row.field;
  return (
    <tr className="bg-white">
      <NumTd>{rowNum}</NumTd>
      <Td className="font-mono text-[10px] text-ink-muted">{fld.id}</Td>
      <Td>
        <IndentCell level={Math.max(0, 4 - indentOffset) as 0 | 1 | 2 | 3 | 4}>
          <span className="inline-block w-[18px]" aria-hidden />
          <LayerTag kind="field" />
          <span className="text-ink">
            {fld.name}
            <span className="ml-2 font-mono text-[10px] text-ink-faint">
              {fld.dataType}
            </span>
          </span>
        </IndentCell>
      </Td>
      <Td className="text-ink-faint">—</Td>
      <Td className="text-ink-faint">—</Td>
      <Td>
        {fld.pattern === "na" ? (
          <span className="font-mono text-[10px] text-ink-faint">N/A</span>
        ) : (
          <PatternBadge value={fld.pattern} withDescription />
        )}
      </Td>
      <Td>
        <FidelityBadge value={fld.dataPreservation} />
      </Td>
      <Td className="text-ink-faint">—</Td>
      <Td className="text-[11.5px] italic leading-snug text-ink-soft">
        {fld.strategy ?? "—"}
      </Td>
      <Td className="text-ink-faint">—</Td>
    </tr>
  );
}

/* ================ small components ================ */

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b-[1.5px] border-border bg-bg-muted px-4 py-[10px] text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function NumTd({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-border/60 px-2 py-[9px] text-right align-middle font-mono text-[11px] tabular-nums text-ink-faint">
      {children}
    </td>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-border/60 px-4 py-[9px] align-middle ${className ?? ""}`}
    >
      {children}
    </td>
  );
}

function IndentCell({
  level,
  children,
}: {
  level: 0 | 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const pad = { 0: 0, 1: 0, 2: 24, 3: 48, 4: 72 }[level];
  return (
    <div
      className="relative flex items-center gap-1.5"
      style={{ paddingLeft: pad }}
    >
      {children}
    </div>
  );
}

function ToggleButton({
  onClick,
  open,
  hasChildren,
  tone,
}: {
  onClick?: () => void;
  open: boolean;
  hasChildren: boolean;
  tone: "primary" | "warn" | "success" | "ink";
}) {
  if (!hasChildren) {
    return <span className="inline-block w-[18px]" aria-hidden />;
  }
  const toneClass = {
    primary: "text-primary",
    warn: "text-amber-700",
    success: "text-emerald-700",
    ink: "text-ink",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[18px] w-[18px] items-center justify-center font-mono text-[11px] font-bold ${toneClass}`}
      aria-label={open ? "Collapse" : "Expand"}
    >
      {open ? "▼" : "▶"}
    </button>
  );
}

function LayerTag({ kind }: { kind: "jtbd" | "feature" | "entity" | "field" }) {
  const map = {
    jtbd: { label: "JTBD", cls: "bg-primary/10 text-primary" },
    feature: { label: "FEAT", cls: "bg-amber-100 text-amber-800" },
    entity: { label: "ENT", cls: "bg-emerald-100 text-emerald-800" },
    field: { label: "FLD", cls: "bg-bg-muted text-ink-muted" },
  }[kind];
  return (
    <span
      className={`mr-1 inline-block min-w-[38px] rounded-[3px] px-1.5 py-[2px] text-center font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] ${map.cls}`}
    >
      {map.label}
    </span>
  );
}

function Caret({ open, tone }: { open: boolean; tone: "ink" }) {
  return (
    <span
      className={`font-mono text-[11px] ${tone === "ink" ? "text-ink" : ""}`}
    >
      {open ? "▼" : "▶"}
    </span>
  );
}

function StaysBadge({
  value,
  faded = false,
}: {
  value: "ado" | "gh" | "both" | "na";
  faded?: boolean;
}) {
  const map = {
    ado: { label: "Yes → ADO", cls: "bg-amber-100/60 text-amber-800" },
    gh: { label: "No → GitHub", cls: "bg-emerald-100/60 text-emerald-800" },
    both: { label: "Both", cls: "bg-primary/10 text-primary" },
    na: { label: "—", cls: "text-ink-faint" },
  };
  const m = map[value] ?? map.na;
  return (
    <span
      className={`inline-block rounded-[3px] px-[7px] py-[2px] font-mono text-[10px] font-semibold ${m.cls} ${faded ? "opacity-50" : ""}`}
    >
      {m.label}
    </span>
  );
}

function HybridApproachChip({
  value,
}: {
  value: "ado" | "gh" | "both" | "na";
}) {
  const map: Record<
    "ado" | "gh" | "both" | "na",
    { label: string; cls: string }
  > = {
    ado: {
      label: "Stays in ADO",
      cls: "border-orange-500/40 bg-orange-500/10 text-orange-700",
    },
    gh: {
      label: "Moves to GitHub",
      cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
    },
    both: {
      label: "Both",
      cls: "border-primary/40 bg-primary/10 text-primary",
    },
    na: {
      label: "N/A",
      cls: "border-border bg-bg-muted text-ink-muted",
    },
  };
  const m = map[value] ?? map.na;
  return (
    <span
      className={`inline-block rounded border px-2 py-[2px] text-[11px] font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

const PATTERN_DESCRIPTIONS: Record<
  "P1" | "P2" | "P3" | "P4" | "P5" | "P6",
  string
> = {
  P1: "Exact 1:1 mapping",
  P2: "Lossy 1:1 mapping",
  P3: "Compositional (many fields → one capability)",
  P4: "Decompositional (one field → many)",
  P5: "Capability substitution",
  P6: "Gap (no preservation)",
};

function SharedCell({
  ids,
  nameById,
}: {
  ids: string[];
  nameById?: Map<string, string>;
}) {
  const [open, setOpen] = useState(false);
  if (ids.length === 0) {
    return <span className="text-ink-faint">—</span>;
  }
  const PREVIEW = 3;
  if (!open && ids.length > PREVIEW) {
    return (
      <span className="font-mono text-[10.5px] leading-snug text-ink-soft">
        {ids.slice(0, PREVIEW).join(", ")}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1.5 font-sans text-[10.5px] font-medium text-primary hover:underline"
        >
          +{ids.length - PREVIEW} more
        </button>
      </span>
    );
  }
  if (!open) {
    // Short list — show inline, no expander needed
    return (
      <span className="font-mono text-[10.5px] leading-snug text-ink-soft">
        {ids.join(", ")}
      </span>
    );
  }
  // Expanded — two-column ID + name grid
  return (
    <div>
      <div className="grid grid-cols-1 gap-x-3 gap-y-[1px] sm:grid-cols-2">
        {ids.map((id) => (
          <div
            key={id}
            className="grid grid-cols-[40px_1fr] gap-2 border-b border-border-soft py-[2px] text-[11px] last:border-b-0"
          >
            <span className="font-mono text-[10.5px] font-semibold text-primary">
              {id}
            </span>
            <span className="truncate text-ink-soft">
              {nameById?.get(id) ?? ""}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-1 font-sans text-[10.5px] font-medium text-primary hover:underline"
      >
        show less
      </button>
    </div>
  );
}

function PatternBadge({
  value,
  faded = false,
  withDescription = false,
}: {
  value: "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
  faded?: boolean;
  withDescription?: boolean;
}) {
  const map = {
    P1: "text-emerald-700 border-emerald-700",
    P2: "text-amber-700 border-amber-700",
    P3: "text-primary border-primary",
    P4: "text-amber-700 border-amber-700",
    P5: "text-rose-700 border-rose-700",
    P6: "text-rose-700 border-rose-700 bg-rose-50",
  }[value];
  const badge = (
    <span
      className={`inline-block rounded-[3px] border px-[5px] py-[1px] font-mono text-[10px] font-semibold ${map} ${faded ? "opacity-50" : ""}`}
    >
      {value}
    </span>
  );
  if (!withDescription) return badge;
  return (
    <span
      className={`inline-flex flex-nowrap items-baseline gap-1.5 whitespace-nowrap ${faded ? "opacity-50" : ""}`}
    >
      {badge}
      <span className="text-[11px] leading-tight text-ink-soft">
        {PATTERN_DESCRIPTIONS[value]}
      </span>
    </span>
  );
}

function muted(isRef: boolean, baseText = ""): string {
  if (!isRef) return baseText;
  return `${baseText} text-ink-faint`;
}

function addLabelFor(layer: LayerFilter): string {
  switch (layer) {
    case "jtbd":
      return "Add JTBD";
    case "feature":
      return "Add feature";
    case "entity":
      return "Add entity";
    case "field":
      return "Add field";
    default:
      return "Add row";
  }
}

function AddRowButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => alert(`${label} (not wired yet)`)}
      className="w-full rounded-md border border-dashed border-border px-3 py-2 text-left text-[11.5px] text-ink-muted transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
    >
      + {label}
    </button>
  );
}

function ExpandToggle({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-[6px] text-[12px] font-semibold text-primary shadow-[0_1px_2px_rgba(91,95,207,0.15)] transition-colors hover:bg-primary/15 hover:border-primary/50"
      aria-pressed={isExpanded}
    >
      <span className="font-mono text-[10px]">{isExpanded ? "▼" : "▶"}</span>
      {isExpanded ? "Collapse all" : "Expand all"}
    </button>
  );
}

function isMostlyExpanded(
  rows: Row[],
  expanded: Set<string>,
  layer: LayerFilter,
): boolean {
  // Look at the rows that *could* be toggled in the current layer view.
  // If majority are expanded, treat as "expanded" (so click collapses).
  let total = 0;
  let openCount = 0;
  for (const r of rows) {
    if (r.kind === "cat") {
      if (layer === "jtbd") {
        total++;
        if (expanded.has(r.id)) openCount++;
      }
    } else if (r.kind === "jtbd") {
      if (layer === "jtbd") {
        total++;
        if (expanded.has(r.id)) openCount++;
      }
    } else if (r.kind === "feature" && !r.isRef) {
      if (layer === "jtbd" || layer === "feature") {
        total++;
        if (expanded.has(r.rowKey)) openCount++;
      }
    } else if (r.kind === "entity" && !r.isRef) {
      if (layer === "entity") {
        // Count distinct service categories instead of individual entities,
        // since the entity table groups by service.
        // Handled via a separate pass below.
      }
    }
  }
  if (layer === "entity") {
    const cats = new Set<string>();
    for (const r of rows) {
      if (r.kind === "entity" && !r.isRef)
        cats.add(`entcat:${r.entity.service}`);
    }
    for (const c of cats) {
      total++;
      if (expanded.has(c)) openCount++;
    }
  }
  if (layer === "field") {
    const ents = new Set<string>();
    for (const r of rows) {
      if (r.kind === "entity" && !r.isRef) ents.add(`fldent:${r.entity.id}`);
    }
    for (const e of ents) {
      total++;
      if (expanded.has(e)) openCount++;
    }
  }
  if (total === 0) return false;
  return openCount > total / 2;
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </span>
      <div className="flex items-center gap-0.5 rounded-lg bg-bg-subtle p-[3px]">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-md px-2.5 py-[4px] text-[12px] font-medium transition-colors ${
                active
                  ? "bg-primary text-white shadow-[0_1px_2px_rgba(91,95,207,0.35)]"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
