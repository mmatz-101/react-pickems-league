"use server";

import { pb } from "@/lib/pocketbase";
import { action } from "@/lib/safe-action";
import { LoginSchema } from "@/schema/login-schema";

export const LoginUser = action(LoginSchema, async ({ email, password }) => {
  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    return { success: "User logged in successfully", user: authData.record };
  } catch (error) {
    return { error: "User login failed" };
  }
});
