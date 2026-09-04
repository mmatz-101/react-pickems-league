"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { SubmitPickSchema } from "@/schema/submit-pick";
import { revalidatePath } from "next/cache";
import { gameType } from "./helpers/game-data";
import { pickType } from "./helpers/pick-data";

export interface ReturnInfo {
  error?: string;
  success?: string;
  update?: boolean;
}

export const submitPick = action
  .inputSchema(SubmitPickSchema)
  .action(async ({ parsedInput: { id, game, league, leagueTeam, leagueGame, weekRecord, teamSelected, pickType } }) => {
    const pb = await getPB();
    if (!leagueGame) {
      return { error: "This game is not included in the selected league." };
    }
    const week = await pb.collection("weeks").getOne(weekRecord);
    const gameData: gameType = await pb.collection("games").getOne(game);

    const leagueGameRecord = await pb.collection("league_games").getOne(leagueGame);
    if (leagueGameRecord.game !== game || leagueGameRecord.week !== weekRecord || leagueGameRecord.league !== (await pb.collection("seasons").getOne(week.season)).league) {
      return { error: "League game is not part of the selected league week." };
    }
    if (!week.allow_picks || week.status !== "OPEN") {
      return { error: "Week is locked.", update: Boolean(id) };
    }
    if (!isNowBeforeGame(gameData)) {
      return { error: "Game has already started/completed.", update: Boolean(id) };
    }

    const maxPicks = league === "NFL" ? week.max_nfl_picks : week.max_ncaaf_picks;
    const maxBinnyPicks = league === "NFL" ? week.max_nfl_binny_picks : week.max_ncaaf_binny_picks;
    const existingPicks: pickType[] = await pb.collection("picks").getFullList({
      filter: `league_team="${leagueTeam}" && week_record="${weekRecord}" && game.sport="${league}" && pick_type="${pickType}"`,
    });
    const limit = pickType === "REGULAR" ? maxPicks : maxBinnyPicks;
    if (existingPicks.length >= limit && !id) {
      return { error: `You have too many ${pickType} ${league} picks for this week.` };
    }
    if (id) {
      return { error: "Pick is already created.", update: true };
    }

    const pickSpread = teamSelected === "HOME" ? gameData.home_spread : gameData.away_spread;
    const favOrUnd = pickSpread < 0 ? "FAV" : "UND";

    try {
      const record = await pb.collection("picks").create({
        league_team: leagueTeam,
        league_game: leagueGame,
        week_record: weekRecord,
        game,
        week: week.number,
        team_selected: teamSelected,
        pick_type: pickType,
        pick_spread: pickSpread,
        fav_or_und: favOrUnd,
      });
      revalidatePath("/user/picks");
      return { success: "Pick created", record };
    } catch (error) {
      console.error(error);
      return { error: "Server error" };
    }
  });

const isNowBeforeGame = (game: gameType): boolean => new Date() <= new Date(game.date);
