import { ResultDataTable } from "@/app/user/results/result-data-table";
import { resultColumns } from "@/app/user/results/result-columns";
import Navbar from "@/components/navbar/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeagueContext } from "@/lib/league-context";
import { getLeagueStandings, getLeagueWeeklyProgress } from "@/lib/league-standings";
import MobileStandings from "@/components/results/mobile-standings";
import { Medal, Target, Trophy } from "lucide-react";

const podiumStyles = ["border-amber-300 bg-amber-50", "border-slate-300 bg-slate-50", "border-orange-300 bg-orange-50"];
const podiumIcons = ["text-amber-500", "text-slate-500", "text-orange-600"];

export default async function ResultsPageContent({ leagueSlug }: { leagueSlug?: string }) {
  const { season, league, leagueTeam } = await getLeagueContext(leagueSlug);
  const [resultData, weeklyProgress] = await Promise.all([getLeagueStandings(season.id), getLeagueWeeklyProgress(season.id)]);
  const leaders = resultData.slice(0, 3);
  const yourStanding = resultData.find((standing) => standing.team_name === leagueTeam.name);
  const latestWeek = weeklyProgress.at(-1);
  const previousWeek = weeklyProgress.at(-2);
  const rankAt = (team: string, snapshot?: Record<string, string | number>) => snapshot ? Object.entries(snapshot).filter(([key]) => key !== "week").sort(([, a], [, b]) => Number(b) - Number(a)).findIndex(([key]) => key === team) + 1 : 0;
  const rankChange = yourStanding && latestWeek && previousWeek ? rankAt(yourStanding.team_name, previousWeek) - rankAt(yourStanding.team_name, latestWeek) : 0;
  const weeklyLeader = latestWeek && previousWeek ? resultData.map((standing) => ({ name: standing.team_name, points: Number(latestWeek[standing.team_name] ?? 0) - Number(previousWeek[standing.team_name] ?? 0) })).sort((a, b) => b.points - a.points)[0] : undefined;

  return <><Navbar leagueSlug={league?.slug} /><main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><div className="animate-fade-up flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-muted-foreground">{league?.name ?? "League"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Season standings</h1><p className="mt-2 text-sm text-muted-foreground">{season.name} · Rankings update as game results are finalized.</p></div>{yourStanding && <div className="rounded-xl border bg-card px-4 py-3 shadow-sm"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your pick group</p><p className="mt-1 font-semibold">#{yourStanding.rank} <span className="font-normal text-muted-foreground">of {resultData.length}</span> · {yourStanding.result_points} pts</p></div>}</div>
    {leaders.length > 0 ? <section className="my-6 grid gap-3 md:grid-cols-3">{leaders.map((standing, index) => <Card className={`animate-fade-up border ${podiumStyles[index]}`} key={standing.team_name}><CardContent className="flex items-center gap-4 p-5"><Medal className={`size-8 shrink-0 ${podiumIcons[index]}`} /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{standing.rank} overall</p><p className="truncate text-lg font-bold">{standing.team_name}</p><p className="mt-1 text-sm text-muted-foreground">{standing.result_points} points · {standing.win_percentage}% wins</p></div></CardContent></Card>)}</section> : <div className="my-6 rounded-xl border border-dashed py-14 text-center"><Trophy className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="font-medium">No standings yet</p><p className="mt-1 text-sm text-muted-foreground">Standings will appear after league members submit picks.</p></div>}
    <section className="mb-6 grid gap-3 sm:grid-cols-2"><Card className="settings-card"><CardContent className="p-4"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your weekly movement</p><p className="mt-2 text-xl font-bold">{rankChange > 0 ? `↑ ${rankChange} place${rankChange === 1 ? "" : "s"}` : rankChange < 0 ? `↓ ${Math.abs(rankChange)} place${rankChange === -1 ? "" : "s"}` : "No rank change"}</p></CardContent></Card><Card className="settings-card"><CardContent className="p-4"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">This week’s leader</p><p className="mt-2 truncate text-xl font-bold">{weeklyLeader ? `${weeklyLeader.name} · ${weeklyLeader.points} pts` : "Complete another week to compare"}</p></CardContent></Card></section>
    <Card className="settings-card animate-fade-up"><CardHeader className="border-b bg-muted/30"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Target className="size-4" /></span><div><CardTitle className="text-lg">Full leaderboard</CardTitle><CardDescription className="mt-1">Select a column heading to change the ranking order.</CardDescription></div></div></CardHeader><CardContent className="p-4 md:hidden"><MobileStandings standings={resultData} yourTeam={leagueTeam.name} /></CardContent><CardContent className="hidden p-0 md:block"><ResultDataTable columns={resultColumns} data={resultData} /></CardContent></Card>
  </main></>;
}
