import { notFound } from "next/navigation";
import { getTeamBySlug } from "@/server/teams";

/**
 * Parent layout for /teams/[slug]/**. Intentionally minimal — each child
 * page owns its own container (the standard pages use a 1100-width centered
 * wrapper; /review goes full-bleed with its own 2-column shell).
 */
export default async function TeamProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  return <>{children}</>;
}
