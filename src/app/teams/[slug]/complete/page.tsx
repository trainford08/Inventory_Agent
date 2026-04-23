import { notFound } from "next/navigation";
import { AtAGlanceCounters } from "@/components/complete/AtAGlanceCounters";
import { CompleteProfileHero } from "@/components/complete/CompleteProfileHero";
import { ProfileSectionsGrid } from "@/components/complete/ProfileSectionsGrid";
import { SavingFooter } from "@/components/complete/SavingFooter";
import { getCompleteProfileData } from "@/server/complete-profile";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // eslint-disable-next-line react-hooks/purity -- server component renders once per request
  const nowMs = Date.now();
  const data = await getCompleteProfileData(slug, nowMs);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-[32px] py-[28px]">
      <CompleteProfileHero
        teamName={data.teamName}
        teamSlug={data.teamSlug}
        lastSavedLabel={data.lastSavedLabel}
        hasStarted={data.hasStarted}
      />
      <AtAGlanceCounters
        autoPopulated={data.counters.autoPopulated}
        needHumanInput={data.counters.needHumanInput}
        judgmentCalls={data.counters.judgmentCalls}
        profileComplete={data.counters.profileComplete}
      />
      <ProfileSectionsGrid teamSlug={data.teamSlug} sections={data.sections} />
      <SavingFooter />
    </div>
  );
}
