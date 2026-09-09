"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateLeagueWeek } from "@/server/actions/leagues/update-week";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ManageableWeek = {
  id: string;
  start_date: string;
  end_date: string;
  status: "SETUP" | "OPEN" | "LOCKED" | "COMPLETED";
  max_nfl_picks: number;
  max_ncaaf_picks: number;
  max_nfl_binny_picks: number;
  max_ncaaf_binny_picks: number;
};

const lifecycleCopy = {
  SETUP: "Scheduled — it will open automatically after the current week is complete.",
  OPEN: "Open for picks — members can submit picks until each game starts.",
  LOCKED: "Scoring in progress — picks are no longer available.",
  COMPLETED: "Complete — all included games have final results.",
};

export default function ManageLeagueWeek({ week }: { week: ManageableWeek }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { execute, status } = useAction(updateLeagueWeek, {
    onSuccess: ({ data }) => { setMessage(data?.success ?? ""); setError(data?.error ?? ""); if (!data?.error) router.refresh(); },
    onError: () => setError("Unable to update week."),
  });

  return (
    <form className="space-y-5" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      execute({
        week: week.id,
        startDate: new Date(String(form.get("startDate"))).toISOString(),
        endDate: new Date(String(form.get("endDate"))).toISOString(),
        maxNFLPicks: Number(form.get("maxNFLPicks")),
        maxNCAAFPicks: Number(form.get("maxNCAAFPicks")),
        maxNFLBinnyPicks: Number(form.get("maxNFLBinnyPicks")),
        maxNCAAFBinnyPicks: Number(form.get("maxNCAAFBinnyPicks")),
      });
    }}>
      <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-semibold">{week.status === "SETUP" ? "Scheduled" : week.status === "OPEN" ? "Picks open" : week.status === "LOCKED" ? "Locked" : "Complete"}</p>
        <p className="mt-1 text-muted-foreground">{lifecycleCopy[week.status]}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm font-medium">Start date/time<Input name="startDate" type="datetime-local" defaultValue={week.start_date?.slice(0, 16)} required /></label>
        <label className="block space-y-1 text-sm font-medium">End date/time<Input name="endDate" type="datetime-local" defaultValue={week.end_date?.slice(0, 16)} required /></label>
        <label className="block space-y-1 text-sm font-medium">NFL picks<Input name="maxNFLPicks" type="number" defaultValue={week.max_nfl_picks} min="0" /></label>
        <label className="block space-y-1 text-sm font-medium">NCAA picks<Input name="maxNCAAFPicks" type="number" defaultValue={week.max_ncaaf_picks} min="0" /></label>
        <label className="block space-y-1 text-sm font-medium">NFL Binny picks<Input name="maxNFLBinnyPicks" type="number" defaultValue={week.max_nfl_binny_picks} min="0" /></label>
        <label className="block space-y-1 text-sm font-medium">NCAA Binny picks<Input name="maxNCAAFBinnyPicks" type="number" defaultValue={week.max_ncaaf_binny_picks} min="0" /></label>
      </div>
      <p className="text-sm text-muted-foreground">Lock this slate after picks are final. Once every included game has a final result, the next scheduled week opens automatically.</p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={status === "executing"} type="submit">{status === "executing" ? "Saving…" : "Save schedule"}</Button>
        {week.status === "OPEN" && <Button disabled={status === "executing"} onClick={() => execute({ week: week.id, status: "LOCKED" })} type="button" variant="outline">Lock this week</Button>}
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
