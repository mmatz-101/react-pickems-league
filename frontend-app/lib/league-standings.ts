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

export async function getLeagueWeeklyProgress(seasonId: string): Promise<{ week: string; [team: string]: string | number }[]> {
  const pb = await getPB();
  const [weeks, picks] = await Promise.all([
    pb.collection("weeks").getFullList({ filter: `season="${seasonId}"`, sort: "number" }),
    pb.collection("picks").getFullList({ filter: `week_record.season="${seasonId}"`, expand: "league_team" }),
  ]);
  const teams = Array.from(new Set(picks.map((pick) => pick.expand?.league_team?.name ?? pick.league_team)));
  const totals = Object.fromEntries(teams.map((team) => [team, 0])) as Record<string, number>;

  return weeks.map((week) => {
    for (const pick of picks.filter((item) => item.week_record === week.id)) {
      const team = pick.expand?.league_team?.name ?? pick.league_team;
      totals[team] = (totals[team] ?? 0) + Number(pick.result_points ?? 0);
    }
    return { week: `W${week.number}`, ...totals };
  });
}

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
    const completedGames = current.win_count + current.lost_count + current.push_count;
    current.win_percentage = completedGames
      ? Number(((current.win_count / completedGames) * 100).toFixed(2))
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
