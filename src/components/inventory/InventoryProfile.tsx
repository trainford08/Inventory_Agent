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

export function InventoryProfile({ groups }: { groups: CategoryGroup[] }) {
  const rows = useMemo(() => buildRows(groups), [groups]);

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

  const visibleRows = rows.filter((r) => {
    if (r.kind === "cat") return true;
    if (r.kind === "jtbd") {
      // Show if its category is expanded
      const catId = `cat:${r.jtbd.category}`;
      return expanded.has(catId);
    }
    if (r.kind === "feature") {
      return expanded.has(r.parentId);
    }
    if (r.kind === "entity") {
      return expanded.has(r.parentId);
    }
    return false;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
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
        <span className="ml-auto font-mono text-[11px] text-ink-muted">
          {rows.filter((r) => r.kind === "jtbd").length} JTBDs ·{" "}
          {rows.filter((r) => r.kind === "feature").length} features ·{" "}
          {rows.filter((r) => r.kind === "entity").length} entities
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <Th className="w-[46%]">Item</Th>
              <Th className="w-[13%]">Layer</Th>
              <Th className="w-[13%]">Stays in ADO?</Th>
              <Th className="w-[9%]">Pattern</Th>
              <Th className="w-[11%] text-right">Detail</Th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <RowView
                key={rowKey(r)}
                row={r}
                expanded={expanded}
                onToggle={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Legend />
    </div>
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
  expanded,
  onToggle,
}: {
  row: Row;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (row.kind === "cat") {
    const isOpen = expanded.has(row.id);
    return (
      <tr className="border-t-2 border-ink/60 bg-bg-muted">
        <td colSpan={5} className="px-4 py-[9px]">
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
