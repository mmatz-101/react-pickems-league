"use server";

import LoginComponent from "@/components/auth/login";
import { getPB } from "../pocketbase";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const pb = await getPB();
  if (pb.authStore.isValid) {
    redirect("/user/dashboard");
  }
  return (
    <div>
      <h1>Login</h1>
      <LoginComponent />
    </div>
  );
}
