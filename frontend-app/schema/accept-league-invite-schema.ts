import { z } from "zod";

export const AcceptLeagueInviteSchema = z.object({
  token: z.string().min(1),
});
