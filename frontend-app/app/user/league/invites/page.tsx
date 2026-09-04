import { getPB } from "@/app/pocketbase";
import CreateInviteForm from "@/components/leagues/create-invite-form";
import LeagueInviteList from "@/components/leagues/league-invite-list";
import { ArrowLeft, History, Link2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LeagueInvitesPage() {
  const pb = await getPB();
  const userId = pb.authStore.model?.id;
  if (!userId) return <p>You must be signed in to manage league invites.</p>;

  const memberships = await pb.collection("league_memberships").getFullList({ filter: `user="${userId}" && role="COMMISSIONER" && status="ACTIVE"`, expand: "league" });
  const leagues = memberships.map((membership) => ({ id: membership.league, name: membership.expand?.league?.name ?? membership.league }));
  const invites = await pb.collection("league_invites").getFullList({ sort: "-created_at", expand: "league" });

  return <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
    <Button asChild className="-ml-3 mb-5" size="sm" variant="ghost"><Link href="/user/dashboard"><ArrowLeft /> Back to dashboard</Link></Button>
    <div className="mb-8 animate-fade-up">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Link2 className="size-5" /></div>
      <h1 className="text-3xl font-bold tracking-tight">League invites</h1>
      <p className="mt-2 text-muted-foreground">Create a shareable invitation for an active league you commission.</p>
    </div>
    <div className="space-y-6">
      <Card className="settings-card animate-fade-up">
        <CardHeader className="border-b bg-muted/30"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 text-primary" /><div><CardTitle className="text-lg">Create an invitation</CardTitle><CardDescription className="mt-1">Set an optional expiration or usage limit to keep your league private.</CardDescription></div></div></CardHeader>
        <CardContent className="p-5 sm:p-6"><CreateInviteForm leagues={leagues} /></CardContent>
      </Card>
      <Card className="settings-card animate-fade-up">
        <CardHeader className="border-b bg-muted/30"><div className="flex items-start gap-3"><History className="mt-0.5 size-5 text-primary" /><div><CardTitle className="text-lg">Invitation history</CardTitle><CardDescription className="mt-1">Review usage, expiration, and revoke any active invitation.</CardDescription></div></div></CardHeader>
        <CardContent className="p-5 sm:p-6"><LeagueInviteList invites={invites.map((invite) => ({ id: invite.id, leagueName: invite.expand?.league?.name ?? invite.league, status: invite.status, createdAt: invite.created_at || undefined, expiresAt: invite.expires_at || undefined, maxUses: invite.max_uses, useCount: invite.use_count }))} /></CardContent>
      </Card>
    </div>
  </main>;
}
