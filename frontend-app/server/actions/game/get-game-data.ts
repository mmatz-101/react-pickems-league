"use server";
import { db } from "@/server";
import { currentWeeks, games } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getGameData() {
  try {
    const currentWeek = await db.query.currentWeeks.findFirst({
      where: eq(currentWeeks.id, "current_week"),
    });
    if (!currentWeek) {
      return { error: "Error with database (unable to find current week)" };
    }
    const gameData = await db.query.games.findMany({
      where: eq(games.week, currentWeek.currentWeek!),
    });

    return { success: gameData };
  } catch (e) {
    return { error: "Error with database" };
  }
}
