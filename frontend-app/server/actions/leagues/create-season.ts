"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { CreateLeagueSeasonSchema } from "@/schema/create-league-season-schema";
import { revalidatePath } from "next/cache";

export const createLeagueSeason = action.inputSchema(CreateLeagueSeasonSchema).action(async ({ parsedInput }) => {
  const pb = await getPB();
  if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
  const response = await fetch(`${process.env.POCKETBASE_URL}/api/league-seasons/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ league: parsedInput.league, name: parsedInput.name, year: parsedInput.year, regular_win_points: parsedInput.regularWin, regular_push_points: parsedInput.regularPush, regular_loss_points: parsedInput.regularLoss, binny_win_points: parsedInput.binnyWin, binny_push_points: parsedInput.binnyPush, binny_loss_points: parsedInput.binnyLoss }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { error: data?.message ?? "Unable to create season." };
  revalidatePath("/user/leagues", "layout");
  return { success: data?.message ?? "Season created." };
});
