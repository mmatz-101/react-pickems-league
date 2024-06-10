"use server";

import { getPB } from "@/lib/pocketbase";
import { action } from "@/lib/safe-action";
import { SignupSchema } from "@/schema/signup-schema";
import Pocketbase from "pocketbase";

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

      const pb = getPB();

      const record = await pb.collection("users").create(userData);

      // send an email verification request
      await pb.collection("users").requestVerification(email);

      return {success: "User created successfully", record};
    } catch (error) {
      console.log(error);
      return {error: "User creation failed"}
    }
  }
);
