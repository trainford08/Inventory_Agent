import type { TeamProfile } from "@/server/teams";
import { Field } from "../Field";
import { Section } from "../Section";

export function OwnershipSection({ team }: { team: TeamProfile }) {
  const ownership = team.ownership;
  if (!ownership) {
    return (
      <Section title="Ownership">
        <p className="text-sm italic text-ink-muted">
          No ownership information captured.
        </p>
      </Section>
    );
  }

  return (
    <Section title="Ownership">
      <dl className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Field
          label="Primary owner"
          value={
            ownership.primaryOwnerEmail ? (
              <span className="font-mono text-xs">
                {ownership.primaryOwnerEmail}
              </span>
            ) : (
              "—"
            )
          }
        />
        <Field label="On-call group" value={ownership.onCallGroup ?? "—"} />
        <Field
          label="Escalation contact"
          value={
            ownership.escalationContact ? (
              <span className="font-mono text-xs">
                {ownership.escalationContact}
              </span>
            ) : (
              "—"
            )
          }
        />
      </dl>
    </Section>
  );
}
