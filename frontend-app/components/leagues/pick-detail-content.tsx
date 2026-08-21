import { getPB } from "@/app/pocketbase";
import Navbar from "@/components/navbar/navbar";
import { getLeagueContext } from "@/lib/league-context";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PickDetailContent({
  id,
  leagueSlug,
}: {
  id: string;
  leagueSlug?: string;
}) {
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

  const backHref = league?.slug
    ? `/user/leagues/${league.slug}/picks`
    : "/user/picks";

  return (
    <>
      <Navbar leagueSlug={league?.slug} />
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Pick detail</p>
          <h1 className="text-2xl font-bold">{game.away_name} at {game.home_name}</h1>
          <p className="text-muted-foreground">Week {pick.week}</p>
        </div>
        <section className="rounded border p-4">
          <h2 className="font-semibold">Game information</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-sm text-muted-foreground">Date</dt><dd>{game.date}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Status</dt><dd>{game.status}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Sport</dt><dd>{game.sport ?? game.league}</dd></div>
            <div><dt className="text-sm text-muted-foreground">TV</dt><dd>{game.tv_station || "—"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Final score</dt><dd>{game.away_score} – {game.home_score}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Provider week</dt><dd>{game.provider_week ?? game.week}</dd></div>
          </dl>
        </section>
        <section className="rounded border p-4">
          <h2 className="font-semibold">Submitted pick</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-sm text-muted-foreground">Pick group</dt><dd>{pick.expand?.league_team?.name ?? "—"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Type</dt><dd>{pick.pick_type}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Selected</dt><dd>{pick.team_selected === "HOME" ? game.home_name : game.away_name}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Spread at submission</dt><dd>{pick.pick_spread}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Result</dt><dd>{pick.result_text || "Pending"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Points</dt><dd>{pick.result_points}</dd></div>
          </dl>
        </section>
        <Link className="inline-block text-sm underline" href={backHref}>Back to picks</Link>
      </main>
    </>
  );
}
