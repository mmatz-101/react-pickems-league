"use server";

import { NewPasswordSchema } from "@/types/new-password-schema";
import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";
import { passwordResetTokens, users } from "../schema";
import { db } from "@/server";
import { getPasswordResetTokenByToken } from "./tokens";
import bcrypt from "bcrypt";

const action = createSafeActionClient();
export const newPassword = action(
  NewPasswordSchema,
  async ({ password, token }) => {
    if (!token) {
      return { error: "Token is required" };
    }

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return { error: "Token not found" };
    }

    if (new Date(existingToken.expires) < new Date()) {
      return { error: "Token has expired" };
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, existingToken.email),
    });

    if (!existingUser) {
      return { error: "User not found" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // database transaction
    await db.transaction(async (tx) => {
      // update user password with hashed password
      await tx
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.id, existingUser.id));
      // delete token
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, existingToken.id));
    });

    return {success: "Password updated"}
  }
);
