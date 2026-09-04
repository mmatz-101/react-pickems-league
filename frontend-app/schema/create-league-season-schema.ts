import { z } from "zod";

export const CreateLeagueSeasonSchema = z.object({
  league: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  year: z.number().int().positive(),
  regularWin: z.number(),
  regularPush: z.number(),
  regularLoss: z.number(),
  binnyWin: z.number(),
  binnyPush: z.number(),
  binnyLoss: z.number(),
});
