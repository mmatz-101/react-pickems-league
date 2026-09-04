"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { LeagueRequestSchema } from "@/schema/league-request-schema";
import { ClientResponseError } from "pocketbase";
import { revalidatePath } from "next/cache";

export const requestLeague = action
  .inputSchema(LeagueRequestSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    const userId = pb.authStore.model?.id;
    if (!pb.authStore.isValid || !userId) return { error: "You must be signed in." };

    const existing = await pb.collection("league_requests").getList(1, 1, {
      filter: `requester="${userId}" && status="PENDING"`,
    });
    if (existing.totalItems > 0) return { error: "You already have a pending league request." };

    try {
      await pb.collection("league_requests").create({
        requester: userId,
        requested_name: parsedInput.requestedName,
        description: parsedInput.description ?? "",
        status: "PENDING",
      });
      revalidatePath("/user/leagues/request");
      return { success: "League request submitted for approval." };
    } catch (error) {
      if (error instanceof ClientResponseError) return { error: error.message };
      return { error: "Unable to submit league request." };
    }
  });
