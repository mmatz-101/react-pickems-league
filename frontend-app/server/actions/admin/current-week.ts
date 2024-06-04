"use server"

import { pb } from "@/lib/pocketbase";
import { CurrentWeekSchema } from "@/schema/current-week-schema";
import { createSafeActionClient } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { ClientResponseError } from "pocketbase";

const action = createSafeActionClient();

export const CurrentWeekUpdate = action(CurrentWeekSchema, async ({ currentWeek }) => {
    try {
        // check if current week is present in db
        const currentData = await pb.collection("current").getFirstListItem("")
        await pb.collection("current").update(currentData.id, {
            "week": currentWeek,
        })
        return { success: "Current week updated" };
    } catch (error) {
        if (error instanceof ClientResponseError){
            return { error: "Error updating current week no current week present in DB." };
        }
    }
})