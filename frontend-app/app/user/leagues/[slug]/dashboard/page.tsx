import DashboardPageContent from "@/components/dashboard/dashboard-page-content";

export default async function LeagueDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DashboardPageContent leagueSlug={slug} />;
}
