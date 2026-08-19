import { PicksPageContent } from "@/app/user/picks/page";

export default async function LeaguePicksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PicksPageContent leagueSlug={slug} />;
}
