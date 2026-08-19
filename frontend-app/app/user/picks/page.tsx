import GameCard, { gameTypeExpanded } from "@/components/picks/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { getLeagueContext } from "@/lib/league-context";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import Navbar from "@/components/navbar/navbar";

export async function PicksPageContent({ leagueSlug }: { leagueSlug?: string }) {
  const { pb, week, leagueTeam } = await getLeagueContext(leagueSlug);

  const gamesNFLData: gameTypeExpanded[] = await pb.collection("games").getFullList({
    filter: `week_record="${week.id}" && sport="NFL" && status!="FINAL" && status!="FINAL OT"`,
    expand: "home_team,away_team",
    sort: "date",
  });
  const gamesNCAAFData: gameTypeExpanded[] = await pb.collection("games").getFullList({
    filter: `week_record="${week.id}" && sport="NCAAF" && status!="FINAL" && status!="FINAL OT"`,
    expand: "home_team,away_team",
    sort: "date",
  });
  const currentPicks: pickType[] = await pb.collection("picks").getFullList({
    filter: `week_record="${week.id}" && league_team="${leagueTeam.id}"`,
  });

  return (
    <>
      <Navbar leagueSlug={leagueSlug} />
      <h1 className="text-2xl p-6">Picks Page — Week {week.number}</h1>
      <Tabs defaultValue="NFL" className="px-4">
        <TabsList className="grid w-full grid-cols-2">
          {week.max_nfl_picks !== 0 && <TabsTrigger value="NFL">NFL</TabsTrigger>}
          {week.max_ncaaf_picks !== 0 && <TabsTrigger value="NCAAF">NCAA</TabsTrigger>}
        </TabsList>
        <TabsContent value="NFL">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
            {week.max_nfl_picks !== 0 && gamesNFLData.map((game) => (
              <div className="w-full sm:max-w-[500px]" key={game.id}>
                <GameCard game={game} pick={currentPicks.find((pick) => pick.game === game.id)} leagueTeam={leagueTeam.id} weekRecord={week.id} />
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="NCAAF">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 py-4">
            {gamesNCAAFData.map((game) => (
              <div className="w-full sm:max-w-[500px]" key={game.id}>
                <GameCard game={game} pick={currentPicks.find((pick) => pick.game === game.id)} leagueTeam={leagueTeam.id} weekRecord={week.id} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
    </>
  );
}

export default function PicksPage() {
  return <PicksPageContent />;
}
