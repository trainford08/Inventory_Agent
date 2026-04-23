import Link from "next/link";
import { TabLink } from "@/components/TabLink";
import { TeamHero } from "@/components/team/TeamHero";
import type { TeamProfile } from "@/server/teams";

/**
 * Shared hero + tabs wrapper used by Overview / Agent findings / Review.
 * The Complete Profile page has its own layout and deliberately does NOT
 * render this header.
 */
export function TeamProfileHeader({
  team,
  nowMs,
}: {
  team: TeamProfile;
  nowMs: number;
}) {
  const findingCount = team.latestFindings?.findings.length ?? 0;
  const needsInputCount = team.latestFindings?.needsInputCount ?? 0;

  return (
    <>
      <Link
        href="/teams"
        className="mb-4 inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
      >
        ← All teams
      </Link>

      <TeamHero team={team} nowMs={nowMs} />

      <nav className="mb-6 flex border-b border-border">
        <TabLink href={`/teams/${team.slug}`}>Overview</TabLink>
        <TabLink href={`/teams/${team.slug}/findings`}>
          Agent findings ({findingCount})
        </TabLink>
        <TabLink href={`/teams/${team.slug}/review`}>
          Review{needsInputCount > 0 ? ` (${needsInputCount})` : ""}
        </TabLink>
      </nav>
    </>
  );
}
