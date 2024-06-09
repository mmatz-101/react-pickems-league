import GameCard from "@/components/picks/game-card";
import { Toaster } from "@/components/ui/toaster";
import { getPB } from "@/lib/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";

export default async function PicksPage() {
  const pb = getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  const gamesData: gameType[] = await pb.collection("games").getFullList({
    filter: `week=${currentData.week}`,
  });
  const currentPicks: pickType[] = await pb.collection("picks").getFullList({
    filter: `week=${currentData.week} && user="${pb.authStore.model!.id}"`,
  });
  return (
    <>
      <h1>Picks Page</h1>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
        {gamesData.map((game) => (
          <div className="min-w-[360px] flex-grow" key={game.id}>
            <GameCard
              game={game}
              pick={currentPicks.find((pick) => pick.game === game.id)}
              key={game.id}
            />
          </div>
        ))}
      </div>
      <Toaster />
    </>
  );
}
