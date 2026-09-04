"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { UpdateLeagueWeekSchema } from "@/schema/update-league-week-schema";
import { revalidatePath } from "next/cache";

export const updateLeagueWeek = action
  .inputSchema(UpdateLeagueWeekSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
    const response = await fetch(`${process.env.POCKETBASE_URL}/api/league-weeks/update`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        week: parsedInput.week,
        status: parsedInput.status,
        allow_picks: parsedInput.allowPicks,
        start_date: parsedInput.startDate,
        end_date: parsedInput.endDate,
        max_nfl_picks: parsedInput.maxNFLPicks,
        max_ncaaf_picks: parsedInput.maxNCAAFPicks,
        max_nfl_binny_picks: parsedInput.maxNFLBinnyPicks,
        max_ncaaf_binny_picks: parsedInput.maxNCAAFBinnyPicks,
        is_current: parsedInput.isCurrent,
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { error: data?.message ?? "Unable to update week." };
    revalidatePath("/user/leagues", "layout");
    return { success: data?.message ?? "Week updated." };
  });
