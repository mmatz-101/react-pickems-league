import { z } from "zod";

export const UpdateLeagueWeekSchema = z.object({
  week: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxNFLPicks: z.number().int().nonnegative().optional(),
  maxNCAAFPicks: z.number().int().nonnegative().optional(),
  maxNFLBinnyPicks: z.number().int().nonnegative().optional(),
  maxNCAAFBinnyPicks: z.number().int().nonnegative().optional(),
});
