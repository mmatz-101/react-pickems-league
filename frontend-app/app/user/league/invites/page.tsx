import { getPB } from "@/app/pocketbase";
import CreateInviteForm from "@/components/leagues/create-invite-form";
import Link from "next/link";

export default async function LeagueInvitesPage() {
  const pb = await getPB();
  const userId = pb.authStore.model?.id;

  if (!userId) {
    return <p>You must be signed in to manage league invites.</p>;
  }

  const memberships = await pb.collection("league_memberships").getFullList({
    filter: `user="${userId}" && role="COMMISSIONER" && status="ACTIVE"`,
    expand: "league",
  });

  const leagues = memberships.map((membership) => ({
    id: membership.league,
    name: membership.expand?.league?.name ?? membership.league,
  }));

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <Link className="text-sm underline" href="/user/dashboard">
        ← Back to league settings
      </Link>
      <div>
        <h1 className="text-2xl font-bold">League invites</h1>
        <p className="text-muted-foreground">
          Create an invite for an active league you commission.
        </p>
      </div>
      <CreateInviteForm leagues={leagues} />
    </main>
  );
}
