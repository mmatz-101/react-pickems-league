"use server";

import LoginComponent from "@/components/auth/login";
import { getPB } from "../pocketbase";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const pb = await getPB();
  if (pb.authStore.isValid) {
    redirect("/user/dashboard");
  }
  return (
    <div className="flex-1 flex-col items-center justify-center h-full py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl py-4">Login</h1>
        <LoginComponent redirectTo={(await searchParams).redirect} />
      </div>
    </div>
  );
}
