"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { LoginSchema } from "@/schema/login-schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const LoginUser = action(LoginSchema, async ({ email, password }) => {
  try {
    const pb = await getPB();
    await pb.collection("users").authWithPassword(email, password);

    cookies().set("pb_auth", pb.authStore.exportToCookie({ httpOnly: false }));
  } catch (error) {
    return { error: "User login failed" };
  }
  redirect("/user/dashboard");
});
