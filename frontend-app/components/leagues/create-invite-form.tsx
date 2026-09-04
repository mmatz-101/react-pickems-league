"use client";

import { createLeagueInvite } from "@/server/actions/leagues/create-invite";
import { Copy, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [expirationTime, setExpirationTime] = useState("23:59");
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
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        execute({
          leagueId: String(form.get("leagueId")),
          maxUses: form.get("maxUses") ? Number(form.get("maxUses")) : undefined,
          expiresAt: expirationDate
            ? new Date(`${expirationDate.toISOString().slice(0, 10)}T${expirationTime}:00`).toISOString()
            : undefined,
        });
      }}
    >
      <label className="block space-y-1">
        <span className="text-sm font-medium">League</span>
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring" name="leagueId" required>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Expiration <span className="font-normal text-muted-foreground">(optional)</span></span>
        <Calendar
          mode="single"
          selected={expirationDate}
          onSelect={setExpirationDate}
          disabled={{ before: new Date() }}
        />
        <Input
          aria-label="Expiration time"
          onChange={(event) => setExpirationTime(event.target.value)}
          type="time"
          value={expirationTime}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Maximum uses <span className="font-normal text-muted-foreground">(optional)</span></span>
        <Input
          min="1"
          name="maxUses"
          placeholder="Unlimited"
          type="number"
        />
      </label>

      <Button disabled={status === "executing"} type="submit">
        {status === "executing" ? "Creating…" : "Create invite"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {inviteUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Copy this invite URL:</p>
          <div className="flex gap-2">
            <Input className="min-w-0 flex-1" readOnly value={inviteUrl} />
            <Button
              aria-label={copied ? "Invite URL copied" : "Copy invite URL"}
              onClick={async () => { await navigator.clipboard.writeText(inviteUrl); setCopied(true); }}
              size="icon"
              type="button"
              variant="outline"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </div>
          {copied && <p className="text-sm text-green-600">Copied.</p>}
        </div>
      )}
    </form>
  );
}
