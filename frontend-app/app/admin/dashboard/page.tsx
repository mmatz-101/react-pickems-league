import CurrentWeek from "@/components/admin/current-week";
import DataCollectionForm from "@/components/admin/data-collection-form";
import { getPB } from "@/app/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";

export default async function AdminDashboard() {
  const pb = await getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  return (
    <div>
      <h1 className="text-3xl pb-4">Dashboard</h1>
      <CurrentWeek currentWeek={currentData.week} />
      <DataCollectionForm />
    </div>
  );
}
