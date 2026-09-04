import { z } from "zod";

export const ApproveLeagueRequestSchema = z.object({
  request: z.string().min(1),
});
