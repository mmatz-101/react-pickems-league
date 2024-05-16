import CurrentWeek from "@/components/admin/current-week";
import DataCollectionForm from "@/components/admin/data-collection-form";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl pb-4">Dashboard</h1>
      <CurrentWeek />
      <DataCollectionForm />
    </div>
  );
}
