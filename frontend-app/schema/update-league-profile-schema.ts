import { z } from "zod";

export const UpdateLeagueProfileSchema = z.object({
  membership: z.string().min(1),
  displayName: z.string().trim().min(1).max(100),
  leagueTeam: z.string().min(1),
  teamName: z.string().trim().min(1).max(100),
});
