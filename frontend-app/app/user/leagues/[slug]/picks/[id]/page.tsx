import PickDetailContent from "@/components/leagues/pick-detail-content";

export default async function LeaguePickDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return <PickDetailContent id={id} leagueSlug={slug} />;
}
