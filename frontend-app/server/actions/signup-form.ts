"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { redirect } from "next/navigation";
import { SignupSchema } from "@/schema/signup-schema";

export const SignupUser = action(
  SignupSchema,
  async ({ firstName, lastName, email, password }) => {
    try {
      // creating user data
      const userData = {
        username: firstName + lastName,
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
      return { error: "User creation failed, try refreshing the page." };
    }
    // redirect cannot be inside try and catch block
    redirect("/login");
  },
);
