"use client";

import { Ban, CalendarClock, Copy, Link2, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { revokeLeagueInvite } from "@/server/actions/leagues/revoke-invite";

type Invite = { id: string; leagueName: string; status: "ACTIVE" | "REVOKED" | "EXPIRED"; createdAt?: string; expiresAt?: string; maxUses: number; useCount: number }; 

function formatDate(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function inviteState(invite: Invite) {
  if (invite.status === "REVOKED") return { label: "Revoked", className: "bg-muted text-muted-foreground" };
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() <= Date.now()) return { label: "Expired", className: "bg-amber-100 text-amber-800" };
  if (invite.maxUses > 0 && invite.useCount >= invite.maxUses) return { label: "Used up", className: "bg-amber-100 text-amber-800" };
  return { label: "Active", className: "bg-emerald-100 text-emerald-800" };
}

export default function LeagueInviteList({ invites }: { invites: Invite[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);
  const revoke = useAction(revokeLeagueInvite, { onSuccess: ({ data }) => {
    if (data?.error) { toast({ title: "Unable to revoke invite", description: data.error, variant: "destructive" }); return; }
    toast({ title: "Invite revoked", description: data?.success });
    setInviteToRevoke(null);
    router.refresh();
  } });

  if (!invites.length) return <div className="rounded-lg border border-dashed px-5 py-10 text-center"><Link2 className="mx-auto mb-3 size-5 text-muted-foreground" /><p className="font-medium">No invitations yet</p><p className="mt-1 text-sm text-muted-foreground">Create an invite above to let someone join your league.</p></div>;

  return <div className="overflow-hidden rounded-lg border"><div className="divide-y">{invites.map((invite) => {
    const state = inviteState(invite);
    const isActive = state.label === "Active";
    return <div className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between" key={invite.id}>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{invite.leagueName}</p><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${state.className}`}>{state.label}</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><Users className="size-3.5" />{invite.maxUses > 0 ? `${invite.useCount} of ${invite.maxUses} uses` : `${invite.useCount} uses · Unlimited`}</span><span className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />Created: {formatDate(invite.createdAt)}</span><span className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />Expires: {formatDate(invite.expiresAt)}</span></div></div>
      {isActive && <Button onClick={() => setInviteToRevoke(invite)} size="sm" variant="outline"><Ban /> Revoke</Button>}
    </div>;
  })}</div><div className="flex gap-2 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground"><Copy className="mt-0.5 size-3.5 shrink-0" />Invite links are intentionally shown only when created, so their secret tokens are never stored.</div>
    <Dialog open={Boolean(inviteToRevoke)} onOpenChange={(open) => !open && setInviteToRevoke(null)}>
      <DialogContent><DialogHeader><DialogTitle>Revoke this invitation?</DialogTitle><DialogDescription>People with this link will no longer be able to join {inviteToRevoke?.leagueName}. This cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button onClick={() => setInviteToRevoke(null)} type="button" variant="outline">Cancel</Button><Button disabled={revoke.status === "executing"} onClick={() => inviteToRevoke && revoke.execute({ invite: inviteToRevoke.id })} type="button" variant="destructive">{revoke.status === "executing" ? "Revoking…" : "Revoke invite"}</Button></DialogFooter></DialogContent>
    </Dialog>
  </div>;
}
