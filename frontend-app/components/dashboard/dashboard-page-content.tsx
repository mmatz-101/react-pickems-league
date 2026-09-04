import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import {
  pickType,
} from "@/server/actions/picks/helpers/pick-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import { getLeagueContext } from "@/lib/league-context";
import Navbar from "@/components/navbar/navbar";
import LeaguePageHeader from "@/components/leagues/league-page-header";

interface pickTypeQuery extends pickType {
  expand: { game: gameType };
}

export default async function DashboardPageContent({
  leagueSlug,
}: {
  leagueSlug?: string;
}) {
  const { pb, league, memberships, season, week, leagueTeam } = await getLeagueContext(leagueSlug);
  const userTeam = { id: leagueTeam.id, team_name: leagueTeam.name };

  const picks: pickTypeQuery[] = await pb.collection("picks").getFullList({
    filter: `league_team="${leagueTeam.id}"`,
    sort: "-pick_type, +game.date",
    expand: "game",
  });

  const currentData = {
    week: week.number,
    max_nfl_picks: week.max_nfl_picks,
    max_ncaaf_picks: week.max_ncaaf_picks,
    max_nfl_binny_picks: week.max_nfl_binny_picks,
    max_ncaaf_binny_picks: week.max_ncaaf_binny_picks,
  };
  const weekArray = Array.from(
    { length: currentData.week },
    (_, i) => currentData.week - i,
  );
  // TODO: Figure out what to do with the week
  return (
    <div>
      <Navbar leagueSlug={league?.slug} />
      <LeaguePageHeader
        league={{ name: league?.name ?? "League", slug: league?.slug ?? "" }}
        leagues={memberships.map((membership) => ({
          name: membership.expand?.league?.name ?? membership.league,
          slug: membership.expand?.league?.slug ?? membership.league,
        }))}
      />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="animate-fade-up border-b py-5">
          <p className="text-lg font-semibold">{userTeam.team_name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{season.name}</p>
        </div>
      <div className="flex flex-col gap-4 px-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        {/* TODO: Potentially convert this to a component card */}
        <Card className="w-full border-primary/10 shadow-sm transition-shadow hover:shadow-md sm:max-w-md">
          <CardHeader>Week {currentData.week} Regular Picks</CardHeader>
          <CardContent>
            {
              picks.filter(
                (pick) =>
                  pick.pick_type === "REGULAR" &&
                  pick.week === currentData.week,
              ).length
            }
            {` of ${currentData.max_nfl_picks + currentData.max_ncaaf_picks}`}
            <Progress
              value={
                (picks.filter(
                  (pick) =>
                    pick.pick_type === "REGULAR" &&
                    pick.week === currentData.week,
                ).length /
                  (currentData.max_nfl_picks + currentData.max_ncaaf_picks)) *
                100
              }
            />
          </CardContent>
        </Card>
        <Card className="w-full border-primary/10 shadow-sm transition-shadow hover:shadow-md sm:max-w-md">
          <CardHeader>Week {currentData.week} Binny Picks</CardHeader>
          <CardContent>
            {
              picks.filter(
                (pick) =>
                  pick.pick_type === "BINNY" && pick.week === currentData.week,
              ).length
            }
            {` of ${currentData.max_nfl_binny_picks + currentData.max_ncaaf_binny_picks}`}
            <Progress
              value={
                (picks.filter(
                  (pick) =>
                    pick.pick_type === "BINNY" &&
                    pick.week === currentData.week,
                ).length /
                  (currentData.max_nfl_binny_picks +
                    currentData.max_ncaaf_binny_picks)) *
                100
              }
            />
          </CardContent>
        </Card>
      </div>
      {weekArray.map((week) => (
        <div className="animate-fade-up" key={week}>
          <Accordion
            className=""
            type="single"
            collapsible
            defaultValue="item-0"
          >
            <AccordionItem
              className="rounded-lg border px-4 py-2 transition-colors hover:bg-muted/20"
              value={week === currentData.week ? "item-0" : "item-1"}
            >
              <AccordionTrigger>Week {week}</AccordionTrigger>
              <AccordionContent>
                <div className="mx-auto max-w-xl px-0 py-6 sm:block md:hidden">
                  <DataTable
                    columns={mobileColumns}
                    data={picks.filter((pick) => pick.week === week)}
                  />
                </div>
                <div className="mx-auto hidden max-w-6xl py-6 md:block">
                  <DataTable
                    columns={columns}
                    data={picks.filter((pick) => pick.week === week)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
      </main>

      <Toaster />
    </div>
  );
}

