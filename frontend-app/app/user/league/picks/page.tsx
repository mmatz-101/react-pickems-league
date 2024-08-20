import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPB } from "@/app/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { userType } from "@/server/actions/picks/helpers/user-data";
import Navbar from "@/components/navbar/navbar";

interface pickTypeQuery extends pickType {
  expand: { game: gameType; user: userType };
}

export default async function LeaguePicksPage() {
  const pb = await getPB();

  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");

  if (pb.authStore.isValid) {
    const picks: pickTypeQuery[] = await pb.collection("picks").getFullList({
      filter: `week=${currentData.week}`,
      sort: "user.first_name, -pick_type, -game.league, +game.date",
      expand: "game, user",
    });

    const uniqueNames: string[] = Array.from(
      new Set(picks.map((a: pickTypeQuery) => a.expand.user.first_name)),
    );

    return (
      <>
        <Navbar />
        <h1 className="text-xl p-4">League Picks Page</h1>
        <p className="text-lg px-4">Week {currentData.week} </p>
        {uniqueNames.map((name: string) => (
          <div className="flex justify-center" key={name}>
            <Accordion
              className="max-w-5xl py-2 px-6 flex-auto"
              type="single"
              collapsible
              key={currentData.week}
              defaultValue="item-0"
            >
              <AccordionItem value={"item-0"}>
                <AccordionTrigger>{name}</AccordionTrigger>
                <AccordionContent>
                  <div className="container mx-auto py-10 sm:block md:hidden">
                    <DataTable
                      columns={mobileColumns}
                      data={picks.filter(
                        (pick) => pick.expand.user.first_name === name,
                      )}
                    />
                  </div>
                  <div className="container mx-auto py-10 hidden md:block">
                    <DataTable
                      columns={columns}
                      data={picks.filter(
                        (pick) => pick.expand.user.first_name === name,
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </>
    );
  }
}
