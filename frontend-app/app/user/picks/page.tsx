import GameCard from "@/components/picks/game-card";
import { pb } from "@/lib/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import { gameType } from "@/server/picks/helpers/game-data";

export default async function PicksPage() {
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  const gamesData: gameType[] = await pb.collection("games").getFullList({
    filter: `week=${currentData.week}`,
  });
  return (
    <>
      <h1>Picks Page</h1>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
        {gamesData.map((game) => (
          <div className="min-w-[360px] flex-grow" key={game.id}>
            <GameCard game={game} key={game.id} />
          </div>
        ))}
      </div>
    </>
  );
}
