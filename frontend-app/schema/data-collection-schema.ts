import * as z from "zod";

export const DataCollectionSchema = z.object({
    league: z.enum(["NFL", "NCAAF"]),
    year: z.string(),
    week: z.string(),
    currentWeek: z.string(),
})