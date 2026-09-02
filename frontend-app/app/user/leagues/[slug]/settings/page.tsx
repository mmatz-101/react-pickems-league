import { getLeagueContext } from "@/lib/league-context";
import Link from "next/link";
import UpdateProfileForm from "@/components/leagues/update-profile-form";
import ManageLeagueTeams from "@/components/leagues/manage-league-teams";

export default async function LeagueSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { pb, league, membership, season, week } = await getLeagueContext(slug);
  const isCommissioner = membership.role === "COMMISSIONER";
  const members = isCommissioner
    ? await pb.collection("league_memberships").getFullList({
        filter: `league="${membership.league}"`,
        sort: "display_name",
      })
    : [];
  const teamMembers = isCommissioner
    ? await pb.collection("league_team_members").getFullList({
        expand: "league_team",
      })
    : [];
  const currentTeamMember = await pb.collection("league_team_members").getFirstListItem(
    `membership="${membership.id}"`,
    { expand: "league_team" },
  );
  const teams = isCommissioner
    ? await pb.collection("league_teams").getFullList({
        filter: `league="${membership.league}" && status="ACTIVE"`,
        sort: "name",
      })
    : [];
  const teamByMembership = Object.fromEntries(
    teamMembers.map((item) => [item.membership, item.league_team]),
  );

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Link className="text-sm underline" href={`/user/leagues/${slug}/dashboard`}>
        ← Back to dashboard
      </Link>
      <div>
        <p className="text-sm text-muted-foreground">League settings</p>
        <h1 className="text-3xl font-bold">{league?.name ?? "League"}</h1>
      </div>

      <section className="rounded border p-4">
        <h2 className="text-lg font-semibold">League information</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Slug</dt>
            <dd>{league?.slug}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Your role</dt>
            <dd>{membership.role}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd>{league?.status}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Timezone</dt>
            <dd>{league?.timezone}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-semibold">Your member profile</h2>
        <UpdateProfileForm
          membership={membership.id}
          leagueTeam={currentTeamMember.league_team}
          defaultDisplayName={membership.display_name}
          defaultTeamName={currentTeamMember.expand?.league_team?.name ?? ""}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Your display name identifies you in this league. Your shared pick-group name is visible to other league members.
        </p>
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-semibold">Active season</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Season</dt>
            <dd>{season.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Current week</dt>
            <dd>Week {week.number}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Regular win</dt>
            <dd>{season.regular_win_points}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Binny win/loss</dt>
            <dd>{season.binny_win_points} / {season.binny_loss_points}</dd>
          </div>
        </dl>
      </section>

      {isCommissioner && (
        <section className="rounded border p-4">
          <h2 className="text-lg font-semibold">Members and shared pick groups</h2>
          <ManageLeagueTeams
            league={membership.league}
            members={members.map((member) => ({ id: member.id, display_name: member.display_name, role: member.role, status: member.status }))}
            teams={teams.map((team) => ({ id: team.id, name: team.name }))}
            teamByMembership={teamByMembership}
          />
        </section>
      )}

      {isCommissioner && (
        <section className="rounded border p-4">
          <h2 className="text-lg font-semibold">Commissioner tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage membership and invitations for this league.
          </p>
          <Link
            className="mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground"
            href="/user/league/invites"
          >
            Manage invites
          </Link>
        </section>
      )}
    </main>
  );
}
