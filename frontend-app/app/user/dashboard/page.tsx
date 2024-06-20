import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { getPB } from "@/lib/pocketbase";
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

interface pickTypeQuery extends pickType {
  expand: { game: gameType };
}

export default async function DashboardPage() {
  const pb = getPB();

  if (pb.authStore.isValid) {
    const picks: pickTypeQuery[] = await pb.collection("picks").getFullList({
      filter: `user="${pb.authStore.model!.id}"`,
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
        <h1>User Dashboard</h1>
        <p>{pb.authStore.model!.first_name}</p>
        <div className="flex gap-4 py-4">
          <Card className="max-w-md flex-grow">
            <CardHeader>Current Week Regular Picks</CardHeader>
            <CardContent>
              {picks.filter((pick) => pick.pick_type === "REGULAR").length} of 8
              <Progress
                value={
                  (picks.filter((pick) => pick.pick_type === "REGULAR").length /
                    8) *
                  100
                }
              />
            </CardContent>
          </Card>
          <Card className="max-w-md flex-grow">
            <CardHeader>Current Week Binny Picks</CardHeader>
            <CardContent>
              {picks.filter((pick) => pick.pick_type === "BINNY").length} of 8
              <Progress
                value={
                  (picks.filter((pick) => pick.pick_type === "BINNY").length /
                    2) *
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
          >
            <AccordionItem value="item-1">
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
      </div>
    );
  }

  redirect("/login");
}
