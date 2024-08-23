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
    <div className="flex-1 flex-col items-center justify-center h-full py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl py-4">Signup</h1>
        <SignupComponent />
      </div>
    </div>
  );
}
