import { getPB } from "@/app/pocketbase";
import { ResultDataTable } from "./result-data-table";
import { resultColumns, resultColumnsType } from "./result-columns";
import Navbar from "@/components/navbar/navbar";
import { redirect } from "next/navigation";
import { getUsersTeam } from "@/lib/utils";

export default async function ResultPage() {
  const pb = await getPB();
  // check if the user is valid
  if (!pb.authStore.isValid) {
    redirect("/login");
  }
  // check if the user has an id
  if (!pb.authStore.model?.id) {
    redirect("/login");
  }
  // get user team no need to use return for this page
  await getUsersTeam(pb.authStore.model.id);

  // everything is good
  const resultData: resultColumnsType[] = await pb
    .collection("results_picks")
    .getFullList({ sort: "rank" });

  return (
    <>
      <Navbar />
      <h1 className="text-xl p-4">Results Page</h1>
      <ResultDataTable columns={resultColumns} data={resultData} />
    </>
  );
}
