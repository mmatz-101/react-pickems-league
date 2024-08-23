"use server";

import { action } from "@/lib/safe-action";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const LogoutUser = action({}, async () => {
  cookies().delete("pb_auth");

  redirect("/");
});
