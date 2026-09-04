"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateLeagueProfile } from "@/server/actions/leagues/update-profile";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function UpdateProfileForm({ membership, leagueTeam, defaultDisplayName, defaultTeamName }: { membership: string; leagueTeam: string; defaultDisplayName: string; defaultTeamName: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { execute, status } = useAction(updateLeagueProfile, {
    onSuccess({ data }) { setError(data?.error ?? ""); setMessage(data?.success ?? ""); },
    onError: () => setError("Unable to update league profile."),
  });

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      execute({ membership, leagueTeam, displayName: String(form.get("displayName")), teamName: String(form.get("teamName")) });
    }}>
      <label className="space-y-2"><span className="text-sm font-medium">Your display name</span><Input name="displayName" defaultValue={defaultDisplayName} required /></label>
      <label className="space-y-2"><span className="text-sm font-medium">Your pick group name</span><Input name="teamName" defaultValue={defaultTeamName} required /></label>
      <div className="flex items-center gap-3 sm:col-span-2"><Button disabled={status === "executing"} type="submit">{status === "executing" ? "Saving…" : "Save changes"}</Button>{message && <p className="text-sm font-medium text-emerald-600">{message}</p>}{error && <p className="text-sm font-medium text-destructive">{error}</p>}</div>
    </form>
  );
}
