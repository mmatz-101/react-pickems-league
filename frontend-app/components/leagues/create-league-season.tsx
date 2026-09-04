"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLeagueSeason } from "@/server/actions/leagues/create-season";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function CreateLeagueSeason({ league, nextYear }: { league: string; nextYear: number }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { execute, status } = useAction(createLeagueSeason, { onSuccess: ({ data }) => { setMessage(data?.success ?? ""); setError(data?.error ?? ""); } });
  return <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); execute({ league, year: Number(form.get("year")), name: String(form.get("name")), regularWin: Number(form.get("regularWin")), regularPush: Number(form.get("regularPush")), regularLoss: Number(form.get("regularLoss")), binnyWin: Number(form.get("binnyWin")), binnyPush: Number(form.get("binnyPush")), binnyLoss: Number(form.get("binnyLoss")) }); }}>
    <Input name="year" type="number" defaultValue={nextYear} min="2000" required />
    <Input name="name" defaultValue={`${nextYear} Season`} required />
    <Input name="regularWin" type="number" step="0.25" defaultValue="1.5" />
    <Input name="regularPush" type="number" step="0.25" defaultValue="0.75" />
    <Input name="regularLoss" type="number" step="0.25" defaultValue="0" />
    <Input name="binnyWin" type="number" step="0.25" defaultValue="1" />
    <Input name="binnyPush" type="number" step="0.25" defaultValue="0" />
    <Input name="binnyLoss" type="number" step="0.25" defaultValue="-1" />
    <Button className="sm:col-span-2" disabled={status === "executing"} type="submit">{status === "executing" ? "Creating…" : "Create season"}</Button>
    {message && <p className="text-sm text-green-600 sm:col-span-2">{message}</p>}
    {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
  </form>;
}
