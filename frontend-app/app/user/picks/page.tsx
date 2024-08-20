import GameCard, { gameTypeExpanded } from "@/components/picks/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { getPB } from "@/app/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import Navbar from "@/components/navbar/navbar";

export default async function PicksPage() {
  const pb = await getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  const gamesNFLData: gameTypeExpanded[] = await pb
    .collection("games")
    .getFullList({
      filter: `week=${currentData.week} && league="NFL"`,
      expand: "home_team,away_team",
    });
  const gamesNCAAFData: gameTypeExpanded[] = await pb
    .collection("games")
    .getFullList({
      filter: `week=${currentData.week} && league="NCAAF"`,
      expand: "home_team,away_team",
    });
  const currentPicks: pickType[] = await pb.collection("picks").getFullList({
    filter: `week=${currentData.week} && user="${pb.authStore.model!.id}"`,
  });
  return (
    <>
      <Navbar />
      <h1 className="text-2xl p-6">Picks Page</h1>
      <Tabs defaultValue="NFL" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="NFL">NFL</TabsTrigger>
          <TabsTrigger value="NCAAF">NCAA</TabsTrigger>
        </TabsList>
        <TabsContent value="NFL">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
            {gamesNFLData.map((game) => (
              <div className="min-w-[400px] flex-auto" key={game.id}>
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
              <div className="min-w-[400px] flex-grow" key={game.id}>
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
