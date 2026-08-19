import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import {
  pickType,
  userTeamType,
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

export async function DashboardPageContent({
  leagueSlug,
}: {
  leagueSlug?: string;
}) {
  const { pb, league, memberships, season, week, leagueTeam } = await getLeagueContext(leagueSlug);
  const userTeam = { id: leagueTeam.id, team_name: leagueTeam.name } as userTeamType;

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
      <p className="text-lg px-4">{userTeam.team_name}</p>
      <p className="px-4 text-muted-foreground">{season.name}</p>
      <div className="flex flex-col gap-4 p-4 sm:justify-center items-center sm:flex-row">
        {/* TODO: Potentially convert this to a component card */}
        <Card className="max-w-md w-full">
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
        <Card className="max-w-md w-full">
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
        <div className="" key={week}>
          <Accordion
            className=""
            type="single"
            collapsible
            defaultValue="item-0"
          >
            <AccordionItem
              className="px-4 py-2"
              value={week === currentData.week ? "item-0" : "item-1"}
            >
              <AccordionTrigger>Week {week}</AccordionTrigger>
              <AccordionContent>
                <div className="container px-2 py-10 sm:block md:hidden">
                  <DataTable
                    columns={mobileColumns}
                    data={picks.filter((pick) => pick.week === week)}
                  />
                </div>
                <div className="container mx-auto py-10 hidden md:block">
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

      <Toaster />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardPageContent />;
}
