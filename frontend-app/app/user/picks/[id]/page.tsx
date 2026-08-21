import PickDetailContent from "@/components/leagues/pick-detail-content";

export default async function PickDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PickDetailContent id={id} />;
}
