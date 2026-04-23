import type { ReactNode } from "react";

type Gradient = "indigo" | "teal" | "emerald" | "slate";

const GRADIENTS: Record<Gradient, string> = {
  indigo: "from-indigo-400 to-violet-500",
  teal: "from-cyan-400 to-sky-500",
  emerald: "from-emerald-400 to-green-500",
  slate: "from-slate-400 to-slate-600",
};

export type Person = {
  role: string;
  name: string;
  sub?: string;
  gradient?: Gradient;
};

export function HeroPeople({
  people,
  more,
}: {
  people: Person[];
  more?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-[14px]">
      {people.map((p, i) => (
        <div
          key={i}
          className={`flex min-w-0 flex-1 items-center gap-[10px] pr-4 ${
            i < people.length - 1 || more ? "border-r border-border-subtle" : ""
          }`}
        >
          <Avatar
            initial={initialOf(p.name)}
            gradient={p.gradient ?? "indigo"}
          />
          <div className="min-w-0">
            <div className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {p.role}
            </div>
            <div className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-ink">
              {p.name}
            </div>
            {p.sub ? (
              <div className="truncate text-[11.5px] text-ink-muted">
                {p.sub}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      {more ? (
        <div className="flex-shrink-0 pl-2 text-[12.5px] font-medium text-primary">
          {more}
        </div>
      ) : null}
    </div>
  );
}

function Avatar({
  initial,
  gradient,
}: {
  initial: string;
  gradient: Gradient;
}) {
  return (
    <span
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${GRADIENTS[gradient]} text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`}
    >
      {initial}
    </span>
  );
}

function initialOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}
