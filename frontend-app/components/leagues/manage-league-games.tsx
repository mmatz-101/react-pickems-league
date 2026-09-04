"use client";

import { Check, EyeOff, Gamepad2, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { overrideLeagueGame } from "@/server/actions/leagues/override-game";

type Game = { id: string; away_name: string; home_name: string; sport: string; date: string; status: string };

export default function ManageLeagueGames({ league, week, games, includedGameIds }: { league: string; week: string; games: Game[]; includedGameIds: string[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const included = new Set(includedGameIds);
  const [query, setQuery] = useState("");
  const filteredGames = games.filter((game) => `${game.away_name} ${game.home_name} ${game.sport}`.toLowerCase().includes(query.trim().toLowerCase()));
  const update = useAction(overrideLeagueGame, { onSuccess: ({ data }) => {
    if (data?.error) { toast({ title: "Unable to update game", description: data.error, variant: "destructive" }); return; }
    toast({ title: "League games updated", description: data?.success });
    router.refresh();
  } });
  const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));

  if (!games.length) return <div className="rounded-lg border border-dashed px-5 py-10 text-center"><Gamepad2 className="mx-auto mb-3 size-5 text-muted-foreground" /><p className="font-medium">No games are assigned to this week</p><p className="mt-1 text-sm text-muted-foreground">Games will appear here after the next provider sync.</p></div>;

  return <div className="space-y-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search teams or sport…" value={query} /></div><p className="text-sm text-muted-foreground">Showing {filteredGames.length} of {games.length} games</p><div className="overflow-hidden rounded-lg border"><div className="divide-y">{filteredGames.map((game) => {
    const isIncluded = included.has(game.id);
    return <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between" key={game.id}><div><div className="flex items-center gap-2"><span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold">{game.sport}</span><p className="font-medium">{game.away_name} <span className="text-muted-foreground">at</span> {game.home_name}</p></div><p className="mt-1 text-sm text-muted-foreground">{formatDate(game.date)} · {game.status}</p></div><Button disabled={update.status === "executing"} onClick={() => update.execute({ league, week, game: game.id, included: !isIncluded })} size="sm" variant={isIncluded ? "outline" : "default"}>{isIncluded ? <><EyeOff /> Exclude</> : <><Check /> Include</>}</Button></div>;
  })}{filteredGames.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">No games match your search.</div>}</div><div className="flex gap-2 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground"><RotateCcw className="mt-0.5 size-3.5 shrink-0" />Changes are saved as manual overrides and will not be overwritten by the next game sync.</div></div></div>;
}
