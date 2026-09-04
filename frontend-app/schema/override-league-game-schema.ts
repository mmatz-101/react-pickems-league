import { z } from "zod";

export const OverrideLeagueGameSchema = z.object({
  league: z.string().min(1),
  week: z.string().min(1),
  game: z.string().min(1),
  included: z.boolean(),
});
