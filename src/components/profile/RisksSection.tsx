import type { TeamProfile } from "@/server/teams";
import { ConfidenceBadge } from "../ConfidenceBadge";
import { RiskStatusBadge } from "../StatusBadge";
import { Section } from "../Section";

export function RisksSection({ team }: { team: TeamProfile }) {
  if (team.risks.length === 0) {
    return (
      <Section title="Risks">
        <p className="text-sm italic text-ink-muted">No risks identified.</p>
      </Section>
    );
  }

  const openCount = team.risks.filter((r) => r.status === "OPEN").length;

  return (
    <Section
      title="Risks"
      badge={
        openCount > 0
          ? `${openCount} open · ${team.risks.length} total`
          : `${team.risks.length} total`
      }
    >
      <div className="space-y-3">
        {team.risks.map((r) => (
          <div
            key={r.id}
            className="rounded-md border border-border-subtle p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{r.title}</div>
                <div className="mt-1 text-xs text-ink-muted">{r.category}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ConfidenceBadge confidence={r.confidence} />
                <RiskStatusBadge status={r.status} />
              </div>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{r.detail}</p>
            {r.mitigation ? (
              <p className="mt-2 rounded-md bg-bg p-2 text-xs text-ink-soft">
                <span className="font-semibold">Mitigation:</span>{" "}
                {r.mitigation}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
