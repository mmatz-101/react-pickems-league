"use client";

import { requestLeague } from "@/server/actions/leagues/request-league";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function RequestLeagueForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { execute, status } = useAction(requestLeague, {
    onSuccess: ({ data }) => {
      setMessage(data?.success ?? "");
      setError(data?.error ?? "");
    },
    onError: () => setError("Unable to submit league request."),
  });

  return (
    <form className="space-y-4 rounded border p-4" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      execute({
        requestedName: String(form.get("requestedName")),
        description: String(form.get("description") ?? ""),
      });
    }}>
      <label className="block space-y-1">
        <span className="text-sm font-medium">League name</span>
        <Input name="requestedName" placeholder="Office Pickems" required />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea className="min-h-28 w-full rounded border p-2" name="description" placeholder="Tell us about your league." />
      </label>
      <Button disabled={status === "executing"} type="submit">
        {status === "executing" ? "Submitting…" : "Request league"}
      </Button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
