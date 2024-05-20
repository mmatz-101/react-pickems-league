import { GameCard } from "@/components/user/game-card";
import SearchBar from "@/components/user/search-bar";
import { getGameData } from "@/server/actions/game/get-game-data";

export default async function PicksPage() {
  const gameData = await getGameData();
  if (gameData.error) {
  }
  return (
    <>
      <h1>User Picks</h1>
      <SearchBar />
      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
        {gameData.success?.map((game) => (
          <GameCard game={game} key={game.id} />
        ))}
      </div>
    </>
  );
}
