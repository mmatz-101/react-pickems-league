import ResultsPageContent from "@/components/results/results-page-content";

export default async function LeagueResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ResultsPageContent leagueSlug={slug} />;
}
