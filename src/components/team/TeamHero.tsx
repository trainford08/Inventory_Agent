import type { TeamProfile } from "@/server/teams";
import { Fact, FactsStrip } from "./FactsStrip";
import { HealthChip } from "./HealthChip";
import { HeroPeople, type Person } from "./HeroPeople";

const TIER_LABEL = {
  TIER_1: "Tier 1",
  TIER_2: "Tier 2",
  TIER_3: "Tier 3",
} as const;

const COHORT_LABEL: Record<string, string> = {
  ALPHA: "Alpha cohort",
  BRAVO: "Bravo cohort",
  CHARLIE: "Charlie cohort",
  DELTA: "Delta cohort",
  ECHO: "Echo cohort",
  FOXTROT: "Foxtrot cohort",
  UNASSIGNED: "Unassigned",
};

export function TeamHero({
  team,
  nowMs,
}: {
  team: TeamProfile;
  nowMs: number;
}) {
  const people = buildPeople(team);
  const extraPeople = team.members.length + 1 - people.length;
  const openBlockers = team.risks.filter((r) => r.status === "OPEN").length;
  const weeksToCutover =
    team.targetCutoverAt !== null
      ? Math.round(
          (team.targetCutoverAt.getTime() - nowMs) / (7 * 24 * 3600 * 1000),
        )
      : null;

  const healthSub = buildHealthSub(openBlockers, weeksToCutover);
  const orgPath = [
    team.org.name,
    COHORT_LABEL[team.cohort],
    team.wave !== null ? `Wave ${String(team.wave).padStart(2, "0")}` : null,
  ]
    .filter((x): x is string => x !== null)
    .join(" · ");

  return (
    <header className="mb-8">
      <div className="mb-5 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 font-mono text-[11px] tracking-[0.04em] text-ink-muted">
            {orgPath}
          </div>
          <h1 className="mb-1.5 text-[32px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
            {team.name}
          </h1>
          {team.tagline ? (
            <div className="mb-3 text-[16px] italic leading-[1.35] text-ink-muted">
              {team.tagline}
            </div>
          ) : null}
          {team.description ? (
            <p className="mb-4 max-w-[640px] text-[15px] leading-[1.5] text-ink-soft">
              {team.description}
            </p>
          ) : null}
          <FactsStrip>
            {team.engineerCount !== null ? (
              <Fact>
                <span className="font-medium text-ink">
                  {team.engineerCount}
                </span>{" "}
                engineers
              </Fact>
            ) : null}
            {team.tier ? <Fact>{TIER_LABEL[team.tier]}</Fact> : null}
            {team.securityClassification ? (
              <Fact>{team.securityClassification}</Fact>
            ) : null}
          </FactsStrip>
        </div>
        {team.healthStatus ? (
          <div className="flex-shrink-0">
            <HealthChip
              status={team.healthStatus}
              sub={healthSub ?? undefined}
            />
          </div>
        ) : null}
      </div>

      {people.length > 0 ? (
        <HeroPeople
          people={people}
          more={
            extraPeople > 0 ? (
              <span>See all {team.members.length + 1} →</span>
            ) : null
          }
        />
      ) : null}
    </header>
  );
}

function buildPeople(team: TeamProfile): Person[] {
  const people: Person[] = [];

  if (team.champion) {
    people.push({
      role: "Champion",
      name: team.champion.name,
      sub: team.champion.role,
      gradient: "indigo",
    });
  }

  const teamLead = team.members.find((m) =>
    /lead|principal|director/i.test(m.role),
  );
  if (teamLead && teamLead.email !== team.champion?.email) {
    people.push({
      role: "Team lead",
      name: teamLead.name,
      sub: teamLead.role,
      gradient: "teal",
    });
  }

  const nextMember = team.members.find(
    (m) => m.email !== team.champion?.email && m.email !== teamLead?.email,
  );
  if (nextMember && people.length < 3) {
    people.push({
      role: "Engineer",
      name: nextMember.name,
      sub: nextMember.role,
      gradient: "emerald",
    });
  }

  return people;
}

function buildHealthSub(
  blockers: number,
  weeksToCutover: number | null,
): string | null {
  const parts: string[] = [];
  if (blockers > 0) {
    parts.push(`${blockers} ${blockers === 1 ? "blocker" : "blockers"}`);
  }
  if (weeksToCutover !== null) {
    if (weeksToCutover > 0) {
      parts.push(`${weeksToCutover}w to cutover`);
    } else if (weeksToCutover < 0) {
      parts.push(`${Math.abs(weeksToCutover)}w past target`);
    } else {
      parts.push("cutover this week");
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
