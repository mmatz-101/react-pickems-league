"use client";

import { TeamGame } from "@/lib/team-records";
import { formatCentralTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History } from "lucide-react";

export default function TeamHistory({ teamName, games }: { teamName: string; games?: TeamGame[] }) {
  const history = games ?? [];
  const atsClass = (result: TeamGame["atsResult"]) => result === "W" ? "bg-emerald-100 text-emerald-800" : result === "L" ? "bg-red-100 text-red-800" : result === "P" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground";
  return <Dialog><DialogTrigger asChild><Button aria-label={`View ${teamName} previous games`} className="mt-1 size-6 p-0 text-muted-foreground hover:text-primary" onClick={(event) => event.stopPropagation()} size="icon" title="View previous games" variant="ghost"><History className="size-3.5" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{teamName} previous games</DialogTitle></DialogHeader>{history.length === 0 ? <p className="text-sm text-muted-foreground">No completed games found.</p> : <div className="max-h-[60vh] space-y-3 overflow-y-auto">{history.map((game) => <div className="rounded-lg border p-3" key={`${game.id}-${teamName}`}><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{formatCentralTime(game.date, { month: "short", day: "numeric" })} · {game.isHome ? "vs" : "@"} {game.opponent}</p><p className="text-xs font-semibold text-foreground">{game.result}</p></div><p className="mt-2 text-sm">{game.teamScore}–{game.opponentScore} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${atsClass(game.atsResult)}`}>ATS {game.atsResult}{game.atsResult !== "—" && ` (${game.spread > 0 ? "+" : ""}${game.spread})`}</span></p></div>)}</div>}</DialogContent></Dialog>;
}
