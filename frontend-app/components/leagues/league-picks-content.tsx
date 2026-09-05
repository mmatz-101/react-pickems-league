import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar/navbar";
import { getLeagueContext } from "@/lib/league-context";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { Target, Users } from "lucide-react";
import { formatCentralTime } from "@/lib/utils";

interface LeaguePickQuery extends pickType {
  expand: { game: gameType; league_team: { name: string } };
}

const formatSpread = (spread: number) => `${spread > 0 ? "+" : ""}${spread}`;

export default async function LeaguePicksContent({ leagueSlug }: { leagueSlug?: string }) {
  const { pb, league, week } = await getLeagueContext(leagueSlug);
  const picks: LeaguePickQuery[] = await pb.collection("picks").getFullList({
    filter: `week_record="${week.id}" && @now>game.date`,
    sort: "+game.date, league_team, -pick_type",
    expand: "game, league_team",
  });
  const picksByGame = new Map<string, LeaguePickQuery[]>();
  for (const pick of picks) picksByGame.set(pick.game, [...(picksByGame.get(pick.game) ?? []), pick]);
  const games = [...picksByGame.values()].sort((a, b) => new Date(a[0].expand.game.date).getTime() - new Date(b[0].expand.game.date).getTime());
  const formatDate = (date: string) => formatCentralTime(date, { weekday: "short" });

  return <><Navbar leagueSlug={league?.slug} /><main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8"><div className="animate-fade-up border-b pb-6"><p className="text-sm font-medium text-muted-foreground">{league?.name ?? "League"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Weekly picks</h1><p className="mt-2 text-sm text-muted-foreground">Week {week.number} · Picks are revealed after each game begins.</p></div>
    {games.length === 0 ? <div className="mt-6 rounded-xl border border-dashed py-14 text-center"><Users className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="font-medium">No picks revealed yet</p><p className="mt-1 text-sm text-muted-foreground">Picks appear here once their game has started.</p></div> : <div className="mt-6 space-y-5">{games.map((gamePicks) => { const game = gamePicks[0].expand.game; const homePicks = gamePicks.filter((pick) => pick.team_selected === "HOME"); const awayPicks = gamePicks.filter((pick) => pick.team_selected === "AWAY"); const isComplete = ["FINAL", "FINAL OT", "COMPLETE"].includes(game.status); return <Card className="settings-card animate-fade-up" key={game.id}><CardHeader className="border-b bg-muted/30 p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><CardDescription>{game.sport} · {formatDate(game.date)} · {isComplete ? `Final · ${game.away_score} – ${game.home_score}` : game.status}</CardDescription><CardTitle className="mt-1 text-xl">{game.away_name} <span className="font-normal text-muted-foreground">at</span> {game.home_name}</CardTitle></div><span className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary"><Users className="size-4" />{gamePicks.length} picks</span></div><div className="mt-4 rounded-lg border bg-background"><div className="border-b px-3 py-2"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latest Bet365 spread</p><p className="mt-0.5 text-xs text-muted-foreground">Pick lines below are locked when each group submits.</p></div><div className="grid grid-cols-2 text-center text-sm"><div className="border-r px-3 py-2.5"><p className="font-semibold">{awayPicks.length} on {game.away_name}</p><p className="mt-0.5 font-medium tabular-nums text-muted-foreground">{formatSpread(game.away_spread)}</p></div><div className="px-3 py-2.5"><p className="font-semibold">{homePicks.length} on {game.home_name}</p><p className="mt-0.5 font-medium tabular-nums text-muted-foreground">{formatSpread(game.home_spread)}</p></div></div></div></CardHeader><CardContent className="grid gap-3 p-5 sm:grid-cols-2">{gamePicks.map((pick) => { const isHome = pick.team_selected === "HOME"; const team = isHome ? game.home_name : game.away_name; return <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${isComplete && pick.result_text === "WIN" ? "border-emerald-200 bg-emerald-50" : isComplete && pick.result_text === "LOST" ? "border-destructive/20 bg-destructive/5" : isComplete && pick.result_text === "PUSH" ? "border-amber-200 bg-amber-50" : isHome ? "border-primary/20 bg-primary/5" : "bg-muted/20"}`} key={pick.id}><div className="min-w-0"><p className="truncate font-medium">{pick.expand.league_team.name}</p><p className="mt-0.5 text-sm text-muted-foreground">{pick.pick_type === "BINNY" ? "Binny" : "Regular"} · {team}{isComplete && pick.result_text ? ` · ${pick.result_text}` : ""}</p></div><div className="flex shrink-0 items-center gap-1.5"><Target className="size-4 text-muted-foreground" /><div className="text-right"><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pick line</p><p className="font-semibold tabular-nums">{formatSpread(pick.pick_spread)}</p></div></div></div>; })}</CardContent></Card>; })}</div>}
  </main></>;
}
