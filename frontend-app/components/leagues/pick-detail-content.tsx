import { getPB } from "@/app/pocketbase";
import Navbar from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeagueContext } from "@/lib/league-context";
import { formatCentralTime } from "@/lib/utils";
import { ArrowLeft, CalendarDays, CheckCircle2, CircleDotDashed, Radio, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const formatDate = (date: string) => formatCentralTime(date, {
  weekday: "long",
  month: "long",
});

const formatSpread = (spread: number) => `${spread > 0 ? "+" : ""}${spread}`;

export default async function PickDetailContent({ id, leagueSlug }: { id: string; leagueSlug?: string }) {
  const { pb: contextPB, league } = await getLeagueContext(leagueSlug);
  const pb = contextPB ?? (await getPB());
  let pick;
  try {
    pick = await pb.collection("picks").getOne(id, { expand: "game, league_team, week_record" });
  } catch {
    notFound();
  }
  const game = pick.expand?.game;
  if (!game) notFound();

  const backHref = league?.slug ? `/user/leagues/${league.slug}/picks` : "/user/picks";
  const selectedTeam = pick.team_selected === "HOME" ? game.home_name : game.away_name;
  const isComplete = ["FINAL", "FINAL OT", "COMPLETE"].includes(game.status);
  const resultStyle = pick.result_text === "WIN"
    ? "bg-emerald-100 text-emerald-800"
    : pick.result_text === "LOST"
      ? "bg-destructive/10 text-destructive"
      : pick.result_text === "PUSH"
        ? "bg-amber-100 text-amber-800"
        : "bg-muted text-muted-foreground";

  return (
    <>
      <Navbar leagueSlug={league?.slug} />
      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:py-10">
        <Button asChild className="-ml-3 mb-5" size="sm" variant="ghost">
          <Link href={backHref}><ArrowLeft /> Back to picks</Link>
        </Button>

        <Card className="settings-card animate-fade-up overflow-hidden">
          <CardHeader className="border-b bg-muted/30 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <CardDescription>{game.sport ?? game.league} · Week {pick.week}</CardDescription>
                <CardTitle className="mt-1 text-2xl sm:text-3xl">{game.away_name} <span className="font-normal text-muted-foreground">at</span> {game.home_name}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(game.date)}</CardDescription>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{game.status}</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <DetailItem icon={Radio} label="TV coverage" value={game.tv_station || "—"} />
            <DetailItem icon={CircleDotDashed} label="Venue" value={game.stadium || "—"} />
            <DetailItem icon={Trophy} label={isComplete ? "Final score" : "Current score"} value={`${game.away_score} – ${game.home_score}`} />
            <DetailItem icon={CalendarDays} label="Provider week" value={`Week ${game.provider_week ?? game.week}`} />
          </CardContent>
        </Card>

        <Card className="settings-card animate-fade-up mt-6">
          <CardHeader className="border-b bg-muted/30 p-5 sm:p-6">
            <CardDescription>Your group’s selection</CardDescription>
            <CardTitle className="mt-1 text-xl">{selectedTeam} <span className="font-normal text-muted-foreground">{formatSpread(pick.pick_spread)}</span></CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <DetailItem icon={CheckCircle2} label="Pick group" value={pick.expand?.league_team?.name ?? "—"} />
            <DetailItem icon={CheckCircle2} label="Pick type" value={pick.pick_type === "BINNY" ? "Binny" : "Regular"} />
            <DetailItem icon={CircleDotDashed} label="Spread at submission" value={formatSpread(pick.pick_spread)} />
            <div className="rounded-lg border bg-background p-3.5"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Result</p><div className="mt-1.5 flex items-center justify-between gap-3"><p className="font-semibold tabular-nums">{pick.result_text || "Pending"} · {pick.result_points} pts</p><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${resultStyle}`}>{pick.result_text || "Awaiting final"}</span></div></div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-5 py-4 sm:px-6"><p className="text-sm text-muted-foreground">The spread is locked at the moment this pick was submitted.</p></CardFooter>
        </Card>
      </main>
    </>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="rounded-lg border bg-background p-3.5"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"><Icon className="size-3.5" />{label}</div><p className="mt-1.5 font-semibold">{value}</p></div>;
}
