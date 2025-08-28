"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { CurrentWeekSchema } from "@/schema/current-week-schema";
import { revalidatePath } from "next/cache";
import { ClientResponseError } from "pocketbase";
import { currentDataType } from "./helpers/current-data";

export const CurrentWeekUpdate = action
  .inputSchema(CurrentWeekSchema)
  .action(async ({ parsedInput: { currentWeek } }) => {
    try {
      const pb = await getPB();
      // check if current week is present in db
      const currentData: currentDataType = await pb
        .collection("current")
        .getFirstListItem("");
      await pb.collection("current").update(currentData.id, {
        week: currentWeek,
      });
      revalidatePath("/admin/dashboard");
      return { success: "Current week updated" };
    } catch (error) {
      if (error instanceof ClientResponseError) {
        return {
          error: "Error updating current week no current week present in DB.",
        };
      }
    }
  },
  );

