"use client";

import { updateLeagueProfile } from "@/server/actions/leagues/update-profile";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function UpdateProfileForm({
  membership,
  leagueTeam,
  defaultDisplayName,
  defaultTeamName,
}: {
  membership: string;
  leagueTeam: string;
  defaultDisplayName: string;
  defaultTeamName: string;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { execute, status } = useAction(updateLeagueProfile, {
    onSuccess({ data }) {
      setError(data?.error ?? "");
      setMessage(data?.success ?? "");
    },
    onError: () => setError("Unable to update league profile."),
  });

  return (
    <form className="mt-4 space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      execute({
        membership,
        leagueTeam,
        displayName: String(form.get("displayName")),
        teamName: String(form.get("teamName")),
      });
    }}>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Your display name</span>
        <input className="w-full rounded border p-2" name="displayName" defaultValue={defaultDisplayName} required />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Your pick group name</span>
        <input className="w-full rounded border p-2" name="teamName" defaultValue={defaultTeamName} required />
      </label>
      <button className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={status === "executing"} type="submit">
        {status === "executing" ? "Saving…" : "Save changes"}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
