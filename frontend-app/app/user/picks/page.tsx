import GameCard, { gameTypeExpanded } from "@/components/picks/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import { getLeagueContext } from "@/lib/league-context";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import Navbar from "@/components/navbar/navbar";
import { CheckCircle2, Clock3, LockKeyhole, Target } from "lucide-react";

function PickProgress({ label, used, limit }: { label: string; used: number; limit: number }) {
  return <Card className="border-primary/10 shadow-sm"><CardContent className="p-4"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p><div className="mt-2 flex items-end justify-between gap-4"><p className="text-2xl font-bold tabular-nums">{used}<span className="text-base font-medium text-muted-foreground"> / {limit}</span></p><span className={used >= limit ? "text-emerald-600" : "text-muted-foreground"}>{used >= limit ? <CheckCircle2 className="size-5" /> : <Target className="size-5" />}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${limit ? Math.min((used / limit) * 100, 100) : 0}%` }} /></div></CardContent></Card>;
}

export async function PicksPageContent({ leagueSlug }: { leagueSlug?: string }) {
  const { pb, league, week, leagueTeam } = await getLeagueContext(leagueSlug);
  const leagueGames = await pb.collection("league_games").getFullList({ filter: `week="${week.id}" && league="${league.id}" && included=true` });
  const leagueGameByGame = new Map(leagueGames.map((item) => [item.game, item.id]));
  const gamesNFLDataAll: gameTypeExpanded[] = await pb.collection("games").getFullList({ filter: `week_record="${week.id}" && sport="NFL" && status!="FINAL" && status!="FINAL OT"`, expand: "home_team,away_team", sort: "date" });
  const gamesNCAAFDataAll: gameTypeExpanded[] = await pb.collection("games").getFullList({ filter: `week_record="${week.id}" && sport="NCAAF" && status!="FINAL" && status!="FINAL OT"`, expand: "home_team,away_team", sort: "date" });
  const gamesNFLData = gamesNFLDataAll.filter((game) => leagueGameByGame.has(game.id));
  const gamesNCAAFData = gamesNCAAFDataAll.filter((game) => leagueGameByGame.has(game.id));
  const currentPicks: pickType[] = await pb.collection("picks").getFullList({ filter: `week_record="${week.id}" && league_team="${leagueTeam.id}" && league_game != ''` });
  const nflGameIds = new Set(gamesNFLData.map((game) => game.id));
  const ncaafGameIds = new Set(gamesNCAAFData.map((game) => game.id));
  const countPicks = (games: Set<string>, type: "REGULAR" | "BINNY") => currentPicks.filter((pick) => games.has(pick.game) && pick.pick_type === type).length;
  const isLocked = !week.allow_picks || week.status !== "OPEN";
  const hasNFL = week.max_nfl_picks > 0 || week.max_nfl_binny_picks > 0;
  const hasNCAAF = week.max_ncaaf_picks > 0 || week.max_ncaaf_binny_picks > 0;
  const defaultTab = hasNFL ? "NFL" : "NCAAF";

  const gameGrid = (games: gameTypeExpanded[], sport: "NFL" | "NCAA") => games.length ? <div className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-3">{games.map((game) => <GameCard disabled={isLocked} game={game} key={game.id} leagueTeam={leagueTeam.id} leagueGame={leagueGameByGame.get(game.id) ?? ""} pick={currentPicks.find((pick) => pick.game === game.id)} weekRecord={week.id} />)}</div> : <div className="rounded-xl border border-dashed py-14 text-center"><Target className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="font-medium">No {sport} games are available</p><p className="mt-1 text-sm text-muted-foreground">Check back when games are added to this league week.</p></div>;

  return <><Navbar leagueSlug={leagueSlug} /><main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><div className="animate-fade-up flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-muted-foreground">{league?.name ?? "League"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Week {week.number} picks</h1></div><div className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${isLocked ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{isLocked ? <LockKeyhole className="size-4" /> : <Clock3 className="size-4" />}{isLocked ? "Picks are locked" : "Picks are open"}</div></div>
    <section className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><PickProgress label="NFL regular" used={countPicks(nflGameIds, "REGULAR")} limit={week.max_nfl_picks} /><PickProgress label="NFL Binny" used={countPicks(nflGameIds, "BINNY")} limit={week.max_nfl_binny_picks} /><PickProgress label="NCAA regular" used={countPicks(ncaafGameIds, "REGULAR")} limit={week.max_ncaaf_picks} /><PickProgress label="NCAA Binny" used={countPicks(ncaafGameIds, "BINNY")} limit={week.max_ncaaf_binny_picks} /></section>
    {isLocked && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This week is currently locked. Your submitted picks remain visible below.</div>}
    <Tabs defaultValue={defaultTab}><TabsList className={`grid w-full max-w-md ${hasNFL && hasNCAAF ? "grid-cols-2" : "grid-cols-1"}`}>{hasNFL && <TabsTrigger value="NFL">NFL <span className="ml-1 text-muted-foreground">({gamesNFLData.length})</span></TabsTrigger>}{hasNCAAF && <TabsTrigger value="NCAAF">NCAA <span className="ml-1 text-muted-foreground">({gamesNCAAFData.length})</span></TabsTrigger>}</TabsList>{hasNFL && <TabsContent value="NFL">{gameGrid(gamesNFLData, "NFL")}</TabsContent>}{hasNCAAF && <TabsContent value="NCAAF">{gameGrid(gamesNCAAFData, "NCAA")}</TabsContent>}</Tabs>
  </main><Toaster /></>;
}

export default function PicksPage() { return <PicksPageContent />; }
