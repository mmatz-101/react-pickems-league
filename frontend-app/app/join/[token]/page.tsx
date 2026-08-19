import JoinLeagueInvite from "@/components/leagues/join-league-invite";
import { getPB } from "@/app/pocketbase";
import { redirect } from "next/navigation";

export default async function JoinInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const pb = await getPB();

  if (!pb.authStore.isValid) {
    redirect(`/signup?redirect=${encodeURIComponent(`/join/${token}`)}`);
  }

  return <JoinLeagueInvite token={token} />;
}
