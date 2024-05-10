"use server";

import { ResetPasswordSchema } from "@/types/reset-password-schema";
import { createSafeActionClient } from "next-safe-action";
import { db } from "@/server";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./email";

const action = createSafeActionClient();
export const resetPassword = action(ResetPasswordSchema, async ({ email }) => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return { error: "User not found" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (!passwordResetToken) {
    return { error: "Unable to generate password token" };
  }
  await sendPasswordResetEmail(email, passwordResetToken[0].token);

  return { success: "Password Reset Email Sent" };
});
