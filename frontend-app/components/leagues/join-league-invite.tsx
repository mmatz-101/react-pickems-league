"use client";

import { acceptLeagueInvite } from "@/server/actions/leagues/accept-invite";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinLeagueInvite({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const { execute, status } = useAction(acceptLeagueInvite, {
    onSuccess({ data }) {
      if (data?.error) {
        setError(data.error);
        return;
      }
      if (data?.leagueId) {
        router.push(`/user/dashboard?league=${data.leagueId}`);
      }
    },
    onError() {
      setError("Unable to accept invite.");
    },
  });

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Join league</h1>
        <p className="text-muted-foreground">
          You have been invited to join a Pickems league.
        </p>
      </div>

      <button
        className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        disabled={status === "executing"}
        onClick={() => {
          setError("");
          execute({ token });
        }}
        type="button"
      >
        {status === "executing" ? "Joining…" : "Accept invite"}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </main>
  );
}
