import { relativeTime } from "@/lib/time";
import type { TeamProfile } from "@/server/teams";
import { Badge } from "../Badge";
import { Field } from "../Field";
import { Section } from "../Section";

export function CodebaseSection({ team }: { team: TeamProfile }) {
  const codebase = team.codebase;
  if (!codebase) {
    return (
      <Section title="Codebase">
        <p className="text-sm italic text-ink-muted">
          No codebase information captured.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Codebase"
      badge={`${codebase.repos.length} ${codebase.repos.length === 1 ? "repo" : "repos"}`}
    >
      <dl className="mb-5 grid grid-cols-3 gap-6">
        <Field label="Primary language" value={codebase.primaryLang ?? "—"} />
        <Field
          label="Total size"
          value={
            codebase.totalSizeGb !== null ? `${codebase.totalSizeGb} GB` : "—"
          }
        />
        <Field label="Git LFS" value={codebase.usesLfs ? "Yes" : "No"} />
      </dl>

      <div className="divide-y divide-border-subtle border-t border-border-subtle">
        {codebase.repos.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink">{r.name}</span>
                <span className="text-xs text-ink-muted">
                  · {r.defaultBranch}
                </span>
                {r.defaultBranch !== "main" ? (
                  <Badge tone="warn">non-standard branch</Badge>
                ) : null}
                {r.isArchived ? <Badge tone="neutral">archived</Badge> : null}
                {r.hasSubmodules ? (
                  <Badge tone="primary">submodules</Badge>
                ) : null}
              </div>
              {r.primaryOwner ? (
                <div className="mt-1 text-xs text-ink-muted">
                  Owner: {r.primaryOwner}
                </div>
              ) : null}
            </div>
            <div className="shrink-0 text-right text-xs text-ink-muted">
              <div>{r.sizeGb !== null ? `${r.sizeGb} GB` : "—"}</div>
              <div>
                {r.lastCommitAt
                  ? `last commit ${relativeTime(r.lastCommitAt)}`
                  : "no commits"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
