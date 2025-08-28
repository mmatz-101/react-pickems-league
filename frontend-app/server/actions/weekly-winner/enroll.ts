"use server";
import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { getUsersTeam } from "@/lib/utils";
import { z } from "zod";
import { userTeamType } from "../picks/helpers/pick-data";
import { weeklyWinnerType } from "../picks/helpers/weekly-winner";
import { revalidatePath } from "next/cache";

const schema = z.object({
  userID: z.string(),
});

export const enrollUser = action
  .inputSchema(schema)
  .action(async ({ parsedInput: { userID } }) => {
    const pb = await getPB();
    // get user team
    const userTeam: userTeamType = await getUsersTeam(userID);

    // check if the user is enrolled in the weekly challenge
    const userEnrolled: weeklyWinnerType[] = await pb
      .collection("weekly_winner_comp")
      .getFullList({
        filter: `user_team="${userTeam.id}"`,
      });

    // check if the user is in the weekly winner challenge
    if (userEnrolled.length > 0) {
      try {
        // update the user to be enrolled
        await pb.collection("weekly_winner_comp").update(userEnrolled[0].id, {
          enrolled: true,
        });
      } catch (error) {
        console.error(error);
      }

      revalidatePath("/user/weekly-winner");
      return;
    }

    // since the user is not in the weekly winner challenge, we will add them
    try {
      await pb.collection("weekly_winner_comp").create({
        user_team: userTeam.id,
        enrolled: true,
      });
    } catch (error) {
      console.error(error);
    }

    revalidatePath("/user/weekly-winner");
  });
