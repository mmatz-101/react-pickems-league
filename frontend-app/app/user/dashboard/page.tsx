import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { redirect } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import { getPB } from "@/app/pocketbase";
import Navbar from "@/components/navbar/navbar";

interface pickTypeQuery extends pickType {
  expand: { game: gameType };
}

export default async function DashboardPage() {
  const pb = await getPB();

  if (pb.authStore.isValid) {
    const picks: pickTypeQuery[] = await pb.collection("picks").getFullList({
      filter: `user="${pb.authStore.model!.id}"`,
      sort: "-pick_type, -game.league, +game.date",
      expand: "game",
    });

    const currentData: currentDataType = await pb
      .collection("current")
      .getFirstListItem("");
    const weekArray = Array.from(
      { length: currentData.week },
      (_, i) => currentData.week - i,
    );
    // TODO: Figure out what to do with the week
    return (
      <div>
        <Navbar />
        <h1>User Dashboard</h1>
        <p>{pb.authStore.model!.first_name}</p>
        <div className="flex gap-4 py-4">
          {/* TODO: Potentially convert this to a component card */}
          <Card className="max-w-md flex-grow">
            <CardHeader>Week {currentData.week} Regular Picks</CardHeader>
            <CardContent>
              {
                picks.filter(
                  (pick) =>
                    pick.pick_type === "REGULAR" &&
                    pick.week === currentData.week,
                ).length
              }
              {` of ${currentData.max_nfl_picks + currentData.max_ncaaf_picks}`}
              <Progress
                value={
                  (picks.filter(
                    (pick) =>
                      pick.pick_type === "REGULAR" &&
                      pick.week === currentData.week,
                  ).length /
                    (currentData.max_nfl_picks + currentData.max_ncaaf_picks)) *
                  100
                }
              />
            </CardContent>
          </Card>
          <Card className="max-w-md flex-grow">
            <CardHeader>Week {currentData.week} Binny Picks</CardHeader>
            <CardContent>
              {
                picks.filter(
                  (pick) =>
                    pick.pick_type === "BINNY" &&
                    pick.week === currentData.week,
                ).length
              }
              {` of ${currentData.max_nfl_binny_picks + currentData.max_ncaaf_binny_picks}`}
              <Progress
                value={
                  (picks.filter(
                    (pick) =>
                      pick.pick_type === "BINNY" &&
                      pick.week === currentData.week,
                  ).length /
                    (currentData.max_nfl_binny_picks +
                      currentData.max_ncaaf_binny_picks)) *
                  100
                }
              />
            </CardContent>
          </Card>
        </div>
        {weekArray.map((week) => (
          <Accordion
            className="max-w-5xl justify-center"
            type="single"
            collapsible
            key={week}
            defaultValue="item-0"
          >
            <AccordionItem
              value={week === currentData.week ? "item-0" : "item-1"}
            >
              <AccordionTrigger>Week {week}</AccordionTrigger>
              <AccordionContent>
                <div className="container mx-auto py-10 sm:block md:hidden">
                  <DataTable
                    columns={mobileColumns}
                    data={picks.filter((pick) => pick.week === week)}
                  />
                </div>
                <div className="container mx-auto py-10 hidden md:block">
                  <DataTable
                    columns={columns}
                    data={picks.filter((pick) => pick.week === week)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}

        <Toaster />
      </div>
    );
  }

  redirect("/login");
}
