"use server";

import { getPB } from "@/lib/pocketbase";
import { action } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentDataType } from "../admin/helpers/current-data";

const deleteSchema = z.object({
  id: z.string(),
});

export const deletePick = action(deleteSchema, async ({ id }) => {
  const pb = getPB();
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
  try {
    if (!currentData.allow_picks) {
      return { error: "week is locked." };
    }
    await pb.collection("picks").delete(id);
    revalidatePath("/user/picks");
    return { success: "pick deleted" };
  } catch (error) {
    return { error: "error deleting pick" };
  }
});

