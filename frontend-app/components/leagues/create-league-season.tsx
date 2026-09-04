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
  const field = (name: string, label: string, defaultValue: string | number) => <label className="space-y-2"><span className="text-sm font-medium">{label}</span><Input name={name} type="number" step="0.25" defaultValue={defaultValue} /></label>;

  return <form className="mt-5 space-y-6" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); execute({ league, year: Number(form.get("year")), name: String(form.get("name")), regularWin: Number(form.get("regularWin")), regularPush: Number(form.get("regularPush")), regularLoss: Number(form.get("regularLoss")), binnyWin: Number(form.get("binnyWin")), binnyPush: Number(form.get("binnyPush")), binnyLoss: Number(form.get("binnyLoss")) }); }}>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">Season year</span><Input name="year" type="number" defaultValue={nextYear} min="2000" required /></label><label className="space-y-2"><span className="text-sm font-medium">Season name</span><Input name="name" defaultValue={`${nextYear} Season`} required /></label></div>
    <fieldset className="rounded-lg border bg-muted/20 p-4"><legend className="px-1 text-sm font-semibold">Regular pick scoring</legend><p className="mb-4 text-sm text-muted-foreground">Points awarded for a regular pick result.</p><div className="grid gap-4 sm:grid-cols-3">{field("regularWin", "Win points", "1.5")}{field("regularPush", "Push points", "0.75")}{field("regularLoss", "Loss points", "0")}</div></fieldset>
    <fieldset className="rounded-lg border bg-muted/20 p-4"><legend className="px-1 text-sm font-semibold">Binny pick scoring</legend><p className="mb-4 text-sm text-muted-foreground">Points awarded for a Binny pick result.</p><div className="grid gap-4 sm:grid-cols-3">{field("binnyWin", "Win points", "1")}{field("binnyPush", "Push points", "0")}{field("binnyLoss", "Loss points", "-1")}</div></fieldset>
    <div className="flex items-center gap-3"><Button disabled={status === "executing"} type="submit">{status === "executing" ? "Creating…" : "Create season"}</Button>{message && <p className="text-sm font-medium text-emerald-600">{message}</p>}{error && <p className="text-sm font-medium text-destructive">{error}</p>}</div>
  </form>;
}
