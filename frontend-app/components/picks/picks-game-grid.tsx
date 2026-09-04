"use client";

import { useState } from "react";
import { Search, Target } from "lucide-react";
import GameCard, { gameTypeExpanded } from "@/components/picks/game-card";
import { Input } from "@/components/ui/input";
import { pickType } from "@/server/actions/picks/helpers/pick-data";

export default function PicksGameGrid({ games, leagueGameByGame, leagueTeam, picks, sport, weekRecord, disabled }: { games: gameTypeExpanded[]; leagueGameByGame: Record<string, string>; leagueTeam: string; picks: pickType[]; sport: "NFL" | "NCAA"; weekRecord: string; disabled: boolean }) {
  const [query, setQuery] = useState("");
  const filteredGames = games.filter((game) => `${game.away_name} ${game.home_name}`.toLowerCase().includes(query.trim().toLowerCase()));

  if (!games.length) return <div className="rounded-xl border border-dashed py-14 text-center"><Target className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="font-medium">No {sport} games are available</p><p className="mt-1 text-sm text-muted-foreground">Check back when games are added to this league week.</p></div>;
  return <div className="py-5"><div className="relative mb-3 max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${sport} teams…`} value={query} /></div><p className="mb-4 text-sm text-muted-foreground">Showing {filteredGames.length} of {games.length} games</p><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredGames.map((game) => <GameCard disabled={disabled} game={game} key={game.id} leagueTeam={leagueTeam} leagueGame={leagueGameByGame[game.id] ?? ""} pick={picks.find((pick) => pick.game === game.id)} weekRecord={weekRecord} />)}</div>{filteredGames.length === 0 && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No games match your search.</div>}</div>;
}
