"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activateLeagueSeason } from "@/server/actions/leagues/select-period";
import { useAction } from "next-safe-action/hooks";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function SelectLeaguePeriod({ seasons, activeSeason }: { seasons: { id: string; name: string; year: number; status: string }[]; activeSeason: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const seasonAction = useAction(activateLeagueSeason, { onSuccess: ({ data }) => { toast({ title: data?.error ? "Unable to activate season" : "Season activated", description: data?.error ?? data?.success, variant: data?.error ? "destructive" : "default" }); if (!data?.error) router.refresh(); } });
  return <label className="block max-w-md space-y-1 text-sm font-medium">Active season
    <Select value={activeSeason} onValueChange={(value) => seasonAction.execute({ id: value })}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{seasons.map((season) => <SelectItem key={season.id} value={season.id}>{season.name} ({season.year}) — {season.status}</SelectItem>)}</SelectContent>
    </Select>
    <span className="block pt-1 text-xs font-normal text-muted-foreground">Activating a season opens its first scheduled week. A locked week advances automatically after final results.</span>
  </label>;
}
