import { z } from "zod";

export const LoginSchema = z.object({
    redirectTo: z.string().startsWith("/join/").optional(),
  email: z.string().email(),
  password: z.string().min(8).max(20),
});

