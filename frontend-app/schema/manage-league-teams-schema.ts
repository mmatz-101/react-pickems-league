import { z } from "zod";

export const CreateLeagueTeamSchema = z.object({
  league: z.string().min(1),
  name: z.string().trim().min(1).max(100),
});

export const MoveLeagueMemberSchema = z.object({
  membership: z.string().min(1),
  leagueTeam: z.string().min(1),
});
