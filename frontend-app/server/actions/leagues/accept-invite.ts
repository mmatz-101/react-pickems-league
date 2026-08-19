"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { AcceptLeagueInviteSchema } from "@/schema/accept-league-invite-schema";
import { ClientResponseError } from "pocketbase";

export const acceptLeagueInvite = action
  .inputSchema(AcceptLeagueInviteSchema)
  .action(async ({ parsedInput: { token } }) => {
    const pb = await getPB();

    if (!pb.authStore.isValid || !pb.authStore.token) {
      return { error: "You must be signed in to accept this invite." };
    }

    const backendUrl = process.env.POCKETBASE_URL;
    if (!backendUrl) {
      return { error: "Invite service is not configured." };
    }

    try {
      const response = await fetch(`${backendUrl}/api/league-invites/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pb.authStore.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data?.message ?? "Unable to accept invite." };
      }

      return { success: data.message, leagueId: data.league };
    } catch (error) {
      if (error instanceof ClientResponseError) {
        return { error: error.message };
      }
      return { error: "Unable to reach the invite service." };
    }
  });
