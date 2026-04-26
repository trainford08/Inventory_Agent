"use client";

import { useMemo, useState } from "react";
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

type Destination = "all" | "ado" | "gh" | "both";
type PatternFilter = "all" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
type LayerFilter = "jtbd" | "feature" | "entity" | "field" | "customization";

export function InventoryProfile({
  groups,
  customizations,
}: {
  groups: CategoryGroup[];
  customizations: CustomizationsBlock;
}) {
  const rows = useMemo(() => buildRows(groups), [groups]);

  const [destination, setDestination] = useState<Destination>("all");
  const [patternFilter, setPatternFilter] = useState<PatternFilter>("all");
  const [layer, setLayer] = useState<LayerFilter>("jtbd");

  const initialExpanded = useMemo(() => {
    const set = new Set<string>();
    // Expand cats + JTBDs + non-ref features + non-ref entities by default
    // so the full nested structure is visible from the start in any layer.
    for (const r of rows) {
      if (r.kind === "cat" || r.kind === "jtbd") set.add(r.id);
      else if (r.kind === "feature" && !r.isRef) set.add(r.rowKey);
      else if (r.kind === "entity" && !r.isRef) set.add(r.rowKey);
    }
    return set;
  }, [rows]);

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  // Customizations section — collapsed by default in All-layers view.
  const [customExpanded, setCustomExpanded] = useState(false);

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
    setExpanded(next);
  };

  const collapseAll = () => {
    const next = new Set<string>();
    for (const r of rows) if (r.kind === "cat") next.add(r.id);
    setExpanded(next);
  };

  const matchesFilters = (r: Row): boolean => {
    if (r.kind === "cat") return true;
    if (r.kind === "field") {
      if (patternFilter !== "all" && r.field.pattern !== patternFilter)
        return false;
      return true;
    }
    if (destination !== "all") {
      const stays =
        r.kind === "jtbd"
          ? r.jtbd.staysInAdo
          : r.kind === "feature"
            ? r.feature.staysInAdo
            : r.entity.staysInAdo;
      if (stays !== destination) return false;
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
      // Features as top-level (deduped) with nested entities. Skip cats/JTBDs.
      const seen = new Set<string>();
      const allowedFeatureKey = new Set<string>();
      const out: Row[] = [];
      for (const r of rows) {
        if (r.kind === "feature" && !r.isRef && matchesFilters(r)) {
          if (seen.has(r.feature.id)) continue;
          seen.add(r.feature.id);
          allowedFeatureKey.add(r.rowKey);
          out.push(r);
          continue;
        }
        if (
          r.kind === "entity" &&
          !r.isRef &&
          matchesFilters(r) &&
          allowedFeatureKey.has(r.parentId) &&
          expanded.has(r.parentId)
        ) {
          out.push(r);
        }
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
    // layer === "field" → flat view; filter by destination at entity level
    // and pattern at field level (an entity is kept if it has any matching field).
    const seenEnt = new Set<string>();
    const flat: Row[] = [];
    for (const r of rows) {
      if (r.kind !== "entity" || r.isRef) continue;
      if (seenEnt.has(r.entity.id)) continue;
      if (destination !== "all" && r.entity.staysInAdo !== destination)
        continue;
      const hasFieldMatch =
        patternFilter === "all" ||
        r.entity.fields.some((f) => f.pattern === patternFilter);
      if (!hasFieldMatch) continue;
      seenEnt.add(r.entity.id);
      flat.push(r);
    }
    return flat;
  })();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-bg-elevated p-3">
        {layer !== "customization" && layer !== "field" ? (
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
        <ChipGroup
          label="Destination"
          value={destination}
          onChange={(v) => setDestination(v as Destination)}
          options={[
            { value: "all", label: "All" },
            { value: "gh", label: "→ GitHub" },
            { value: "ado", label: "→ ADO" },
            { value: "both", label: "Hybrid" },
          ]}
        />
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
      </div>

      <div className="flex items-center">
        <span className="ml-auto font-mono text-[11px] text-ink-muted">
          {rows.filter((r) => r.kind === "jtbd").length} JTBDs ·{" "}
          {rows.filter((r) => r.kind === "feature").length} features ·{" "}
          {rows.filter((r) => r.kind === "entity").length} entities
        </span>
      </div>

      {layer === "customization" ? (
        <CustomizationsTable
          block={filterCustomizations(customizations, destination)}
        />
      ) : layer === "field" ? (
        <FieldTable rows={visibleRows} patternFilter={patternFilter} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <Th className="w-[44px] text-right">#</Th>
                <Th>Item</Th>
                <Th className="w-[13%]">Layer</Th>
                <Th className="w-[13%]">Stays in ADO?</Th>
                <Th className="w-[9%]">Pattern</Th>
                <Th className="w-[11%] text-right">Detail</Th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowNum = 0;
                return visibleRows.map((r) => {
                  const num = r.kind === "cat" ? null : ++rowNum;
                  return (
                    <RowView
                      key={rowKey(r)}
                      row={r}
                      rowNum={num}
                      expanded={expanded}
                      onToggle={toggle}
                    />
                  );
                });
              })()}
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

      <Legend />
    </div>
  );
}

function filterCustomizations(
  block: CustomizationsBlock,
  destination: Destination,
): CustomizationsBlock {
  if (destination === "all") return block;
  const placementMatches = (placement: string | null): boolean => {
    if (!placement) return false;
    if (destination === "ado") return placement === "STAYS";
    if (destination === "gh") return placement === "MOVES";
    if (destination === "both")
      return placement === "BOTH" || placement === "MIXED";
    return true;
  };
  const byCategory = block.byCategory
    .map((g) => ({
      category: g.category,
      rows: g.rows.filter((r) => placementMatches(r.hybridPlacement)),
    }))
    .filter((g) => g.rows.length > 0);
  const allRows = byCategory.flatMap((g) => g.rows);
  return {
    total: allRows.length,
    cataloged: allRows.filter((r) => r.catalogCode).length,
    teamSpecific: allRows.filter((r) => !r.catalogCode).length,
    byCategory,
  };
}

function FieldTable({
  rows,
  patternFilter,
}: {
  rows: Row[];
  patternFilter: PatternFilter;
}) {
  let rowNum = 0;
  const fieldsForEntity = (e: Row & { kind: "entity" }) =>
    patternFilter === "all"
      ? e.entity.fields
      : e.entity.fields.filter((f) => f.pattern === patternFilter);
  const totalFields = rows.reduce(
    (n, r) => (r.kind === "entity" ? n + fieldsForEntity(r).length : n),
    0,
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
      <div className="border-b border-border bg-bg-muted px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
        {totalFields} fields across{" "}
        {rows.filter((r) => r.kind === "entity").length} entities
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <Th className="w-[44px] text-right">#</Th>
            <Th className="w-[7%]">Field ID</Th>
            <Th className="w-[10%]">Entity</Th>
            <Th>ADO Field</Th>
            <Th className="w-[9%]">Data type</Th>
            <Th>GitHub target</Th>
            <Th className="w-[6%]">Pattern</Th>
            <Th className="w-[8%]">Preservation</Th>
            <Th>Strategy</Th>
            <Th>Notes</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            if (r.kind !== "entity") return null;
            const e = r.entity;
            const visibleFields = fieldsForEntity(r);
            if (visibleFields.length === 0) return null;
            const entityHeader = (
              <tr key={`hdr-${e.id}`} className="bg-bg-muted">
                <td
                  colSpan={10}
                  className="px-4 py-[7px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft"
                >
                  {e.id} · {e.name} <span className="text-ink-faint">·</span>{" "}
                  <span className="text-ink-muted">{e.serviceLabel}</span>{" "}
                  <span className="ml-2 text-ink-faint">
                    ({visibleFields.length} fields)
                  </span>
                </td>
              </tr>
            );
            const fieldRows = visibleFields.map((fld) => {
              const num = ++rowNum;
              return (
                <tr key={fld.id} className="bg-success/[0.03]">
                  <NumTd>{num}</NumTd>
                  <Td className="font-mono text-[10px] text-ink-muted">
                    {fld.id}
                  </Td>
                  <Td className="font-mono text-[10.5px] text-ink-soft">
                    {fld.entityId}
                  </Td>
                  <Td>
                    <span className="font-medium text-ink">{fld.name}</span>
                  </Td>
                  <Td className="font-mono text-[10.5px] text-ink-soft">
                    {fld.dataType}
                  </Td>
                  <Td className="text-[11.5px] italic text-ink-soft">
                    {fld.githubTarget}
                  </Td>
                  <Td>
                    {fld.pattern === "na" ? (
                      <span className="font-mono text-[10px] text-ink-faint">
                        N/A
                      </span>
                    ) : (
                      <PatternBadge value={fld.pattern} />
                    )}
                  </Td>
                  <Td>
                    <FidelityBadge value={fld.dataPreservation} />
                  </Td>
                  <Td className="text-[11.5px] italic leading-snug text-ink-soft">
                    {fld.strategy}
                  </Td>
                  <Td className="text-[11.5px] leading-snug text-ink-soft">
                    {fld.notes}
                  </Td>
                </tr>
              );
            });
            return [entityHeader, ...fieldRows];
          })}
        </tbody>
      </table>
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

function rowKey(r: Row): string {
  if (r.kind === "cat") return r.id;
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
}: {
  row: Row;
  rowNum: number | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (row.kind === "cat") {
    const isOpen = expanded.has(row.id);
    return (
      <tr className="border-t-2 border-ink/60 bg-bg-muted">
        <td colSpan={6} className="px-4 py-[9px]">
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

  if (row.kind === "jtbd") {
    const isOpen = expanded.has(`jtbd:${row.jtbd.id}`);
    const featCount = row.jtbd.featureNodes.length;
    return (
      <tr className="bg-primary/[0.05]">
        <NumTd>{rowNum}</NumTd>
        <Td>
          <IndentCell level={1}>
            <ToggleButton
              onClick={() => onToggle(`jtbd:${row.jtbd.id}`)}
              open={isOpen}
              hasChildren={featCount > 0}
              tone="primary"
            />
            <LayerTag kind="jtbd" />
            <span className="font-semibold text-ink">
              {row.jtbd.id} · {row.jtbd.name}
            </span>
          </IndentCell>
        </Td>
        <Td>Job-to-be-done</Td>
        <Td>
          <StaysBadge value={row.jtbd.staysInAdo} />
        </Td>
        <Td>—</Td>
        <Td className="text-right font-mono text-[11.5px] text-ink-muted">
          {featCount} {featCount === 1 ? "feature" : "features"}
        </Td>
      </tr>
    );
  }

  if (row.kind === "feature") {
    const isOpen = expanded.has(row.rowKey);
    const entityCount = row.feature.entityNodes.length;
    return (
      <tr className={row.isRef ? "bg-warn/[0.02]" : "bg-warn/[0.04]"}>
        <NumTd>{rowNum}</NumTd>
        <Td>
          <IndentCell level={2}>
            <ToggleButton
              onClick={() => onToggle(row.rowKey)}
              open={isOpen}
              hasChildren={!row.isRef && entityCount > 0}
              tone="warn"
            />
            <LayerTag kind="feature" />
            <span className={muted(row.isRef, "text-ink")}>
              {row.feature.id} · {row.feature.name}
              {row.isRef ? (
                <span className="ml-2 font-mono text-[10.5px] text-ink-faint">
                  (shared · see first occurrence)
                </span>
              ) : null}
            </span>
          </IndentCell>
        </Td>
        <Td className={muted(row.isRef)}>
          {row.isRef ? "Feature (ref)" : "Feature"}
        </Td>
        <Td>
          <StaysBadge value={row.feature.staysInAdo} faded={row.isRef} />
        </Td>
        <Td>
          <PatternBadge value={row.feature.pattern} faded={row.isRef} />
        </Td>
        <Td className="text-right font-mono text-[11.5px] text-ink-muted">
          {row.isRef
            ? "—"
            : `${entityCount} ${entityCount === 1 ? "entity" : "entities"}`}
        </Td>
      </tr>
    );
  }

  if (row.kind === "entity") {
    const isOpen = expanded.has(row.rowKey);
    const hasFields = !row.isRef && row.entity.fields.length > 0;
    return (
      <tr className={row.isRef ? "bg-success/[0.02]" : "bg-success/[0.04]"}>
        <NumTd>{rowNum}</NumTd>
        <Td>
          <IndentCell level={3}>
            <ToggleButton
              onClick={() => onToggle(row.rowKey)}
              open={isOpen}
              hasChildren={hasFields}
              tone="success"
            />
            <LayerTag kind="entity" />
            <span className={muted(row.isRef, "text-ink")}>
              {row.entity.id} · {row.entity.name}
              {row.isRef ? (
                <span className="ml-2 font-mono text-[10.5px] text-ink-faint">
                  (shared)
                </span>
              ) : null}
              <span className="ml-2 rounded-full bg-bg-elevated px-1.5 py-[1px] font-mono text-[10px] text-ink-muted ring-1 ring-inset ring-border">
                {row.entity.serviceLabel}
              </span>
            </span>
          </IndentCell>
        </Td>
        <Td className={muted(row.isRef)}>
          {row.isRef ? "Entity (ref)" : "Entity"}
        </Td>
        <Td>
          <StaysBadge value={row.entity.staysInAdo} faded={row.isRef} />
        </Td>
        <Td>
          <PatternBadge value={row.entity.pattern} faded={row.isRef} />
        </Td>
        <Td className="text-right font-mono text-[11.5px] text-ink-muted">
          {row.isRef ? "—" : `${row.entity.fieldCount} fields`}
        </Td>
      </tr>
    );
  }

  // field
  const fld = row.field;
  return (
    <tr className="bg-slate-50">
      <NumTd>{rowNum}</NumTd>
      <Td>
        <IndentCell level={4}>
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
      <Td>Field</Td>
      <Td>—</Td>
      <Td>
        {fld.pattern === "na" ? (
          <span className="font-mono text-[10px] text-ink-faint">N/A</span>
        ) : (
          <PatternBadge value={fld.pattern} />
        )}
      </Td>
      <Td className="text-right text-[11px] italic text-ink-soft">
        → {fld.githubTarget}
      </Td>
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
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const pad = { 1: 0, 2: 40, 3: 80, 4: 120 }[level];
  const guideColor =
    level === 2
      ? "border-amber-300"
      : level === 3
        ? "border-emerald-300"
        : level === 4
          ? "border-slate-300"
          : "";
  return (
    <div
      className={`relative flex items-center gap-1.5 ${
        level > 1 ? `border-l-2 ${guideColor}` : ""
      }`}
      style={{ paddingLeft: pad, marginLeft: level > 1 ? 8 : 0 }}
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

function Caret({ open, tone }: { open: boolean; tone: "ink" }) {
  return (
    <span
      className={`font-mono text-[11px] ${tone === "ink" ? "text-ink" : ""}`}
    >
      {open ? "▼" : "▶"}
    </span>
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

function PatternBadge({
  value,
  faded = false,
}: {
  value: "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
  faded?: boolean;
}) {
  const map = {
    P1: "text-emerald-700 border-emerald-700",
    P2: "text-amber-700 border-amber-700",
    P3: "text-primary border-primary",
    P4: "text-amber-700 border-amber-700",
    P5: "text-rose-700 border-rose-700",
    P6: "text-rose-700 border-rose-700 bg-rose-50",
  }[value];
  return (
    <span
      className={`inline-block rounded-[3px] border px-[5px] py-[1px] font-mono text-[10px] font-semibold ${map} ${faded ? "opacity-50" : ""}`}
    >
      {value}
    </span>
  );
}

function muted(isRef: boolean, baseText = ""): string {
  if (!isRef) return baseText;
  return `${baseText} text-ink-faint`;
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-bg-elevated px-5 py-3 text-[12px] text-ink-muted">
      <LegendItem swatch="bg-primary/[0.08]" label="JTBD row" />
      <LegendItem swatch="bg-warn/[0.08]" label="Feature row" />
      <LegendItem swatch="bg-success/[0.08]" label="Entity row" />
      <span className="text-ink-faint">
        Shared items show once in full, then as greyed reference rows.
      </span>
    </div>
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
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-3 py-[3px] font-mono text-[11px] text-ink-soft hover:text-ink"
      aria-pressed={isExpanded}
    >
      <span className="text-[10px]">{isExpanded ? "▼" : "▶"}</span>
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
        total++;
        if (expanded.has(r.rowKey)) openCount++;
      }
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

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-[14px] w-[14px] rounded-[3px] border border-border ${swatch}`}
      />
      {label}
    </span>
  );
}
