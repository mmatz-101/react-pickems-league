import { ResultDataTable } from "@/app/user/results/result-data-table";
import { resultColumns } from "@/app/user/results/result-columns";
import Navbar from "@/components/navbar/navbar";
import { getLeagueContext } from "@/lib/league-context";
import { getLeagueStandings } from "@/lib/league-standings";

export default async function ResultsPageContent({ leagueSlug }: { leagueSlug?: string }) {
  const { season, league } = await getLeagueContext(leagueSlug);
  const resultData = await getLeagueStandings(season.id);

  return (
    <>
      <Navbar leagueSlug={league?.slug} />
      <h1 className="text-xl p-4">{league?.name ?? "League"} Results</h1>
      <ResultDataTable columns={resultColumns} data={resultData} />
    </>
  );
}
