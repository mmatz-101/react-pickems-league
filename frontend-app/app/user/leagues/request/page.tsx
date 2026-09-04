import Link from "next/link";
import { getPB } from "@/app/pocketbase";
import { redirect } from "next/navigation";
import RequestLeagueForm from "@/components/leagues/request-league-form";

export default async function RequestLeaguePage() {
  const pb = await getPB();
  if (!pb.authStore.isValid) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <Link className="text-sm underline" href="/user/dashboard">← Back to dashboard</Link>
      <div>
        <p className="text-sm text-muted-foreground">New league</p>
        <h1 className="text-3xl font-bold">Request a league</h1>
        <p className="mt-2 text-muted-foreground">
          League requests are reviewed before a league is activated.
        </p>
      </div>
      <RequestLeagueForm />
    </main>
  );
}
