"use server";

import { db } from "@/server";
import { picks } from "@/server/schema";
import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
const action = createSafeActionClient();

const schema = z.object({
  gameID: z.string(),
  team: z.enum(["HOME", "AWAY"]),
  pickType: z.enum(["REGULAR", "BINNY"]),
});

export const teamSubmit = action(schema, async ({ gameID, team, pickType }) => {
  console.log(gameID, team, pickType);

  const pick = await db.query.picks.findFirst({
    where: eq(picks.gameID, gameID),
  });

  if (!pick) {
    try {
      await db.insert(picks).values({
        gameID,
        team,
        pickType,
      });
      return { succcess: "pick submitted" };
    } catch (error) {
      return { error: "error submitting pick" };
    }
  } else {
    try {
      await db
        .update(picks)
        .set({
          gameID,
          team,
          pickType,
        })
        .where(eq(picks.id, pick.id));
      return { success: "pick updated" };
    } catch (error) {
      return { error: "error updating pick" };
    }
  }
});
