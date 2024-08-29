import { getPB } from "@/app/pocketbase";
import { ResultDataTable } from "./result-data-table";
import { resultColumns, resultColumnsType } from "./result-columns";
import Navbar from "@/components/navbar/navbar";
import { redirect } from "next/navigation";
import { getUsersTeam } from "@/lib/utils";
import { userTeamType } from "@/server/actions/picks/helpers/pick-data";

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
  const userTeam: userTeamType = await getUsersTeam(pb.authStore.model.id);

  // everything is good
  const resultData: resultColumnsType[] = await pb
    .collection("results_picks")
    .getFullList({ sort: "rank" });
  console.log(resultData);
  return (
    <>
      <Navbar />
      <h1 className="text-xl p-4">Results Page</h1>
      <ResultDataTable columns={resultColumns} data={resultData} />
    </>
  );
}
