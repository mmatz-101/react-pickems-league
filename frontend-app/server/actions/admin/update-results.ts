"use server";

import { createSafeActionClient } from "next-safe-action";
import { currentDataType } from "./helpers/current-data";
import { getPB } from "@/app/pocketbase";
import { gameType } from "../picks/helpers/game-data";
import { pickType } from "../picks/helpers/pick-data";

const action = createSafeActionClient();

export const UpdatePickResults = action({}, async () => {
  console.log("Updating results");
  const pb = await getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  // get games that match the currentWeek
  const games: gameType[] = await pb.collection("games").getFullList({
    filter: `week=${currentData.week}`,
  });

  // loop through the games checking if the game is "Complete"
  // then update the game with pick_winner (HOME, AWAY, PUSH)
  for (const game of games) {
    if (game.status === "Complete") {
      const homeScoreAdjusted = game.home_score + game.home_spread;
      if (homeScoreAdjusted > game.away_score) {
        await pb.collection("games").update(game.id, {
          pick_winner: "HOME",
        });
        console.log("Updated game", game.id, "with pick_winner HOME");
      } else if (homeScoreAdjusted < game.away_score) {
        await pb.collection("games").update(game.id, {
          pick_winner: "AWAY",
        });
        console.log("Updated game", game.id, "with pick_winner AWAY");
      } else {
        await pb.collection("games").update(game.id, {
          pick_winner: "PUSH",
        });
        console.log("Updated game", game.id, "with pick_winner PUSH");
      }
    }
  }

  // get picks for the current week
  const picks: pickType[] = await pb.collection("picks").getFullList({
    filter: `week=${currentData.week}`,
    perPage: 1000,
  });

  console.log("picks", picks[0].game);

  for (const pick of picks) {
    // get the game for the pick
    const game: gameType = await pb
      .collection("games")
      .getFirstListItem(`id="${pick.game}"`);
    console.log("game", game);
    // check if the game is complete
    if (game.status === "Complete") {
      // get the point values based on the game
      let correctPointValue = 0;
      let incorrectPointValue = 0;
      let pushPointValue = 0;
      if (pick.pick_type === "REGULAR") {
        correctPointValue = currentData.regular_point_value;
        incorrectPointValue = 0;
        pushPointValue = currentData.regular_point_value / 2;
      } else {
        correctPointValue = currentData.binny_point_value;
        incorrectPointValue = -Math.abs(currentData.binny_point_value);
        pushPointValue = 0;
      }
      // check if the pick is correct
      if (pick.team_selected === game.pick_winner) {
        // update the pick with result_points & results_text
        await pb.collection("picks").update(pick.id, {
          result_points: correctPointValue,
          result_text: "WIN",
        });
        console.log(
          "Updated pick (WIN)",
          pick.id,
          `with result_points ${correctPointValue}`,
        );
      } else if (game.pick_winner === "PUSH") {
        // update the pick with result_points & results_text
        await pb.collection("picks").update(pick.id, {
          result_points: pushPointValue,
          result_text: "PUSH",
        });
        console.log(
          "Updated pick (PUSH)",
          pick.id,
          `with result_points ${pushPointValue}`,
        );
      } else {
        // update the pick with result_points & results_text
        await pb.collection("picks").update(pick.id, {
          result_points: incorrectPointValue,
          result_text: "LOST",
        });
        console.log(
          "Updated pick (LOST)",
          pick.id,
          `with results_point ${incorrectPointValue}`,
        );
      }
    }
  }
});
