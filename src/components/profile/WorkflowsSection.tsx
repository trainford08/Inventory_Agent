import type { TeamProfile } from "@/server/teams";
import { Badge } from "../Badge";
import { Section } from "../Section";

export function WorkflowsSection({ team }: { team: TeamProfile }) {
  if (team.workflows.length === 0) {
    return (
      <Section title="Workflows">
        <p className="text-sm italic text-ink-muted">No workflows captured.</p>
      </Section>
    );
  }

  return (
    <Section
      title="Workflows"
      badge={`${team.workflows.length} ${team.workflows.length === 1 ? "pipeline" : "pipelines"}`}
    >
      <div className="space-y-3">
        {team.workflows.map((w) => (
          <div
            key={w.id}
            className="rounded-md border border-border-subtle p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{w.name}</span>
              <Badge tone="neutral">{w.type}</Badge>
              {w.isClassic ? (
                <Badge tone="warn">classic</Badge>
              ) : (
                <Badge tone="success">yaml</Badge>
              )}
            </div>
            {w.customTasks.length > 0 ? (
              <div className="mt-2 text-xs text-ink-soft">
                <span className="font-medium">Custom tasks:</span>{" "}
                {w.customTasks.join(", ")}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
