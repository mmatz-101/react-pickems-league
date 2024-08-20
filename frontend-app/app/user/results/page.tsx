import { getPB } from "@/app/pocketbase";
import { ResultDataTable } from "./result-data-table";
import { resultColumns, resultColumnsType } from "./result-columns";
import Navbar from "@/components/navbar/navbar";

export default async function ResultPage() {
  const pb = await getPB();
  const resultData: resultColumnsType[] = await pb
    .collection("results_picks")
    .getFullList({ sort: "-result_points", expand: "user" });
  return (
    <>
      <Navbar />
      <h1 className="text-xl p-4">Results Page</h1>
      <ResultDataTable columns={resultColumns} data={resultData} />
    </>
  );
}
