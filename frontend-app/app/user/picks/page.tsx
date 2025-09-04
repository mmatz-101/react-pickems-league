import GameCard, { gameTypeExpanded } from "@/components/picks/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { getPB } from "@/app/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import {
  pickType,
  userTeamType,
} from "@/server/actions/picks/helpers/pick-data";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import { getUsersTeam } from "@/lib/utils";

export default async function PicksPage() {
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

  // everything is good
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  const gamesNFLData: gameTypeExpanded[] = await pb
    .collection("games")
    .getFullList({
      filter: `week=${currentData.week} && league="NFL" && status!="FINAL" && status!="FINAL OT"`,
      expand: "home_team,away_team",
      sort: "date",
    });
  const gamesNCAAFData: gameTypeExpanded[] = await pb
    .collection("games")
    .getFullList({
      filter: `week=${currentData.week} && league="NCAAF" && status!="FINAL" && status!="FINAL OT"`,
      expand: "home_team,away_team",
      sort: "date",
    });
  const currentPicks: pickType[] = await pb.collection("picks").getFullList({
    filter: `week=${currentData.week} && user_team="${userTeam.id}"`,
  });

  return (
    <>
      <Navbar />
      <h1 className="text-2xl p-6">Picks Page</h1>
      <Tabs defaultValue="NFL" className="px-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="NFL">NFL</TabsTrigger>
          <TabsTrigger value="NCAAF">NCAA</TabsTrigger>
        </TabsList>
        <TabsContent value="NFL">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
            {currentData.max_nfl_picks !== 0 &&
              gamesNFLData.map((game) => (
                <div className="w-full sm:max-w-[500px] " key={game.id}>
                  <GameCard
                    game={game}
                    pick={currentPicks.find((pick) => pick.game === game.id)}
                    key={game.id}
                  />
                </div>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="NCAAF">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
            {gamesNCAAFData.map((game) => (
              <div className="w-full sm:max-w-[500px]" key={game.id}>
                <GameCard
                  game={game}
                  pick={currentPicks.find((pick) => pick.game === game.id)}
                  key={game.id}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Toaster />
    </>
  );
}
