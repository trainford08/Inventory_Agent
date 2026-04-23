import "server-only";
import {
  getCompleteProfileData,
  type SidebarTeamProgress,
} from "./complete-profile";
import { prisma } from "./db";

/**
 * Per-team section progress, shaped for the sidebar's Complete profile
 * sub-nav. Runs a cheap slug-only query then reuses the cached per-team
 * profile builder.
 */
export async function listAllTeamProgress(
  nowMs: number,
): Promise<SidebarTeamProgress[]> {
  const teams = await prisma.team.findMany({ select: { slug: true } });
  const results = await Promise.all(
    teams.map(async ({ slug }) => {
      const data = await getCompleteProfileData(slug, nowMs);
      if (!data) return null;
      return {
        slug,
        sections: data.sections.map((s) => ({
          key: s.key,
          title: s.title,
          reviewedCount: s.reviewedCount,
          totalCount: s.totalCount,
        })),
      };
    }),
  );
  return results.filter((r): r is SidebarTeamProgress => r !== null);
}
