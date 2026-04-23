import type { TeamProfile } from "@/server/teams";

type Stakeholder = {
  role: string;
  name: string;
  sub: string;
  contact: "Teams" | "Email";
  gradient: string;
};

const GRADIENTS: Record<string, string> = {
  teal: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
  emerald: "linear-gradient(135deg, #10b981 0%, #22c55e 100%)",
  amber: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  indigo: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  pink: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  violet: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
  cyan: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
};

const STACK_COLORS = ["teal", "emerald", "violet", "amber", "indigo", "pink"];

export function TeamMakeupCard({ team }: { team: TeamProfile }) {
  const stakeholders = buildStakeholders(team);
  const engineerCount = team.engineerCount ?? team.members.length;
  const breakdown = buildRoleBreakdown(team.members);
  const stackMembers = team.members.slice(0, 5);
  const extraCount = Math.max(0, engineerCount - stackMembers.length);

  return (
    <section className="rounded-xl border border-border bg-bg-elevated px-6 py-5">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Team makeup
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            Key stakeholders and team composition
          </p>
        </div>
      </div>

      <ul className="flex flex-col">
        {stakeholders.map((s) => (
          <li
            key={s.role}
            className="grid grid-cols-[92px_1fr_auto] items-center gap-3 border-b border-border-subtle py-[9px] first:pt-0 last:border-b-0 last:pb-0"
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {s.role}
            </span>
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar
                initials={initials(s.name)}
                gradient={s.gradient}
                size={26}
              />
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium tracking-[-0.005em] text-ink">
                  {s.name}
                </div>
                <div className="truncate font-mono text-[11.5px] text-ink-muted">
                  {s.sub}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded border border-border bg-bg-subtle px-2 py-[3px] font-mono text-[11px] text-ink-muted">
              {s.contact}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Engineering team
        </div>
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold leading-none tracking-[-0.02em] text-ink">
              {engineerCount}
            </span>
            <span className="text-[12px] text-ink-muted">engineers</span>
          </div>
          <div className="flex items-center">
            {stackMembers.map((m, i) => (
              <span
                key={m.email}
                className="-ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-elevated text-[10px] font-semibold text-white first:ml-0"
                style={{
                  background: GRADIENTS[STACK_COLORS[i % STACK_COLORS.length]],
                }}
              >
                {initials(m.name)}
              </span>
            ))}
            {extraCount > 0 ? (
              <span className="-ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-elevated bg-bg-subtle font-mono text-[10px] font-semibold text-ink-soft">
                +{extraCount}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {breakdown.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1 rounded-full bg-bg-subtle px-2.5 py-[3px] text-[11.5px] text-ink-soft"
            >
              <strong className="font-mono font-semibold text-ink">
                {b.count}
              </strong>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Avatar({
  initials,
  gradient,
  size,
}: {
  initials: string;
  gradient: string;
  size: number;
}) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.4)}px`,
        background: GRADIENTS[gradient] ?? GRADIENTS.indigo,
      }}
    >
      {initials}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function buildStakeholders(team: TeamProfile): Stakeholder[] {
  const out: Stakeholder[] = [];

  // Team lead: member matching a leadership keyword
  const teamLead = team.members.find((m) =>
    /lead|principal|director|manager/i.test(m.role),
  );
  if (teamLead) {
    out.push({
      role: "Team lead",
      name: teamLead.name,
      sub: teamLead.role,
      contact: "Teams",
      gradient: "teal",
    });
  }

  // Champion
  if (team.champion && team.champion.email !== teamLead?.email) {
    out.push({
      role: "Champion",
      name: team.champion.name,
      sub: team.champion.role,
      contact: "Teams",
      gradient: "emerald",
    });
  }

  // Security partner: anyone with "security" in role, else use escalation contact
  const security = team.members.find((m) => /security/i.test(m.role));
  if (security) {
    out.push({
      role: "Security",
      name: security.name,
      sub: security.role,
      contact: "Email",
      gradient: "amber",
    });
  } else if (team.ownership?.escalationContact) {
    out.push({
      role: "Security",
      name: nameFromEmail(team.ownership.escalationContact),
      sub: "Security partner",
      contact: "Email",
      gradient: "amber",
    });
  }

  // Platform partner: sre / devex / platform
  const platform = team.members.find((m) =>
    /sre|devex|platform|reliability/i.test(m.role),
  );
  if (platform && platform.email !== teamLead?.email) {
    out.push({
      role: "Platform",
      name: platform.name,
      sub: platform.role,
      contact: "Teams",
      gradient: "indigo",
    });
  }

  // Sponsor: synth from primary owner (or escalation) if not already listed
  const sponsorEmail = team.ownership?.primaryOwnerEmail;
  if (sponsorEmail) {
    const sponsorName = nameFromEmail(sponsorEmail);
    const already = out.some(
      (s) => sponsorName.toLowerCase() === s.name.toLowerCase(),
    );
    if (!already && out.length < 5) {
      out.push({
        role: "Sponsor",
        name: sponsorName,
        sub: "Engineering sponsor",
        contact: "Email",
        gradient: "pink",
      });
    }
  }

  return out.slice(0, 5);
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(" ");
}

function buildRoleBreakdown(
  members: { role: string }[],
): Array<{ label: string; count: number }> {
  const buckets: Record<string, number> = {};
  for (const m of members) {
    const label = bucket(m.role);
    buckets[label] = (buckets[label] ?? 0) + 1;
  }
  return Object.entries(buckets)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function bucket(role: string): string {
  const r = role.toLowerCase();
  if (/manager|director/.test(r)) return "EM";
  if (/program|tpm/.test(r)) return "TPM";
  if (/principal|staff/.test(r)) return "Staff Eng";
  if (/security/.test(r)) return "Security";
  if (/sre|reliability/.test(r)) return "SRE";
  if (/ml|ai|data/.test(r)) return "ML Eng";
  if (/devex|platform/.test(r)) return "Platform";
  if (/qa|quality|test/.test(r)) return "QA";
  if (/ios/.test(r)) return "iOS";
  if (/android/.test(r)) return "Android";
  if (/mobile/.test(r)) return "Mobile";
  return "Engineer";
}
