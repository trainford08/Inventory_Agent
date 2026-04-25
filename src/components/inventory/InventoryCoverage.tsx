import type { InventoryCoverage as Coverage } from "@/server/inventory";

const SERVICE_TONE: Record<string, string> = {
  ado: "bg-amber-400",
  gh: "bg-emerald-500",
  both: "bg-sky-500",
  na: "bg-slate-300",
};

export function InventoryCoverage({ coverage }: { coverage: Coverage }) {
  if (coverage.jtbds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center text-[13px] text-ink-muted">
        No coverage data — this team has no JTBDs in scope.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Legend />
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated">
        <table className="w-max min-w-full border-collapse text-[11.5px]">
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 w-[260px] min-w-[260px] border-b border-r border-border bg-bg-elevated px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted"
                rowSpan={2}
              >
                JTBD ↓ &nbsp; / &nbsp; Feature →
              </th>
              {coverage.features.map((f) => (
                <th
                  key={f.id}
                  className="border-b border-border bg-bg-elevated px-1 py-2 align-bottom"
                  title={f.name}
                >
                  <div className="flex h-[140px] w-[28px] items-end justify-center">
                    <span className="origin-bottom-left translate-x-[8px] -rotate-[60deg] whitespace-nowrap font-mono text-[10px] text-ink">
                      {f.id} · {truncate(f.name, 28)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              {coverage.features.map((f) => (
                <th
                  key={`${f.id}-tone`}
                  className="border-b border-border bg-bg-elevated px-0 py-0"
                >
                  <div
                    className={`mx-auto h-[3px] w-[28px] ${SERVICE_TONE[f.staysInAdo] ?? "bg-slate-300"}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coverage.jtbds.map((j) => (
              <tr key={j.id} className="hover:bg-bg-muted/40">
                <td
                  className="sticky left-0 z-10 border-b border-r border-border bg-bg-elevated px-3 py-1.5"
                  title={j.impact}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-muted">
                      {j.id}
                    </span>
                    <span className="truncate text-[11.5px] text-ink">
                      {j.name}
                    </span>
                  </div>
                </td>
                {coverage.features.map((f) => {
                  const cell = coverage.cells[`${j.id}::${f.id}`];
                  return (
                    <td
                      key={`${j.id}-${f.id}`}
                      className="border-b border-border px-0 py-0 text-center"
                    >
                      <Cell kind={cell?.kind} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {coverage.orphanFeatures.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="mb-1 text-[12.5px] font-semibold text-amber-900">
            {coverage.orphanFeatures.length} orphan features
          </div>
          <p className="mb-2 text-[11.5px] text-amber-800">
            Listed in the framework but no in-scope JTBD claims them. Either the
            seed underspecifies, or these features only matter in other cohorts.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {coverage.orphanFeatures.map((f) => (
              <span
                key={f.id}
                className="rounded-full bg-bg-elevated px-2 py-[2px] font-mono text-[10px] text-ink-muted ring-1 ring-inset ring-border"
              >
                {f.id} · {f.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Cell({ kind }: { kind?: "primary" | "secondary" }) {
  if (!kind) return <div className="mx-auto h-[18px] w-[28px]" aria-hidden />;
  if (kind === "primary") {
    return (
      <div
        className="mx-auto h-[10px] w-[10px] rounded-full bg-primary"
        title="Primary feature"
      />
    );
  }
  return (
    <div
      className="mx-auto h-[8px] w-[8px] rounded-full bg-primary/40 ring-1 ring-inset ring-primary/40"
      title="Secondary feature"
    />
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-[10px] w-[10px] rounded-full bg-primary" /> primary
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-[8px] w-[8px] rounded-full bg-primary/40 ring-1 ring-inset ring-primary/40" />{" "}
        secondary
      </span>
      <span className="ml-2 inline-flex items-center gap-1.5">
        <span className="h-[3px] w-[16px] bg-emerald-500" /> moves to GitHub
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-[3px] w-[16px] bg-amber-400" /> stays in ADO
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-[3px] w-[16px] bg-sky-500" /> hybrid
      </span>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
