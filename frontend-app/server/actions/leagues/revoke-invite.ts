"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { RevokeLeagueInviteSchema } from "@/schema/revoke-league-invite-schema";
import { revalidatePath } from "next/cache";

export const revokeLeagueInvite = action
  .inputSchema(RevokeLeagueInviteSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
    const baseUrl = process.env.POCKETBASE_URL;
    if (!baseUrl) return { error: "Invite service is not configured." };

    const response = await fetch(`${baseUrl}/api/league-invites/revoke`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { error: data?.message ?? "Unable to revoke invite." };

    revalidatePath("/user/league/invites");
    return { success: data?.message ?? "Invite revoked." };
  });
