import { getLeagueContext } from "@/lib/league-context";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  Info,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import UpdateProfileForm from "@/components/leagues/update-profile-form";
import ManageLeagueTeams from "@/components/leagues/manage-league-teams";
import ManageLeagueGames from "@/components/leagues/manage-league-games";
import ManageLeagueWeek from "@/components/leagues/manage-league-week";
import CreateLeagueWeek from "@/components/leagues/create-league-week";
import CreateLeagueSeason from "@/components/leagues/create-league-season";
import SelectLeaguePeriod from "@/components/leagues/select-league-period";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SettingCard({
  children,
  className,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card className={`settings-card animate-fade-up ${className ?? ""}`}>
      <CardHeader className="space-y-1 border-b bg-muted/30 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}

export default async function LeagueSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { pb, league, membership, season, week } = await getLeagueContext(slug);
  const isCommissioner = membership.role === "COMMISSIONER";
  const seasonWeeks = await pb.collection("weeks").getFullList({ filter: `season="${season.id}"`, sort: "number" });
  const leagueSeasons = await pb.collection("seasons").getFullList({ filter: `league="${membership.league}"`, sort: "-year" });
  const nextSeasonYear = (leagueSeasons[0]?.year ?? new Date().getUTCFullYear()) + 1;
  const manageableWeek = {
    id: week.id, start_date: week.start_date, end_date: week.end_date, status: week.status,
    allow_picks: week.allow_picks, max_nfl_picks: week.max_nfl_picks, max_ncaaf_picks: week.max_ncaaf_picks,
    max_nfl_binny_picks: week.max_nfl_binny_picks, max_ncaaf_binny_picks: week.max_ncaaf_binny_picks,
    is_current: week.is_current,
  };
  const members = isCommissioner ? await pb.collection("league_memberships").getFullList({ filter: `league="${membership.league}"`, sort: "display_name" }) : [];
  const teamMembers = isCommissioner ? await pb.collection("league_team_members").getFullList({ expand: "league_team" }) : [];
  const currentTeamMember = await pb.collection("league_team_members").getFirstListItem(`membership="${membership.id}"`, { expand: "league_team" });
  const teams = isCommissioner ? await pb.collection("league_teams").getFullList({ filter: `league="${membership.league}" && status="ACTIVE"`, sort: "name" }) : [];
  const weekGames = isCommissioner ? await pb.collection("games").getFullList({ filter: `date >= "${week.start_date}" && date < "${week.end_date}"`, sort: "date" }) : [];
  const leagueGames = isCommissioner ? await pb.collection("league_games").getFullList({ filter: `league="${membership.league}" && week="${week.id}"` }) : [];
  const teamByMembership = Object.fromEntries(teamMembers.map((item) => [item.membership, item.league_team]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 animate-fade-up">
        <Button asChild className="-ml-3 mb-5" size="sm" variant="ghost">
          <Link href={`/user/leagues/${slug}/dashboard`}><ArrowLeft /> Back to dashboard</Link>
        </Button>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">League administration</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{league?.name ?? "League"}</h1>
          </div>
          <span className="w-fit rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isCommissioner ? "Commissioner" : "Member"}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        <SettingCard icon={Info} title="League information">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {[['Slug', league?.slug], ['Your role', membership.role], ['Status', league?.status], ['Timezone', league?.timezone]].map(([label, value]) => (
              <div key={label}><dt className="settings-label">{label}</dt><dd className="mt-1.5 font-medium">{value || "—"}</dd></div>
            ))}
          </dl>
        </SettingCard>

        <SettingCard description="Choose the name other members see and the group your picks belong to." icon={UsersRound} title="Your member profile">
          <UpdateProfileForm membership={membership.id} leagueTeam={currentTeamMember.league_team} defaultDisplayName={membership.display_name} defaultTeamName={currentTeamMember.expand?.league_team?.name ?? ""} />
        </SettingCard>

        <SettingCard icon={CalendarDays} title="Active season">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {[['Season', season.name], ['Current week', `Week ${week.number}`], ['Regular win', season.regular_win_points], ['Binny win / loss', `${season.binny_win_points} / ${season.binny_loss_points}`]].map(([label, value]) => (
              <div key={label}><dt className="settings-label">{label}</dt><dd className="mt-1.5 font-medium">{value}</dd></div>
            ))}
          </dl>
        </SettingCard>

        {isCommissioner && <>
          <SettingCard description="Select the season and week members will see across the league." icon={CalendarDays} title="League period">
            <SelectLeaguePeriod seasons={leagueSeasons.map((item) => ({ id: item.id, name: item.name, year: item.year, status: item.status }))} weeks={seasonWeeks.map((item) => ({ id: item.id, name: item.name, number: item.number, is_current: item.is_current }))} activeSeason={season.id} currentWeek={week.id} />
          </SettingCard>
          <SettingCard description="Set up the next season before adding its weeks." icon={CalendarDays} title="Create a future season">
            <CreateLeagueSeason league={membership.league} nextYear={nextSeasonYear} />
          </SettingCard>
          <SettingCard description={`Editing ${week.name} in ${season.name}. Update dates, pick limits, scoring window, and availability.`} icon={ShieldCheck} title={`Current week settings · Week ${week.number}`}>
            <ManageLeagueWeek week={manageableWeek} />
            <div className="mt-8 border-t pt-7"><h3 className="font-semibold">Create another week</h3><p className="mt-1 text-sm text-muted-foreground">Add the next week to {season.name}.</p><CreateLeagueWeek season={season.id} nextNumber={seasonWeeks.length + 1} /></div>
          </SettingCard>
          <SettingCard description="Choose which provider games are available for members to pick this week." icon={ShieldCheck} title="League game availability">
            <ManageLeagueGames league={membership.league} week={week.id} games={weekGames.map((game) => ({ id: game.id, away_name: game.away_name, home_name: game.home_name, sport: game.sport ?? game.league, date: game.date, status: game.status }))} includedGameIds={leagueGames.filter((game) => game.included).map((game) => game.game)} />
          </SettingCard>
          <SettingCard description="Create shared pick groups and assign league members to them." icon={UsersRound} title="Members and shared pick groups">
            <ManageLeagueTeams league={membership.league} members={members.map((member) => ({ id: member.id, display_name: member.display_name, role: member.role, status: member.status }))} teams={teams.map((team) => ({ id: team.id, name: team.name }))} teamByMembership={teamByMembership} />
          </SettingCard>
          <SettingCard description="Manage pending membership requests and create invitations." icon={Crown} title="Commissioner tools">
            <Button asChild><Link href="/user/league/invites">Manage invites</Link></Button>
          </SettingCard>
        </>}
      </div>
    </main>
  );
}
