"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { UpdateLeagueProfileSchema } from "@/schema/update-league-profile-schema";
import { revalidatePath } from "next/cache";

export const updateLeagueProfile = action
  .inputSchema(UpdateLeagueProfileSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    if (!pb.authStore.isValid || !pb.authStore.token) {
      return { error: "You must be signed in." };
    }

    const baseUrl = process.env.POCKETBASE_URL;
    if (!baseUrl) return { error: "League service is not configured." };
    const headers = {
      Authorization: `Bearer ${pb.authStore.token}`,
      "Content-Type": "application/json",
    };

    const displayResponse = await fetch(`${baseUrl}/api/league-memberships/update-display-name`, {
      method: "POST",
      headers,
      body: JSON.stringify({ membership: parsedInput.membership, display_name: parsedInput.displayName }),
      cache: "no-store",
    });
    if (!displayResponse.ok) {
      const data = await displayResponse.json().catch(() => null);
      return { error: data?.message ?? "Unable to update display name." };
    }

    const teamResponse = await fetch(`${baseUrl}/api/league-teams/rename`, {
      method: "POST",
      headers,
      body: JSON.stringify({ league_team: parsedInput.leagueTeam, name: parsedInput.teamName }),
      cache: "no-store",
    });
    if (!teamResponse.ok) {
      const data = await teamResponse.json().catch(() => null);
      return { error: data?.message ?? "Unable to rename group." };
    }

    revalidatePath("/user/leagues", "layout");
    return { success: "League profile updated." };
  });
