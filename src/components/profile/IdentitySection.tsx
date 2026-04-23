import { Field } from "../Field";
import { Section } from "../Section";
import type { TeamProfile } from "@/server/teams";

export function IdentitySection({ team }: { team: TeamProfile }) {
  return (
    <Section title="Identity">
      <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <Field label="Team" value={team.name} />
        <Field
          label="Slug"
          value={<span className="font-mono">{team.slug}</span>}
        />
        <Field label="Organization" value={team.org.name} />
        <Field label="Members" value={team.members.length} />
        <Field
          label="Champion"
          value={
            team.champion ? (
              <span>
                {team.champion.name}
                <span className="ml-1 text-ink-muted">
                  · {team.champion.role}
                </span>
              </span>
            ) : (
              "—"
            )
          }
        />
        <Field
          label="Champion email"
          value={
            team.champion ? (
              <span className="font-mono text-xs">{team.champion.email}</span>
            ) : (
              "—"
            )
          }
        />
      </dl>
    </Section>
  );
}
