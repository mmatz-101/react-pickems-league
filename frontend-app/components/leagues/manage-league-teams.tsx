"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLeagueTeam, moveLeagueMember } from "@/server/actions/leagues/manage-teams";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ManageLeagueTeams({ league, members, teams, teamByMembership }: { league: string; members: { id: string; display_name: string; role: string; status: string }[]; teams: { id: string; name: string }[]; teamByMembership: Record<string, string> }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const create = useAction(createLeagueTeam, { onSuccess: ({ data }) => { setError(data?.error ?? ""); setMessage(data?.success ?? ""); if (data?.error) toast({ title: "Unable to create group", description: data.error, variant: "destructive" }); if (data?.success) toast({ title: "Group created", description: data.success }); } });
  const move = useAction(moveLeagueMember, { onSuccess: ({ data }) => { setError(data?.error ?? ""); setMessage(data?.success ?? ""); if (data?.error) toast({ title: "Unable to move member", description: data.error, variant: "destructive" }); if (data?.success) toast({ title: "Member moved", description: data.success }); } });

  return <div className="space-y-6">
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); create.execute({ league, name: String(form.get("groupName")) }); }}>
      <Input className="flex-1" name="groupName" placeholder="New pick group name" required />
      <Button disabled={create.status === "executing"} type="submit">{create.status === "executing" ? "Creating…" : "Create group"}</Button>
    </form>
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Member</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Pick group</th></tr></thead>
          <tbody className="divide-y">{members.map((member) => <tr className="transition-colors hover:bg-muted/30" key={member.id}><td className="px-4 py-3 font-medium">{member.display_name || "—"}</td><td className="px-4 py-3 text-muted-foreground">{member.role}</td><td className="px-4 py-3 text-muted-foreground">{member.status}</td><td className="px-4 py-2"><select aria-label={`Pick group for ${member.display_name || "member"}`} className="h-9 min-w-36 rounded-md border bg-background px-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring" defaultValue={teamByMembership[member.id]} onChange={(event) => move.execute({ membership: member.id, leagueTeam: event.target.value })}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></td></tr>)}</tbody>
        </table>
      </div>
    </div>
    {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}{error && <p className="text-sm font-medium text-destructive">{error}</p>}
  </div>;
}
