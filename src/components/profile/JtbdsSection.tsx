import type { TeamProfile } from "@/server/teams";
import { Section } from "../Section";

export function JtbdsSection({ team }: { team: TeamProfile }) {
  if (team.jtbds.length === 0) {
    return (
      <Section title="JTBDs performed">
        <p className="text-sm italic text-ink-muted">No JTBDs captured.</p>
      </Section>
    );
  }

  return (
    <Section title="JTBDs performed" badge={`${team.jtbds.length} total`}>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
        {team.jtbds.map((j) => (
          <li key={j.id} className="flex items-baseline gap-2">
            <span className="text-ink">{j.title}</span>
            {j.frequency ? (
              <span className="text-xs text-ink-muted">· {j.frequency}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
