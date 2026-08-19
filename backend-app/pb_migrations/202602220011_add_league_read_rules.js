// Adds conservative authenticated read access for league-scoped records.
// Write permissions remain locked until the rules are tested against real
// member/commissioner scenarios.

migrate(
  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    leagues.listRule = "@request.auth.id != '' && league_memberships_via_league.user = @request.auth.id";
    leagues.viewRule = leagues.listRule;
    app.save(leagues);

    const memberships = app.findCollectionByNameOrId("league_memberships");
    memberships.listRule = "@request.auth.id != '' && user = @request.auth.id";
    memberships.viewRule = memberships.listRule;
    app.save(memberships);

    const teams = app.findCollectionByNameOrId("league_teams");
    teams.listRule = "@request.auth.id != '' && league.league_memberships_via_league.user = @request.auth.id";
    teams.viewRule = teams.listRule;
    app.save(teams);

    const teamMembers = app.findCollectionByNameOrId("league_team_members");
    teamMembers.listRule = "@request.auth.id != '' && league_team.league.league_memberships_via_league.user = @request.auth.id";
    teamMembers.viewRule = teamMembers.listRule;
    app.save(teamMembers);
  },

  (app) => {
    for (const name of [
      "leagues",
      "league_memberships",
      "league_teams",
      "league_team_members",
    ]) {
      const collection = app.findCollectionByNameOrId(name);
      collection.listRule = null;
      collection.viewRule = null;
      app.save(collection);
    }
  }
);
