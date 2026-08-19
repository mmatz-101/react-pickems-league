import { z } from "zod";

export const LeagueInviteSchema = z.object({
  leagueId: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.coerce.number().int().positive().optional(),
});
