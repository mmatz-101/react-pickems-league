import LeaguePicksContent from "@/components/leagues/league-picks-content";

export default async function ScopedLeaguePicksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LeaguePicksContent leagueSlug={slug} />;
}
