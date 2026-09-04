import { z } from "zod";

export const CreateLeagueWeekSchema = z.object({
  season: z.string().min(1),
  number: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});
