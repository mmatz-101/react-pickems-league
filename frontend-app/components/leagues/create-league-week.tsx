"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLeagueWeek } from "@/server/actions/leagues/create-week";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function CreateLeagueWeek({ season, nextNumber }: { season: string; nextNumber: number }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { execute, status } = useAction(createLeagueWeek, { onSuccess: ({ data }) => { setMessage(data?.success ?? ""); setError(data?.error ?? ""); } });
  return <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); execute({ season, number: Number(form.get("number")), name: String(form.get("name")), startDate: new Date(String(form.get("startDate"))).toISOString(), endDate: new Date(String(form.get("endDate"))).toISOString() }); }}>
    <Input name="number" type="number" min="1" defaultValue={nextNumber} placeholder="Week number" required />
    <Input name="name" defaultValue={`Week ${nextNumber}`} placeholder="Week name" required />
    <Input name="startDate" type="datetime-local" required />
    <Input name="endDate" type="datetime-local" required />
    <Button className="sm:col-span-2" disabled={status === "executing"} type="submit">{status === "executing" ? "Creating…" : "Create week"}</Button>
    {message && <p className="text-sm text-green-600 sm:col-span-2">{message}</p>}
    {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
  </form>;
}
