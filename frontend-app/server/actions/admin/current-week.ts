"use server"

import { db } from "@/server";
import { CurrentWeekSchema } from "@/types/current-week";
import {currentWeeks } from "@/server/schema";
import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";

const action = createSafeActionClient();

export const CurrentWeekUpdate = action(CurrentWeekSchema, async ({ currentWeek }) => {
    try {
        // do something with currentWeek
        const currentWeekDB = await db.query.currentWeeks.findFirst({
            where: eq(currentWeeks.id, "current_week")
        })
        if(currentWeekDB){
            await db.update(currentWeeks).set({
                currentWeek: currentWeek
            }).where(eq(currentWeeks.id, "current_week"))
        } else {
            await db.insert(currentWeeks).values({
                id: "current_week",
                currentWeek: currentWeek
            })
        }
        return { success: "Current week updated" };
    } catch (error) {
        return { error: "Error updating current week" };
    }
})