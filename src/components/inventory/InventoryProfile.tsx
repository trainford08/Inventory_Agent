import type { CategoryGroup, FeatureNode, JtbdNode } from "@/server/inventory";

const STAYS_LABEL: Record<string, { label: string; tone: string }> = {
  ado: {
    label: "Stays in ADO",
    tone: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  gh: {
    label: "Moves to GitHub",
    tone: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  both: { label: "Hybrid", tone: "bg-sky-50 text-sky-800 ring-sky-200" },
  na: { label: "N/A", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
};

export function InventoryProfile({ groups }: { groups: CategoryGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center text-[13px] text-ink-muted">
        No JTBDs in scope yet for this team.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <CategorySection key={g.category} group={g} />
      ))}
    </div>
  );
}

function CategorySection({ group }: { group: CategoryGroup }) {
  return (
    <details className="group rounded-xl border border-border bg-bg-elevated open:shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3 hover:bg-bg-muted">
        <div className="flex items-center gap-3">
          <Chevron />
          <span className="text-[14px] font-semibold text-ink">
            {group.categoryLabel}
          </span>
          <span className="rounded-full bg-bg-muted px-2 py-[2px] font-mono text-[10.5px] text-ink-muted">
            {group.jtbds.length} JTBDs
          </span>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted">
          {countFeatures(group.jtbds)} features · {countEntities(group.jtbds)}{" "}
          entities
        </span>
      </summary>
      <div className="border-t border-border">
        {group.jtbds.map((j) => (
          <JtbdRow key={j.id} jtbd={j} />
        ))}
      </div>
    </details>
  );
}

function JtbdRow({ jtbd }: { jtbd: JtbdNode }) {
  const stays = STAYS_LABEL[jtbd.staysInAdo] ?? STAYS_LABEL.na;
  return (
    <details className="group/jtbd border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-3 hover:bg-bg-muted">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Chevron small />
            <span className="font-mono text-[10.5px] text-ink-muted">
              {jtbd.id}
            </span>
            <span className="text-[13px] font-medium text-ink">
              {jtbd.name}
            </span>
          </div>
          <div className="ml-5 mt-1 text-[12px] leading-snug text-ink-soft">
            {jtbd.impact}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-md px-1.5 py-[2px] text-[10.5px] font-medium ring-1 ring-inset ${stays!.tone}`}
          >
            {stays!.label}
          </span>
          <span className="font-mono text-[10.5px] text-ink-muted">
            {jtbd.frequency}
          </span>
        </div>
      </summary>
      <div className="bg-bg-muted/40 px-5 pb-3 pt-1">
        {jtbd.featureNodes.length === 0 ? (
          <div className="ml-5 text-[12px] italic text-ink-muted">
            No framework features mapped.
          </div>
        ) : (
          <div className="ml-5 space-y-1.5">
            {jtbd.featureNodes.map((f) => (
              <FeatureRow key={f.id} feature={f} />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function FeatureRow({ feature }: { feature: FeatureNode }) {
  const stays = STAYS_LABEL[feature.staysInAdo] ?? STAYS_LABEL.na;
  return (
    <details className="rounded-md border border-border bg-bg-elevated">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-bg-muted">
        <div className="flex min-w-0 items-center gap-2">
          <Chevron small />
          <span className="font-mono text-[10px] text-ink-muted">
            {feature.id}
          </span>
          <span className="truncate text-[12.5px] font-medium text-ink">
            {feature.name}
          </span>
          {feature.sharedAcrossJtbds > 1 ? (
            <span className="rounded-full bg-violet-50 px-2 py-[1px] font-mono text-[9.5px] text-violet-700 ring-1 ring-inset ring-violet-200">
              shared · {feature.sharedAcrossJtbds} JTBDs
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded px-1.5 py-[1px] text-[10px] font-medium ring-1 ring-inset ${stays!.tone}`}
          >
            {stays!.label}
          </span>
          <span className="font-mono text-[10px] text-ink-muted">
            {feature.pattern}
          </span>
        </div>
      </summary>
      <div className="border-t border-border px-3 py-2">
        <div className="mb-2 text-[11.5px] italic leading-snug text-ink-soft">
          {feature.preservationStrategy}
        </div>
        {feature.entityNodes.length === 0 ? (
          <div className="text-[11px] italic text-ink-muted">
            No entities mapped.
          </div>
        ) : (
          <ul className="space-y-1">
            {feature.entityNodes.map((e) => {
              const eStays = STAYS_LABEL[e.staysInAdo] ?? STAYS_LABEL.na;
              return (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded border border-border bg-bg-muted/40 px-2.5 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-muted">
                      {e.id}
                    </span>
                    <span className="truncate text-[12px] text-ink">
                      {e.name}
                    </span>
                    <span className="rounded-full bg-bg-elevated px-1.5 py-[1px] font-mono text-[9.5px] text-ink-muted ring-1 ring-inset ring-border">
                      {e.serviceLabel}
                    </span>
                    {e.sharedAcrossFeatures > 1 ? (
                      <span className="rounded-full bg-violet-50 px-1.5 py-[1px] font-mono text-[9.5px] text-violet-700 ring-1 ring-inset ring-violet-200">
                        shared · {e.sharedAcrossFeatures} features
                      </span>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-[1px] text-[9.5px] font-medium ring-1 ring-inset ${eStays!.tone}`}
                    >
                      {eStays!.label}
                    </span>
                    <span className="font-mono text-[9.5px] text-ink-muted">
                      {e.fieldCount} fields
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}

function Chevron({ small = false }: { small?: boolean }) {
  const size = small ? 10 : 12;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-ink-muted transition-transform group-open:rotate-90 group-open/jtbd:rotate-90"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function countFeatures(jtbds: JtbdNode[]): number {
  const set = new Set<string>();
  for (const j of jtbds) for (const f of j.featureNodes) set.add(f.id);
  return set.size;
}

function countEntities(jtbds: JtbdNode[]): number {
  const set = new Set<string>();
  for (const j of jtbds)
    for (const f of j.featureNodes)
      for (const e of f.entityNodes) set.add(e.id);
  return set.size;
}
