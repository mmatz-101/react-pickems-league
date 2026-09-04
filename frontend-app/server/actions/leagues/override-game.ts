"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { OverrideLeagueGameSchema } from "@/schema/override-league-game-schema";
import { revalidatePath } from "next/cache";

export const overrideLeagueGame = action
  .inputSchema(OverrideLeagueGameSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
    const baseUrl = process.env.POCKETBASE_URL;
    if (!baseUrl) return { error: "League service is not configured." };
    const response = await fetch(`${baseUrl}/api/league-games/override`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { error: data?.message ?? "Unable to update the game." };
    revalidatePath("/user/leagues", "layout");
    return { success: data?.message ?? "Game updated." };
  });
