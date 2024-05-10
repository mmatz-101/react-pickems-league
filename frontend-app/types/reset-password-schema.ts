import * as z from "zod";

export const ResetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
}) 