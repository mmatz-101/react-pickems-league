"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { CreateLeagueTeamSchema, MoveLeagueMemberSchema } from "@/schema/manage-league-teams-schema";
import { revalidatePath } from "next/cache";

async function callBackend(path: string, body: unknown) {
  const pb = await getPB();
  if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
  const baseUrl = process.env.POCKETBASE_URL;
  if (!baseUrl) return { error: "League service is not configured." };
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  return response.ok ? { success: data?.message } : { error: data?.message ?? "League operation failed." };
}

export const createLeagueTeam = action
  .inputSchema(CreateLeagueTeamSchema)
  .action(async ({ parsedInput }) => {
    const result = await callBackend("/api/league-teams/create", parsedInput);
    if (result.success) revalidatePath("/user/leagues", "layout");
    return result;
  });

export const moveLeagueMember = action
  .inputSchema(MoveLeagueMemberSchema)
  .action(async ({ parsedInput }) => {
    const result = await callBackend("/api/league-teams/move-member", {
      membership: parsedInput.membership,
      league_team: parsedInput.leagueTeam,
    });
    if (result.success) revalidatePath("/user/leagues", "layout");
    return result;
  });
