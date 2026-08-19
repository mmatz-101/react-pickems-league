import { DashboardPageContent } from "@/app/user/dashboard/page";

export default async function LeagueDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DashboardPageContent leagueSlug={slug} />;
}
