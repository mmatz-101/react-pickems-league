import {z} from "zod";

export const SubmitPickSchema = z.object({
    id: z.optional(z.string()),
    game: z.string(),
    league: z.enum(["NFL", "NCAAF"]),
    teamSelected: z.enum(["HOME", "AWAY"]),
    pickType: z.enum(["REGULAR", "BINNY"]),
});
