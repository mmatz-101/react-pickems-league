"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { SubmitPickSchema } from "@/schema/submit-pick";
import { currentDataType } from "../admin/helpers/current-data";
import { revalidatePath } from "next/cache";
import { gameType } from "./helpers/game-data";
import { pickType, userTeamType } from "./helpers/pick-data";
import { getUsersTeam } from "@/lib/utils";

export interface ReturnInfo {
  error?: string;
  success?: string;
  update?: boolean;
}

export const submitPick = action(
  SubmitPickSchema,
  async ({ id, game, league, teamSelected, pickType }) => {
    const pb = await getPB();
    // get current data
    const currentData: currentDataType = await pb
      .collection("current")
      .getFirstListItem("");
    // get the game data
    const gameData: gameType = await pb
      .collection("games")
      .getFirstListItem(`id="${game}"`);
    // check if the week is locked
    if (!currentData.allow_picks) {
      let returnInfo: ReturnInfo = { error: "week is locked." };
      if (id) {
        returnInfo.update = true;
      }
      return returnInfo;
    }
    // check if the game has started
    if (!isNowBeforeGame(gameData)) {
      let returnInfo: ReturnInfo = {
        error: "game has already started/completed.",
      };
      if (id) {
        returnInfo.update = true;
      }
      return returnInfo;
    }
    // TEMPORARY ALLOW ZERO SPREAD PICKS #####################################
    // // check if the spread has not been uploaded
    // if (gameData.home_spread === 0 || gameData.away_spread === 0) {
    //   let returnInfo: ReturnInfo = {
    //     error: "please wait until spread has been updated with non-zero.",
    //   };
    //   return returnInfo;
    // }
    // ###############################################################################
    // get the user's team
    const userTeam: userTeamType = await getUsersTeam(pb.authStore.model!.id);
    if (!userTeam) {
      return { error: "user's team not found" };
    }
    // get the max amount of picks based on the league
    let maxPicks = 0;
    let maxBinnyPicks = 0;
    if (league === "NFL") {
      maxPicks = currentData.max_nfl_picks;
      maxBinnyPicks = currentData.max_nfl_binny_picks;
    } else {
      maxPicks = currentData.max_ncaaf_picks;
      maxBinnyPicks = currentData.max_ncaaf_binny_picks;
    }
    // TEMPORARY FREE FOR ALL ON PICKS THIS WEEK #####################################
    maxPicks = currentData.max_nfl_picks + currentData.max_ncaaf_picks
    maxBinnyPicks = currentData.max_nfl_binny_picks + currentData.max_ncaaf_binny_picks
    // ###############################################################################
    // check how many games the user has picked.
    if (pickType === "REGULAR") {
      // TEMPORARY FREE FOR ALL ON PICKS THIS WEEK #####################################
      const picks: pickType[] = await pb.collection("picks").getFullList({
        filter: `user_team="${userTeam.id}" && week=${currentData.week
          } && pick_type="REGULAR"`,
        // ###############################################################################
        // const picks: pickType[] = await pb.collection("picks").getFullList({
        //   filter: `user_team="${userTeam.id}" && week=${
        //     currentData.week
        //   } && game.league="${league}" && pick_type="REGULAR"`,
      });
      if (id) {
        if (picks.length > maxPicks) {
          return {
            error: `You have too many REGULAR ${league} picks for this  week.`,
          };
        }
      } else {
        if (picks.length >= maxPicks) {
          return {
            error: `You have too many REGULAR ${league} picks for this  week.`,
          };
        }
      }
    } else {
      // TEMPORARY FREE FOR ALL ON PICKS THIS WEEK #####################################
      const picks = await pb.collection("picks").getFullList({
        filter: `user_team="${userTeam.id}" && week=${currentData.week
          } && pick_type="BINNY"`,
      });
      // ###############################################################################
      // const picks = await pb.collection("picks").getFullList({
      //   filter: `user_team="${userTeam.id}" && week=${
      //     currentData.week
      //   } && game.league="${league}" && pick_type="BINNY"`,
      // });
      if (id) {
        if (picks.length > maxBinnyPicks) {
          return {
            error: `You have too many BINNY ${league} picks for this week.`,
          };
        }
      } else {
        if (picks.length >= maxBinnyPicks) {
          return {
            error: `You have too many BINNY ${league} picks for this week.`,
          };
        }
      }
    }
    // check if the pick is choosing the favorite or underdog
    let favOrUnd = "";
    if (teamSelected === "HOME" && gameData.home_spread < 0) {
      favOrUnd = "FAV";
    } else if (teamSelected === "HOME" && gameData.home_spread > 0) {
      favOrUnd = "UND";
    } else if (teamSelected === "AWAY" && gameData.away_spread < 0) {
      favOrUnd = "FAV";
    } else {
      favOrUnd = "UND";
    }

    let pickSpread = 0;
    if (teamSelected === "HOME") {
      pickSpread = gameData.home_spread;
    } else {
      pickSpread = gameData.away_spread;
    }
    // attempty to create/update picks
    try {
      if (id) {
        revalidatePath("/user/picks");
        return { error: "pick is already created." };
      } else {
        const record = await pb.collection("picks").create({
          user_team: userTeam.id,
          game: game,
          week: currentData.week,
          team_selected: teamSelected,
          pick_type: pickType,
          pick_spread: pickSpread,
          fav_or_und: favOrUnd,
        });
        revalidatePath("/user/picks");
        return { success: "pick created", record };
      }
    } catch (error: any) {
      console.error(error.data);
      return { error: "server error" };
    }
  },
);

const isNowBeforeGame = (game: gameType): boolean => {
  // Convert the date string to a Date object
  const gameDate = new Date(game.date);

  // Get the current date and time
  const now = new Date();

  // Compare the game date to the current date
  return now <= gameDate;
};
