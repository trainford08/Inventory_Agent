import { TeamHero } from "@/components/team/TeamHero";
import type { TeamProfile } from "@/server/teams";

/**
 * Shared hero used by Overview / Agent findings. Cross-page navigation
 * (Overview, Agent findings, Review, Complete profile) lives in the app
 * sidebar — tabs here would duplicate that, so this component renders
 * only the hero.
 */
export function TeamProfileHeader({
  team,
  nowMs,
}: {
  team: TeamProfile;
  nowMs: number;
}) {
  return (
    <>
      <span className="mb-4 inline-flex cursor-default items-center gap-1 text-[12px] text-ink-faint">
        ← All teams
      </span>

      <TeamHero team={team} nowMs={nowMs} />
    </>
  );
}
