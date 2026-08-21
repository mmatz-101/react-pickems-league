import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/navbar/navbar";
import { getLeagueContext } from "@/lib/league-context";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";

interface LeaguePickQuery extends pickType {
  expand: { game: gameType; league_team: { name: string } };
}

export default async function LeaguePicksContent({ leagueSlug }: { leagueSlug?: string }) {
  const { pb, league, week } = await getLeagueContext(leagueSlug);
  const picks: LeaguePickQuery[] = await pb.collection("picks").getFullList({
    filter: `week_record="${week.id}" && @now>game.date`,
    sort: "league_team, -pick_type, -game.sport, +game.date",
    expand: "game, league_team",
  });

  const uniqueNames = Array.from(
    new Set(picks.map((pick) => pick.expand.league_team.name)),
  );

  return (
    <>
      <Navbar leagueSlug={league?.slug} />
      <h1 className="text-2xl md:text-3xl p-4">{league?.name ?? "League"} Picks</h1>
      <p className="text-lg px-4">Week {week.number}</p>
      <div className="flex flex-col gap-4 p-4">
        {uniqueNames.map((teamName) => (
          <div className="w-full max-w-5xl mx-auto" key={teamName}>
            <Accordion className="w-full" type="single" collapsible defaultValue="item-0">
              <AccordionItem value="item-0">
                <AccordionTrigger className="flex items-center justify-between p-4 rounded-md hover:bg-gray-300">
                  <span className="font-bold">{teamName}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-white border-t border-gray-200 rounded-b-md">
                  <div className="container py-4 sm:block md:hidden">
                    <DataTable
                      columns={mobileColumns}
                      data={picks.filter((pick) => pick.expand.league_team.name === teamName)}
                    />
                  </div>
                  <div className="container mx-auto py-4 hidden md:block">
                    <DataTable
                      columns={columns}
                      data={picks.filter((pick) => pick.expand.league_team.name === teamName)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </>
  );
}
