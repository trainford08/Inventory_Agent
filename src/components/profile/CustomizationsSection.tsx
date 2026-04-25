import type { TeamProfile } from "@/server/teams";
import { CustomizationStatusBadge } from "../StatusBadge";
import { Section } from "../Section";

export function CustomizationsSection({ team }: { team: TeamProfile }) {
  if (team.customizations.length === 0) {
    return (
      <Section title="Customizations">
        <p className="text-sm italic text-ink-muted">
          No customizations detected.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Customizations"
      badge={`${team.customizations.length} ${team.customizations.length === 1 ? "item" : "items"}`}
    >
      <div className="space-y-3">
        {team.customizations.map((c) => (
          <div
            key={c.id}
            className="rounded-md border border-border-subtle p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm text-ink">{c.description}</div>
              <CustomizationStatusBadge status={c.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-muted">
              <span>{c.category}</span>
              {c.strategy ? (
                <>
                  <span className="text-ink-faint">·</span>
                  <span>Strategy: {c.strategy}</span>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
