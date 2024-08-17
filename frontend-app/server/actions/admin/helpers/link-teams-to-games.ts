"use server";

import { getPB } from "@/app/pocketbase";
import { currentDataType } from "./current-data";
import { gameType, teamType } from "../../picks/helpers/game-data";
import { createSafeActionClient } from "next-safe-action";

const action = createSafeActionClient();

export const UpdateLinkTeamsToGames = action({}, async () => {
  console.log("Linking teams to games");
  const pb = await getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  // get games that match the currentWeek
  const games: gameType[] = await pb.collection("games").getFullList({
    filter: `week=${currentData.week}`,
  });

  // loop through games and link either home_team or away_team to the team collection
  for (const game of games) {
    try {
      const homeTeam: teamType = await pb
        .collection("teams")
        .getFirstListItem(`name="${game.home_name}"`);
      if (homeTeam) {
        await pb.collection("games").update(game.id, {
          home_team: homeTeam.id,
        });
      }
    } catch (error) {
      console.log("unable to link:", game.home_name);
    }
    try {
      const awayTeam: teamType = await pb
        .collection("teams")
        .getFirstListItem(`name="${game.away_name}"`);
      if (awayTeam) {
        await pb.collection("games").update(game.id, {
          away_team: awayTeam.id,
        });
      }
    } catch (error) {
      console.log("unable to link:", game.away_name);
    }
  }
});
