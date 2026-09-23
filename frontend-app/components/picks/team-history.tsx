"use client";

import { TeamGame } from "@/lib/team-records";
import { formatCentralTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TeamHistory({ teamName, games }: { teamName: string; games?: TeamGame[] }) {
  const history = games ?? [];
  return <Dialog><DialogTrigger asChild><Button className="h-auto px-0 text-xs" onClick={(event) => event.stopPropagation()} variant="link">View games</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{teamName} previous games</DialogTitle></DialogHeader>{history.length === 0 ? <p className="text-sm text-muted-foreground">No completed games found.</p> : <div className="max-h-[60vh] space-y-3 overflow-y-auto">{history.map((game) => <div className="rounded-lg border p-3" key={`${game.id}-${teamName}`}><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{formatCentralTime(game.date, { month: "short", day: "numeric" })} · {game.isHome ? "vs" : "@"} {game.opponent}</p><p className="font-semibold">{game.result}</p></div><p className="mt-1 text-sm">{game.teamScore}–{game.opponentScore} <span className="text-muted-foreground">· ATS {game.atsResult}{game.atsResult !== "—" && ` (${game.spread > 0 ? "+" : ""}${game.spread})`}</span></p></div>)}</div>}</DialogContent></Dialog>;
}
