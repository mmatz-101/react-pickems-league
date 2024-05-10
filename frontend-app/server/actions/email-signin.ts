"use server";
import { LoginSchema } from "@/types/login-schema";
import { createSafeActionClient } from "next-safe-action";
import { db } from "../index";
import { eq } from "drizzle-orm";
import { users } from "@/server/schema";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

const action = createSafeActionClient();

export const emailSignIn = action(
  LoginSchema,
  async ({ email, password, code }) => {
    try {
      
    // check if user is in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser?.email !== email) {
      return { error: "Email not found" };
    }
    
    // if email is not verified
    if (!existingUser?.emailVerified) {
      return { error: "Email not verified" };
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${existingUser.id}`,
    })

    return { success: email };
    } catch (error) {
      console.log(error)
      if (error instanceof AuthError){
        switch(error.type){
          case "CredentialsSignin":
            return { error: "Email or Password Incorrect" };
          default:
            return { error: "An error occurred" };
        }
      }
      throw error
    }
  }
);
