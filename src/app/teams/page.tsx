import { PageHero } from "@/components/PageHero";
import { TeamDirectory } from "@/components/dashboard/TeamDirectory";
import { listTeams } from "@/server/teams";

// Always render fresh so post-review completion % updates are visible
// immediately when the user navigates back to the list.
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await listTeams();
  const cohortCount = new Set(teams.map((t) => t.cohort)).size;

  return (
    <div className="mx-auto max-w-[1100px] px-[32px] py-[32px]">
      <PageHero
        eyebrow="Program"
        title="Team profiles"
        description={`${teams.length} teams across ${cohortCount} ${cohortCount === 1 ? "cohort" : "cohorts"} in the Azure DevOps → GitHub migration program.`}
      />
      <TeamDirectory teams={teams} />
    </div>
  );
}
