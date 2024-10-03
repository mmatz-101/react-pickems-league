"use server";

import { getPB } from "@/app/pocketbase";
import Navbar from "@/components/navbar/navbar";
import { getUsersTeam } from "@/lib/utils";
import { userTeamType } from "@/server/actions/picks/helpers/pick-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  weeklyWinnerExpandTableType,
  weeklyWinnerType,
} from "@/server/actions/picks/helpers/weekly-winner";
import { redirect } from "next/navigation";
import WinnersCircle from "@/components/weekly-winner/winner-circle";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import {
  resultColumns,
  resultColumnsType,
} from "@/app/user/results/result-columns";
import { ResultDataTable } from "@/app/user/results/result-data-table";
import WeeklyWinnerEnroll from "@/app/user/weekly-winner/weekly-enroll";

export default async function WeeklyWinner() {
  const pb = await getPB();
  // check if the user is valid
  if (!pb.authStore.isValid) {
    redirect("/login");
  }
  // check if the user has an id
  if (!pb.authStore.model?.id) {
    redirect("/login");
  }
  // get user team
  const userTeam: userTeamType = await getUsersTeam(pb.authStore.model.id);

  // check if the user is enrolled in the weekly challenge
  const userEnrolled: weeklyWinnerType[] = await pb
    .collection("weekly_winner_comp")
    .getFullList({
      filter: `user_team="${userTeam.id}"`,
    });

  // check if the userEnrolled is empty or is false
  if (userEnrolled.length === 0 || !userEnrolled[0].enrolled) {
    return <WeeklyWinnerEnroll id={pb.authStore.model.id} />;
  }

  // everything is good
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");

  const resultWeekylData: resultColumnsType[] = await pb
    .collection("results_weekly_winner")
    .getFullList({ sort: "rank" });

  const weeklyCompData: weeklyWinnerType[] = await pb
    .collection("weekly_winner_comp")
    .getFullList();

  // get weekly winner's circle data
  const weeklyWinnerData: weeklyWinnerExpandTableType[] = await pb
    .collection("weekly_winner_table")
    .getFullList({ sort: "-week_winner", expand: "user_team" });

  const enrolledCount = weeklyCompData.filter((item) => item.enrolled).length;
  const weeklyPot = enrolledCount * 50 * 1.0;

  return (
    <>
      <Navbar />
      <main className="p-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl md:text-3xl mb-4">Weekly Winner</h1>
          <WinnersCircle weeklyWinnerData={weeklyWinnerData} />
        </div>
        <p className="text-lg mb-4">Week {currentData.week}</p>

        <div className="flex flex-col gap-4 p-4 sm:justify-center items-center sm:flex-row">
          <Card className="max-w-xs w-full">
            <CardHeader>Competing this week</CardHeader>
            <CardContent className="font-semibold text-xl">
              {enrolledCount}
            </CardContent>
          </Card>

          <Card className="max-w-xs w-full">
            <CardHeader>Prize Pool 💰</CardHeader>
            <CardContent className="font-semibold text-xl">
              ${weeklyPot}
            </CardContent>
          </Card>
        </div>

        <div className="p-4">
          <ResultDataTable columns={resultColumns} data={resultWeekylData} />
        </div>
      </main>
    </>
  );
}
