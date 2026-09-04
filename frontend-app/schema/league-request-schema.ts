import { z } from "zod";

export const LeagueRequestSchema = z.object({
  requestedName: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional(),
});
