"use server";

import SignupComponent from "@/components/auth/signup";
import { getPB } from "../pocketbase";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const pb = await getPB();
  if (pb.authStore.isValid) {
    redirect("/user/dashboard");
  }
  return (
    <div>
      <h1>Signup</h1>
      <SignupComponent />
    </div>
  );
}
