import { z } from "zod";

export const RevokeLeagueInviteSchema = z.object({
  invite: z.string().min(1),
});
