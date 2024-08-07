"use server";

import { getPB } from "@/lib/pocketbase";
import { action } from "@/lib/safe-action";
import { SubmitPickSchema } from "@/schema/submit-pick";
import { currentDataType } from "../admin/helpers/current-data";
import { revalidatePath } from "next/cache";

export const submitPick = action(
  SubmitPickSchema,
  async ({ id, game, league, teamSelected, pickType }) => {
    const pb = getPB();
    // get current data
    const currentData: currentDataType = await pb
      .collection("current")
      .getFirstListItem("");
    // check if the week is locked
    if (!currentData.allow_picks) {
      return { error: "week is locked." };
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
    // check how many games the user has picked.
    if (pickType === "REGULAR") {
      const picks = await pb.collection("picks").getFullList({
        filter: `user="${pb.authStore.model!.id}" && week=${
          currentData.week
        } && game.league="${league}" && pick_type="REGULAR"`,
      });
      if (id) {
        if (picks.length > maxPicks) {
          return {
            error: `You have too many REGULAR ${league} picks for this  week. Try removing a pick first.`,
          };
        }
      } else {
        if (picks.length >= maxPicks) {
          return {
            error: `You have too many REGULAR ${league} picks for this  week. Try removing a pick first.`,
          };
        }
      }
    } else {
      const picks = await pb.collection("picks").getFullList({
        filter: `user="${pb.authStore.model!.id}" && week=${
          currentData.week
        } && game.league="${league}" && pick_type="BINNY"`,
      });
      if (id) {
        if (picks.length > maxBinnyPicks) {
          return {
            error: `You have too many BINNY ${league} picks for this week. Try removing a pick first.`,
          };
        }
      } else {
        if (picks.length >= maxBinnyPicks) {
          return {
            error: `You have too many BINNY ${league} picks for this week. Try removing a pick first.`,
          };
        }
      }
    }
    // attempty to create/update picks
    try {
      if (id) {
        console.log("updating pick");
        const record = await pb.collection("picks").update(id, {
          user: pb.authStore.model!.id,
          game: game,
          week: currentData.week,
          team_selected: teamSelected,
          pick_type: pickType,
        });
        revalidatePath("/user/picks");
        return { success: "pick updated", record };
      } else {
        console.log("creating pick");
        const record = await pb.collection("picks").create({
          user: pb.authStore.model!.id,
          game: game,
          week: currentData.week,
          team_selected: teamSelected,
          pick_type: pickType,
        });
        revalidatePath("/user/picks");
        return { success: "pick created", record };
      }
    } catch (error: any) {
      console.log(error.data);
      return { error: "server error" };
    }
  },
);
