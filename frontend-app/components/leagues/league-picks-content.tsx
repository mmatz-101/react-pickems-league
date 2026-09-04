import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar/navbar";
import { getLeagueContext } from "@/lib/league-context";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { CheckCircle2, Users } from "lucide-react";

interface LeaguePickQuery extends pickType {
  expand: { game: gameType; league_team: { name: string } };
}

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
  const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));

  return <><Navbar leagueSlug={league?.slug} /><main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8"><div className="animate-fade-up border-b pb-6"><p className="text-sm font-medium text-muted-foreground">{league?.name ?? "League"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Weekly picks</h1><p className="mt-2 text-sm text-muted-foreground">Week {week.number} · Picks are revealed after each game begins.</p></div>
    {games.length === 0 ? <div className="mt-6 rounded-xl border border-dashed py-14 text-center"><Users className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="font-medium">No picks revealed yet</p><p className="mt-1 text-sm text-muted-foreground">Picks appear here once their game has started.</p></div> : <div className="mt-6 space-y-5">{games.map((gamePicks) => { const game = gamePicks[0].expand.game; const homePicks = gamePicks.filter((pick) => pick.team_selected === "HOME"); const awayPicks = gamePicks.filter((pick) => pick.team_selected === "AWAY"); return <Card className="settings-card animate-fade-up" key={game.id}><CardHeader className="border-b bg-muted/30 p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><CardDescription>{game.sport} · {formatDate(game.date)} · {game.status}</CardDescription><CardTitle className="mt-1 text-xl">{game.away_name} <span className="font-normal text-muted-foreground">at</span> {game.home_name}</CardTitle></div><span className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary"><Users className="size-4" />{gamePicks.length} picks</span></div><div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border text-center text-sm"><div className="border-r bg-background px-3 py-2"><p className="font-semibold">{awayPicks.length} on {game.away_name}</p><p className="mt-0.5 text-muted-foreground">{game.away_spread > 0 ? "+" : ""}{game.away_spread}</p></div><div className="bg-background px-3 py-2"><p className="font-semibold">{homePicks.length} on {game.home_name}</p><p className="mt-0.5 text-muted-foreground">{game.home_spread > 0 ? "+" : ""}{game.home_spread}</p></div></div></CardHeader><CardContent className="grid gap-3 p-5 sm:grid-cols-2">{gamePicks.map((pick) => { const isHome = pick.team_selected === "HOME"; const team = isHome ? game.home_name : game.away_name; return <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${isHome ? "border-primary/20 bg-primary/5" : "bg-muted/20"}`} key={pick.id}><div className="min-w-0"><p className="truncate font-medium">{pick.expand.league_team.name}</p><p className="mt-0.5 text-sm text-muted-foreground">{pick.pick_type === "BINNY" ? "Binny" : "Regular"} · {team}</p></div><span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums"><CheckCircle2 className="size-4 text-primary" />{pick.pick_spread > 0 ? "+" : ""}{pick.pick_spread}</span></div>; })}</CardContent></Card>; })}</div>}
  </main></>;
}
