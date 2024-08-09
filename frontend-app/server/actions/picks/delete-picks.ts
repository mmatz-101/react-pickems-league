"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentDataType } from "../admin/helpers/current-data";
import { gameType } from "./helpers/game-data";

const deleteSchema = z.object({
  id: z.string(),
});

export const deletePick = action(deleteSchema, async ({ id }) => {
  const pb = await getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  const game: gameType = await pb.collection("games").getFirstListItem(id);
  try {
    if (!currentData.allow_picks) {
      return { error: "week is locked." };
    }
    if (game.status !== "Incomplete") {
      return { error: "game has started." };
    }
    await pb.collection("picks").delete(id);
    revalidatePath("/user/picks");
    return { success: "pick deleted" };
  } catch (error) {
    return { error: "error deleting pick" };
  }
});
