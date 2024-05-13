"use server";

import { NewPasswordSchema } from "@/types/new-password-schema";
import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";
import { passwordResetTokens, users } from "../schema";
import { db } from "@/server";
import { getPasswordResetTokenByToken } from "./tokens";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/neon-serverless";

const action = createSafeActionClient();
export const newPassword = action(
  NewPasswordSchema,
  async ({ password, token }) => {
    const pool =  new Pool({connectionString: process.env.POSTGRES_URL});
    const dbpool = drizzle(pool);

    if (!token) {
      return { error: "Token is required" };
    }

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return { error: "Token not found. Double check your email for a more recent password reset." };
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

    try {
    // database transaction
    await dbpool.transaction(async (tx) => {
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

    } catch (error) {
      return { error: "Unable to update password. Database error." };
    }

    return {success: "Password updated"}
  }
);
