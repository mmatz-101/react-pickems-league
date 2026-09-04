"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { CreateLeagueWeekSchema } from "@/schema/create-league-week-schema";
import { revalidatePath } from "next/cache";

export const createLeagueWeek = action
  .inputSchema(CreateLeagueWeekSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
    const response = await fetch(`${process.env.POCKETBASE_URL}/api/league-weeks/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ season: parsedInput.season, number: parsedInput.number, name: parsedInput.name, start_date: parsedInput.startDate, end_date: parsedInput.endDate }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { error: data?.message ?? "Unable to create week." };
    revalidatePath("/user/leagues", "layout");
    return { success: data?.message ?? "Week created." };
  });
