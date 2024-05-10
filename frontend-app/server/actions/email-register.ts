"use server";
import { RegisterSchema } from "@/types/register-schema";
import { createSafeActionClient } from "next-safe-action";
import { db } from "@/server";
import { users } from "@/server/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { generateEmailVerificationToken } from "./tokens";
import { sendVerificationEmail } from "./email";

const action = createSafeActionClient();

export const emailRegister = action(
  RegisterSchema,
  async ({ email, name, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user is already in db
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // check if email is already in the database if found return that it is in use, else register new user to database
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verificationToken = await generateEmailVerificationToken(email);
        await sendVerificationEmail(
          verificationToken[0].email,
          verificationToken[0].token
        );

        return { success: "Email Confirmation Resent" };
      }
      return {
        error: "Email is already in use",
      };
    }

    // logic for when the user is not registered
    await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      name,
      password: hashedPassword,
    });

    const verificationToken = await generateEmailVerificationToken(email);
    await sendVerificationEmail(
      verificationToken[0].email,
      verificationToken[0].token
    );

    return { success: "Confirmation Email Sent!" };
  }
);
