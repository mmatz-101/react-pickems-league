"use server";

import { getPB } from "@/app/pocketbase";
import { ClientResponseError } from "pocketbase";
import { action } from "@/lib/safe-action";
import { redirect } from "next/navigation";
import { SignupSchema } from "@/schema/signup-schema";

export const SignupUser = action
  .inputSchema(SignupSchema)
  .action(async ({ parsedInput: { firstName, lastName, email, password, redirectTo } }) => {
    try {
      // creating user data
      const userData = {
        // PocketBase generates a valid unique username from its collection pattern.
        // Names may contain spaces and other normal display-name characters.
        email,
        password,
        passwordConfirm: password,
        first_name: firstName,
        last_name: lastName,
      };

      const pb = await getPB();

      await pb.collection("users").create(userData);

      // send an email verification request
      await pb.collection("users").requestVerification(email);
    } catch (error) {
      console.error(error);
      if (error instanceof ClientResponseError) {
        const fieldErrors = Object.values(error.response?.data ?? {}) as { message?: string }[];
        const message = fieldErrors[0]?.message;
        if (message) return { error: message };
      }
      return { error: "Unable to create your account. Check your details and try again." };
    }
    // redirect cannot be inside try and catch block
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(loginUrl);
  },
  );
