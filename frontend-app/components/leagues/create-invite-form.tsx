"use client";

import { createLeagueInvite } from "@/server/actions/leagues/create-invite";
import { Copy, Check } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function CreateInviteForm({
  leagues,
}: {
  leagues: { id: string; name: string }[];
}) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { execute, status } = useAction(createLeagueInvite, {
    onSuccess({ data }) {
      if (data?.error) {
        setError(data.error);
        setInviteUrl("");
        return;
      }
      setError("");
      setCopied(false);
      setInviteUrl(data?.invite?.url ?? "");
    },
    onError() {
      setError("Unable to create invite.");
      setInviteUrl("");
    },
  });

  if (leagues.length === 0) {
    return <p>You are not an active commissioner of any league.</p>;
  }

  return (
    <form
      className="space-y-4 rounded border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        execute({
          leagueId: String(form.get("leagueId")),
          maxUses: form.get("maxUses") ? Number(form.get("maxUses")) : undefined,
        });
      }}
    >
      <label className="block space-y-1">
        <span className="font-medium">League</span>
        <select className="w-full rounded border p-2" name="leagueId" required>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="font-medium">Maximum uses (optional)</span>
        <input
          className="w-full rounded border p-2"
          min="1"
          name="maxUses"
          placeholder="Unlimited"
          type="number"
        />
      </label>

      <button
        className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        disabled={status === "executing"}
        type="submit"
      >
        {status === "executing" ? "Creating…" : "Create invite"}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {inviteUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Copy this invite URL:</p>
          <div className="flex gap-2">
            <input className="min-w-0 flex-1 rounded border p-2" readOnly value={inviteUrl} />
            <button
              aria-label={copied ? "Invite URL copied" : "Copy invite URL"}
              className="rounded border p-2 hover:bg-muted"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteUrl);
                setCopied(true);
              }}
              type="button"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          {copied && <p className="text-sm text-green-600">Copied.</p>}
        </div>
      )}
    </form>
  );
}
