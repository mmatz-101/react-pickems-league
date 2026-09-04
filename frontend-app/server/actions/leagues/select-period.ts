"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { SelectLeaguePeriodSchema } from "@/schema/select-league-period-schema";
import { revalidatePath } from "next/cache";

async function callPeriodEndpoint(path: string, id: string) {
  const pb = await getPB();
  if (!pb.authStore.isValid || !pb.authStore.token) return { error: "You must be signed in." };
  const response = await fetch(`${process.env.POCKETBASE_URL}${path}`, { method: "POST", headers: { Authorization: `Bearer ${pb.authStore.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ [path.includes("season") ? "season" : "week"]: id }), cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { error: data?.message ?? "Unable to update league period." };
  revalidatePath("/user/leagues", "layout");
  return { success: data?.message };
}

export const activateLeagueSeason = action.inputSchema(SelectLeaguePeriodSchema).action(async ({ parsedInput }) => callPeriodEndpoint("/api/league-seasons/activate", parsedInput.id));
export const setCurrentLeagueWeek = action.inputSchema(SelectLeaguePeriodSchema).action(async ({ parsedInput }) => callPeriodEndpoint("/api/league-weeks/set-current", parsedInput.id));
