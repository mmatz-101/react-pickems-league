import PicksPageContent from "@/components/picks/picks-page-content";

export default async function LeaguePicksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PicksPageContent leagueSlug={slug} />;
}
