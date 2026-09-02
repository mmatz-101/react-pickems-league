import { z } from "zod";

export const SubmitPickSchema = z.object({
  id: z.optional(z.string()),
  game: z.string(),
  league: z.enum(["NFL", "NCAAF"]),
  leagueTeam: z.string(),
  leagueGame: z.string(),
  weekRecord: z.string(),
  teamSelected: z.enum(["HOME", "AWAY"]),
  pickType: z.enum(["REGULAR", "BINNY"]),
});


export const PICK_TYPES = ["REGULAR", "BINNY"] as const;
export const pickTypeSchema = z.enum(PICK_TYPES);

export type PickType = z.infer<typeof pickTypeSchema>;
