import { redirect } from "next/navigation";

export default async function TeamReviewIndex({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/teams/${slug}/review/code-and-repos`);
}
