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
import {
  pickType,
  userTeamType,
} from "@/server/actions/picks/helpers/pick-data";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import { getUsersTeam } from "@/lib/utils";

interface pickTypeQuery extends pickType {
  expand: { game: gameType; user_team: userTeamType };
}

type pickTypeQueryType = pickTypeQuery;

export default async function LeaguePicksPage() {
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
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");

  const picks: pickTypeQuery[] = await pb.collection("picks").getFullList({
    filter: `week=${currentData.week}`,
    sort: "user_team, -pick_type, -game.league, +game.date",
    expand: "game, user_team",
  });

  const uniqueNames: string[] = Array.from(
    new Set(picks.map((a: pickTypeQuery) => a.expand.user_team.team_name)),
  );

  return (
    <>
      <Navbar />
      <h1 className="text-2xl md:text-3xl p-4">League Picks Page</h1>
      <p className="text-lg px-4">Week {currentData.week}</p>
      <div className="flex flex-col gap-4 p-4">
        {uniqueNames.map((team_name) => (
          <div className="w-full max-w-5xl mx-auto" key={team_name}>
            <Accordion
              className="w-full"
              type="single"
              collapsible
              defaultValue="item-0"
            >
              <AccordionItem value="item-0">
                <AccordionTrigger className="flex items-center justify-between p-4 rounded-md hover:bg-gray-300">
                  <span className="font-bold">{team_name}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-white border-t border-gray-200 rounded-b-md">
                  <div className="container py-4 sm:block md:hidden">
                    <DataTable
                      columns={mobileColumns}
                      data={picks.filter(
                        (pick) => pick.expand.user_team.team_name === team_name,
                      )}
                    />
                  </div>
                  <div className="container mx-auto py-4 hidden md:block">
                    <DataTable
                      columns={columns}
                      data={picks.filter(
                        (pick) => pick.expand.user_team.team_name === team_name,
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </>
  );
}

// Function to get usernames by name
const getUsernamesByName = (
  picks: pickTypeQueryType[],
  name: string,
): string => {
  return picks
    .filter((pick) => pick.expand.user.first_name === name)
    .map((pick) => pick.expand.user.username)[0];
};
