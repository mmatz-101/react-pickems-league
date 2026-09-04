import { z } from "zod";

export const SelectLeaguePeriodSchema = z.object({
  id: z.string().min(1),
});
