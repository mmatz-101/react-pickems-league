import * as z from "zod";

export const CurrentWeekSchema = z.object({
    currentWeek: z.coerce.number(),
})