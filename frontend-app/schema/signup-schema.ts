import { z } from "zod";

export const SignupSchema = z.object({
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(20),
});
