import { getPB } from "@/app/pocketbase";

export type LeagueStanding = {
  team_name: string;
  rank: number;
  result_points: number;
  win_count: number;
  lost_count: number;
  push_count: number;
  fav_count: number;
  und_count: number;
  pick_count: number;
  win_percentage: number;
};

export async function getLeagueStandings(seasonId: string): Promise<LeagueStanding[]> {
  const pb = await getPB();
  const picks = await pb.collection("picks").getFullList({
    filter: `week_record.season="${seasonId}"`,
    expand: "league_team",
  });
  const grouped = new Map<string, LeagueStanding>();

  for (const pick of picks) {
    const teamId = pick.league_team;
    const current = grouped.get(teamId) ?? {
      team_name: pick.expand?.league_team?.name ?? teamId,
      rank: 0,
      result_points: 0,
      win_count: 0,
      lost_count: 0,
      push_count: 0,
      fav_count: 0,
      und_count: 0,
      pick_count: 0,
      win_percentage: 0,
    };
    current.result_points += Number(pick.result_points ?? 0);
    current.pick_count += 1;
    if (pick.result_text === "WIN") current.win_count += 1;
    if (pick.result_text === "LOST") current.lost_count += 1;
    if (pick.result_text === "PUSH") current.push_count += 1;
    if (pick.fav_or_und === "FAV") current.fav_count += 1;
    if (pick.fav_or_und === "UND") current.und_count += 1;
    current.win_percentage = current.pick_count
      ? Number(((current.win_count / current.pick_count) * 100).toFixed(2))
      : 0;
    grouped.set(teamId, current);
  }

  return [...grouped.values()]
    .sort((a, b) => b.result_points - a.result_points)
    .map((standing, index, all) => ({
      ...standing,
      rank: index > 0 && standing.result_points === all[index - 1].result_points
        ? all[index - 1].rank
        : index + 1,
    }));
}
