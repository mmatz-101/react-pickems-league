import { getPB } from "@/app/pocketbase";
import { ResultDataTable } from "./result-data-table";
import { resultColumns, resultColumnsType } from "./result-columns";

export default async function ResultPage() {
  const pb = await getPB();
  const resultData: resultColumnsType[] = await pb
    .collection("results_picks")
    .getFullList({ sort: "-result_points", expand: "user" });
  return (
    <>
      <h1>Result Page</h1>
      <h2>table with all the information on the scores</h2>
      <ResultDataTable columns={resultColumns} data={resultData} />
    </>
  );
}
