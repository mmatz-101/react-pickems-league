import { getPB } from "@/app/pocketbase";
import { redirect } from "next/navigation";

export async function getLeagueContext(leagueSlug?: string) {
  const pb = await getPB();
  const userId = pb.authStore.model?.id;

  if (!pb.authStore.isValid || !userId) {
    redirect("/login");
  }

  const memberships = await pb.collection("league_memberships").getFullList({
    filter: `user="${userId}" && status="ACTIVE"`,
    expand: "league",
  });
  const membership = await pb.collection("league_memberships").getFirstListItem(
    leagueSlug
      ? `user="${userId}" && status="ACTIVE" && league.slug="${leagueSlug}"`
      : `user="${userId}" && status="ACTIVE"`,
    { expand: "league" },
  );

  const leagueId = membership.league;
  const season = await pb.collection("seasons").getFirstListItem(
    `league="${leagueId}" && status="ACTIVE"`,
  );
  const week = await pb.collection("weeks").getFirstListItem(
    `season="${season.id}" && is_current=true`,
  );
  const teamMember = await pb.collection("league_team_members").getFirstListItem(
    `membership="${membership.id}"`,
    { expand: "league_team" },
  );

  return {
    pb,
    userId,
    memberships,
    membership,
    league: membership.expand?.league,
    season,
    week,
    leagueTeam: teamMember.expand?.league_team,
  };
}
