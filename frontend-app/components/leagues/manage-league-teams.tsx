"use client";

import { createLeagueTeam, moveLeagueMember } from "@/server/actions/leagues/manage-teams";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ManageLeagueTeams({
  league,
  members,
  teams,
  teamByMembership,
}: {
  league: string;
  members: { id: string; display_name: string; role: string; status: string }[];
  teams: { id: string; name: string }[];
  teamByMembership: Record<string, string>;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const create = useAction(createLeagueTeam, {
    onSuccess: ({ data }) => {
      setError(data?.error ?? "");
      setMessage(data?.success ?? "");
      if (data?.error) toast({ title: "Unable to create group", description: data.error, variant: "destructive" });
      if (data?.success) toast({ title: "Group created", description: data.success });
    },
  });
  const move = useAction(moveLeagueMember, {
    onSuccess: ({ data }) => {
      setError(data?.error ?? "");
      setMessage(data?.success ?? "");
      if (data?.error) toast({ title: "Unable to move member", description: data.error, variant: "destructive" });
      if (data?.success) toast({ title: "Member moved", description: data.success });
    },
  });

  return (
    <div className="space-y-6">
      <form className="flex w-full flex-wrap gap-2" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        create.execute({ league, name: String(form.get("groupName")) });
      }}>
        <input className="min-w-0 flex-1 rounded border p-2" name="groupName" placeholder="New group name" required />
        <button className="rounded bg-primary px-4 py-2 text-primary-foreground" disabled={create.status === "executing"} type="submit">
          Create group
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b"><th className="py-2 pr-4">Member</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Status</th><th className="py-2">Pick group</th></tr></thead>
          <tbody>
            {members.map((member) => (
              <tr className="border-b last:border-0" key={member.id}>
                <td className="py-2 pr-4">{member.display_name || "—"}</td>
                <td className="py-2 pr-4">{member.role}</td>
                <td className="py-2 pr-4">{member.status}</td>
                <td className="py-2">
                  <select
                    className="rounded border p-1"
                    defaultValue={teamByMembership[member.id]}
                    onChange={(event) => move.execute({ membership: member.id, leagueTeam: event.target.value })}
                  >
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
