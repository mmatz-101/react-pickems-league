"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateLeagueWeek } from "@/server/actions/leagues/update-week";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

type ManageableWeek = {
  id: string;
  start_date: string;
  end_date: string;
  status: "SETUP" | "OPEN" | "LOCKED" | "COMPLETED";
  allow_picks: boolean;
  max_nfl_picks: number;
  max_ncaaf_picks: number;
  max_nfl_binny_picks: number;
  max_ncaaf_binny_picks: number;
  is_current: boolean;
};

export default function ManageLeagueWeek({ week }: { week: ManageableWeek }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { execute, status } = useAction(updateLeagueWeek, {
    onSuccess: ({ data }) => { setMessage(data?.success ?? ""); setError(data?.error ?? ""); },
    onError: () => setError("Unable to update week."),
  });
  return (
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      execute({
        week: week.id,
        status: String(form.get("status")) as "SETUP" | "OPEN" | "LOCKED" | "COMPLETED",
        allowPicks: form.get("allowPicks") === "on",
        startDate: new Date(String(form.get("startDate"))).toISOString(),
        endDate: new Date(String(form.get("endDate"))).toISOString(),
        maxNFLPicks: Number(form.get("maxNFLPicks")),
        maxNCAAFPicks: Number(form.get("maxNCAAFPicks")),
        maxNFLBinnyPicks: Number(form.get("maxNFLBinnyPicks")),
        maxNCAAFBinnyPicks: Number(form.get("maxNCAAFBinnyPicks")),
        isCurrent: form.get("isCurrent") === "on",
      });
    }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm font-medium">Start date/time
          <Input name="startDate" type="datetime-local" defaultValue={week.start_date?.slice(0, 16)} />
        </label>
        <label className="block space-y-1 text-sm font-medium">End date/time
          <Input name="endDate" type="datetime-local" defaultValue={week.end_date?.slice(0, 16)} />
        </label>
        <label className="block space-y-1 text-sm font-medium">Status
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" name="status" defaultValue={week.status}>
            <option value="SETUP">Setup</option><option value="OPEN">Open</option><option value="LOCKED">Locked</option><option value="COMPLETED">Completed</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end text-sm font-medium">
          <input className="h-4 w-4 accent-primary" name="allowPicks" type="checkbox" defaultChecked={week.allow_picks} /> Allow picks
        </label>
        <label className="block space-y-1 text-sm font-medium">NFL picks<Input name="maxNFLPicks" type="number" defaultValue={week.max_nfl_picks} min="0" /></label>
        <label className="block space-y-1 text-sm font-medium">NCAA picks<Input name="maxNCAAFPicks" type="number" defaultValue={week.max_ncaaf_picks} min="0" /></label>
        <label className="block space-y-1 text-sm font-medium">NFL Binny picks<Input name="maxNFLBinnyPicks" type="number" defaultValue={week.max_nfl_binny_picks} min="0" /></label>
        <label className="block space-y-1 text-sm font-medium">NCAA Binny picks<Input name="maxNCAAFBinnyPicks" type="number" defaultValue={week.max_ncaaf_binny_picks} min="0" /></label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium"><input className="h-4 w-4 accent-primary" name="isCurrent" type="checkbox" defaultChecked={week.is_current} /> Set as current week</label>
      <Button disabled={status === "executing"} type="submit">{status === "executing" ? "Saving…" : "Save week"}</Button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
