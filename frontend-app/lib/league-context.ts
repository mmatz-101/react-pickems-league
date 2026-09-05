import { getPB } from "@/app/pocketbase";
import { cookies } from "next/headers";
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
  const selectedLeagueSlug = leagueSlug ?? (await cookies()).get("pickems_league")?.value;
  let membership;
  try {
    membership = await pb.collection("league_memberships").getFirstListItem(
      selectedLeagueSlug
        ? `user="${userId}" && status="ACTIVE" && league.slug="${selectedLeagueSlug}"`
        : `user="${userId}" && status="ACTIVE"`,
      { expand: "league" },
    );
  } catch {
    // A stale cookie (for example, after leaving a league) must never block
    // access to the user’s remaining active leagues.
    membership = await pb.collection("league_memberships").getFirstListItem(
      `user="${userId}" && status="ACTIVE"`,
      { expand: "league" },
    );
  }

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
