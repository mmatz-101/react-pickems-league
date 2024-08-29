import { getPB } from "@/app/pocketbase";
import { userTeamType } from "@/server/actions/picks/helpers/pick-data";
import { type ClassValue, clsx } from "clsx";
import { redirect } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getUsersTeam(id: string) {
  const pb = await getPB();
  // get user's team
  let userTeam: userTeamType;
  try {
    userTeam = await pb
      .collection("user_teams")
      .getFirstListItem(`users~"${id}"`);
    return userTeam;
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error("User's team not found");
      redirect("/no-team");
    } else {
      console.error("Error getting user's team", error);
    }
    throw Error("Error getting user's team");
  }
}
