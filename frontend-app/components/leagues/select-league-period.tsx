"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activateLeagueSeason, setCurrentLeagueWeek } from "@/server/actions/leagues/select-period";
import { useAction } from "next-safe-action/hooks";
import { useToast } from "@/components/ui/use-toast";

export default function SelectLeaguePeriod({ seasons, weeks, activeSeason, currentWeek }: { seasons: { id: string; name: string; year: number; status: string }[]; weeks: { id: string; name: string; number: number; is_current: boolean }[]; activeSeason: string; currentWeek: string }) {
  const { toast } = useToast();
  const seasonAction = useAction(activateLeagueSeason, { onSuccess: ({ data }) => toast({ title: data?.error ? "Unable to activate season" : "Season activated", description: data?.error ?? data?.success, variant: data?.error ? "destructive" : "default" }) });
  const weekAction = useAction(setCurrentLeagueWeek, { onSuccess: ({ data }) => toast({ title: data?.error ? "Unable to set week" : "Current week updated", description: data?.error ?? data?.success, variant: data?.error ? "destructive" : "default" }) });
  return <div className="grid gap-4 sm:grid-cols-2">
    <label className="space-y-1 text-sm font-medium">Active season
      <Select value={activeSeason} onValueChange={(value) => seasonAction.execute({ id: value })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{seasons.map((season) => <SelectItem key={season.id} value={season.id}>{season.name} ({season.year}) — {season.status}</SelectItem>)}</SelectContent>
      </Select>
    </label>
    <label className="space-y-1 text-sm font-medium">Current week
      <Select value={currentWeek} onValueChange={(value) => weekAction.execute({ id: value })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{weeks.map((week) => <SelectItem key={week.id} value={week.id}>{week.name} {week.is_current ? "— Current" : ""}</SelectItem>)}</SelectContent>
      </Select>
    </label>
  </div>;
}
