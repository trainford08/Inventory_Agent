"use client";

import { useMemo, useState } from "react";
import type { CategoryGroup, FeatureNode, JtbdNode } from "@/server/inventory";

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
    };

type Destination = "all" | "ado" | "gh" | "both";
type PatternFilter = "all" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
type LayerFilter = "all" | "jtbd" | "feature" | "entity" | "field";

export function InventoryProfile({ groups }: { groups: CategoryGroup[] }) {
  const rows = useMemo(() => buildRows(groups), [groups]);

  const [destination, setDestination] = useState<Destination>("all");
  const [patternFilter, setPatternFilter] = useState<PatternFilter>("all");
  const [layer, setLayer] = useState<LayerFilter>("all");

  const initialExpanded = useMemo(() => {
    const set = new Set<string>();
    // Expand category headers & JTBDs by default so structure is visible.
    for (const r of rows)
      if (r.kind === "cat" || r.kind === "jtbd") set.add(r.id);
    return set;
  }, [rows]);

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

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
      else if (r.kind === "feature" && !r.isRef) next.add(r.rowKey);
      else if (r.kind === "entity" && !r.isRef) next.add(r.rowKey);
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
      if (r.kind === "jtbd") return false; // JTBDs have no pattern
      const p = r.kind === "feature" ? r.feature.pattern : r.entity.pattern;
      if (p !== patternFilter) return false;
    }
    return true;
  };

  // Layer "all" → tree with collapse semantics; other layers → flat list of that layer.
  const visibleRows: Row[] = (() => {
    if (layer === "all") {
      return rows.filter((r) => {
        if (!matchesFilters(r)) return false;
        if (r.kind === "cat") return true;
        if (r.kind === "jtbd") return expanded.has(`cat:${r.jtbd.category}`);
        if (r.kind === "feature") return expanded.has(r.parentId);
        if (r.kind === "entity") return expanded.has(r.parentId);
        return false;
      });
    }
    // Flat layer view: show category headers (JTBD layer only) + matching rows.
    // Dedupe features/entities by id.
    const seen = new Set<string>();
    const flat: Row[] = [];
    let pendingCat: (Row & { kind: "cat" }) | null = null;
    let catEmitted = false;
    for (const r of rows) {
      if (r.kind === "cat") {
        pendingCat = r;
        catEmitted = false;
        continue;
      }
      if (r.kind === "jtbd" && layer === "jtbd" && matchesFilters(r)) {
        if (pendingCat && !catEmitted) {
          flat.push(pendingCat);
          catEmitted = true;
        }
        flat.push(r);
        continue;
      }
      if (r.kind === "feature" && layer === "feature" && matchesFilters(r)) {
        if (seen.has(r.feature.id)) continue;
        seen.add(r.feature.id);
        flat.push({ ...r, isRef: false });
        continue;
      }
      if (
        r.kind === "entity" &&
        (layer === "entity" || layer === "field") &&
        matchesFilters(r)
      ) {
        if (seen.has(r.entity.id)) continue;
        seen.add(r.entity.id);
        flat.push({ ...r, isRef: false });
        continue;
      }
    }
    return flat;
  })();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ChipGroup
          label="View"
          value={layer}
          onChange={(v) => setLayer(v as LayerFilter)}
          options={[
            { value: "all", label: "All layers" },
            { value: "jtbd", label: "JTBDs only" },
            { value: "feature", label: "Features only" },
            { value: "entity", label: "Entities only" },
            { value: "field", label: "Fields only" },
          ]}
        />
        <ChipGroup
          label="Destination"
          value={destination}
          onChange={(v) => setDestination(v as Destination)}
          options={[
            { value: "all", label: "All" },
            { value: "gh", label: "Moves to GitHub" },
            { value: "ado", label: "Stays in ADO" },
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

      <div className="flex items-center gap-2">
        {layer === "all" ? (
          <>
            <button
              onClick={expandAll}
              className="rounded-md border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] text-ink-muted hover:text-ink"
            >
              Expand all
            </button>
            <button
              onClick={collapseAll}
              className="rounded-md border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] text-ink-muted hover:text-ink"
            >
              Collapse all
            </button>
          </>
        ) : null}
        <span className="ml-auto font-mono text-[11px] text-ink-muted">
          {rows.filter((r) => r.kind === "jtbd").length} JTBDs ·{" "}
          {rows.filter((r) => r.kind === "feature").length} features ·{" "}
          {rows.filter((r) => r.kind === "entity").length} entities
        </span>
      </div>

      {layer === "all" ? (
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
      ) : layer === "jtbd" ? (
        <JtbdTable rows={visibleRows} />
      ) : layer === "feature" ? (
        <FeatureTable rows={visibleRows} />
      ) : layer === "entity" ? (
        <EntityTable rows={visibleRows} />
      ) : (
        <FieldTable rows={visibleRows} />
      )}

      <Legend />
    </div>
  );
}

/* ================ Layer-specific tables ================ */

function JtbdTable({ rows }: { rows: Row[] }) {
  let rowNum = 0;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <Th className="w-[44px] text-right">#</Th>
            <Th className="w-[6%]">ID</Th>
            <Th>Job-to-be-done</Th>
            <Th className="w-[10%]">Persona</Th>
            <Th className="w-[8%]">Frequency</Th>
            <Th className="w-[12%]">Stays in ADO?</Th>
            <Th>Migration impact</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            if (r.kind === "cat") {
              return (
                <tr key={r.id} className="border-t-2 border-ink/60 bg-bg-muted">
                  <td
                    colSpan={7}
                    className="px-4 py-[9px] font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink"
                  >
                    {r.label}
                  </td>
                </tr>
              );
            }
            if (r.kind !== "jtbd") return null;
            const j = r.jtbd;
            const num = ++rowNum;
            return (
              <tr key={r.id} className="bg-primary/[0.04]">
                <NumTd>{num}</NumTd>
                <Td className="font-mono text-[10.5px] text-ink-muted">
                  {j.id}
                </Td>
                <Td>
                  <span className="font-medium text-ink">{j.name}</span>
                </Td>
                <Td className="font-mono text-[11px] text-ink-soft">
                  {j.persona}
                </Td>
                <Td className="font-mono text-[11px] text-ink-soft">
                  {j.frequency}
                </Td>
                <Td>
                  <StaysBadge value={j.staysInAdo} />
                </Td>
                <Td className="text-[12px] leading-snug text-ink-soft">
                  {j.impact}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FeatureTable({ rows }: { rows: Row[] }) {
  let rowNum = 0;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <Th className="w-[44px] text-right">#</Th>
            <Th className="w-[6%]">ID</Th>
            <Th>Feature</Th>
            <Th className="w-[12%]">Stays in ADO?</Th>
            <Th className="w-[8%]">Pattern</Th>
            <Th className="w-[10%] text-right">Entities</Th>
            <Th>Preservation strategy</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            if (r.kind !== "feature") return null;
            const f = r.feature;
            const num = ++rowNum;
            return (
              <tr key={r.rowKey} className="bg-warn/[0.04]">
                <NumTd>{num}</NumTd>
                <Td className="font-mono text-[10.5px] text-ink-muted">
                  {f.id}
                </Td>
                <Td>
                  <span className="font-medium text-ink">{f.name}</span>
                </Td>
                <Td>
                  <StaysBadge value={f.staysInAdo} />
                </Td>
                <Td>
                  <PatternBadge value={f.pattern} />
                </Td>
                <Td className="text-right font-mono text-[11.5px] text-ink-muted">
                  {f.entityNodes.length}
                </Td>
                <Td className="text-[12px] italic leading-snug text-ink-soft">
                  {f.preservationStrategy}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EntityTable({ rows }: { rows: Row[] }) {
  let rowNum = 0;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <Th className="w-[44px] text-right">#</Th>
            <Th className="w-[6%]">ID</Th>
            <Th>ADO Entity</Th>
            <Th className="w-[10%]">Service</Th>
            <Th className="w-[10%]">Data preservation</Th>
            <Th className="w-[11%]">Capability preservation</Th>
            <Th className="w-[8%]">Pattern</Th>
            <Th className="w-[12%]">Stays in ADO?</Th>
            <Th className="w-[8%] text-right">Fields</Th>
            <Th>Migration note</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            if (r.kind !== "entity") return null;
            const e = r.entity;
            const num = ++rowNum;
            return (
              <tr key={r.rowKey} className="bg-success/[0.04]">
                <NumTd>{num}</NumTd>
                <Td className="font-mono text-[10.5px] text-ink-muted">
                  {e.id}
                </Td>
                <Td>
                  <span className="font-medium text-ink">{e.name}</span>
                </Td>
                <Td className="font-mono text-[11px] text-ink-soft">
                  {e.serviceLabel}
                </Td>
                <Td>
                  <FidelityBadge value={e.dataPreservation} />
                </Td>
                <Td>
                  <FidelityBadge value={e.capabilityPreservation} />
                </Td>
                <Td>
                  <PatternBadge value={e.pattern} />
                </Td>
                <Td>
                  <StaysBadge value={e.staysInAdo} />
                </Td>
                <Td className="text-right font-mono text-[11.5px] text-ink-muted">
                  {e.fieldCount}
                </Td>
                <Td className="text-[12px] leading-snug text-ink-soft">
                  {e.note}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FieldTable({ rows }: { rows: Row[] }) {
  let rowNum = 0;
  const totalFields = rows.reduce(
    (n, r) => (r.kind === "entity" ? n + r.entity.fields.length : n),
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
            const entityHeader = (
              <tr key={`hdr-${e.id}`} className="bg-bg-muted">
                <td
                  colSpan={10}
                  className="px-4 py-[7px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft"
                >
                  {e.id} · {e.name} <span className="text-ink-faint">·</span>{" "}
                  <span className="text-ink-muted">{e.serviceLabel}</span>{" "}
                  <span className="ml-2 text-ink-faint">
                    ({e.fields.length} fields)
                  </span>
                </td>
              </tr>
            );
            const fieldRows = e.fields.map((fld) => {
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

  // entity
  return (
    <tr className={row.isRef ? "bg-success/[0.02]" : "bg-success/[0.04]"}>
      <NumTd>{rowNum}</NumTd>
      <Td>
        <IndentCell level={3}>
          <ToggleButton open={false} hasChildren={false} tone="success" />
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
  level: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const pad = { 1: 0, 2: 22, 3: 44 }[level];
  return (
    <div className="flex items-center gap-1.5" style={{ paddingLeft: pad }}>
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
    <div className="flex items-center gap-1.5">
      <span className="mr-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </span>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-2.5 py-[3px] text-[11.5px] transition-colors ${
              active
                ? "border-ink bg-ink text-white"
                : "border-border bg-bg-elevated text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
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
