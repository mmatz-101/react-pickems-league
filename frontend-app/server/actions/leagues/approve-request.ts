"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { ApproveLeagueRequestSchema } from "@/schema/approve-league-request-schema";
import { revalidatePath } from "next/cache";

export const approveLeagueRequest = action
  .inputSchema(ApproveLeagueRequestSchema)
  .action(async ({ parsedInput }) => {
    const pb = await getPB();
    if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
    if (pb.authStore.model?.platform_role !== "PLATFORM_ADMIN") return { error: "Only platform administrators can approve requests." };
    const response = await fetch(`${process.env.POCKETBASE_URL}/api/league-requests/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { error: data?.message ?? "Unable to approve request." };
    revalidatePath("/admin/league-requests");
    return { success: data?.message ?? "Request approved." };
  });
