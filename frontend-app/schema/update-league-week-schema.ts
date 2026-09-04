import { z } from "zod";

export const UpdateLeagueWeekSchema = z.object({
  week: z.string().min(1),
  status: z.enum(["SETUP", "OPEN", "LOCKED", "COMPLETED"]).optional(),
  allowPicks: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxNFLPicks: z.number().int().nonnegative().optional(),
  maxNCAAFPicks: z.number().int().nonnegative().optional(),
  maxNFLBinnyPicks: z.number().int().nonnegative().optional(),
  maxNCAAFBinnyPicks: z.number().int().nonnegative().optional(),
  isCurrent: z.boolean().optional(),
});
