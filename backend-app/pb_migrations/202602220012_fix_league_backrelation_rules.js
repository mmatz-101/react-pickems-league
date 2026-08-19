// Back-relations can match multiple related records. Use ?= so the rule
// succeeds when any related membership belongs to the authenticated user.

migrate(
  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    leagues.listRule = "@request.auth.id != '' && league_memberships_via_league.user ?= @request.auth.id";
    leagues.viewRule = leagues.listRule;
    app.save(leagues);

    const teams = app.findCollectionByNameOrId("league_teams");
    teams.listRule = "@request.auth.id != '' && league.league_memberships_via_league.user ?= @request.auth.id";
    teams.viewRule = teams.listRule;
    app.save(teams);

    const teamMembers = app.findCollectionByNameOrId("league_team_members");
    teamMembers.listRule = "@request.auth.id != '' && league_team.league.league_memberships_via_league.user ?= @request.auth.id";
    teamMembers.viewRule = teamMembers.listRule;
    app.save(teamMembers);
  },

  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    leagues.listRule = "@request.auth.id != '' && league_memberships_via_league.user = @request.auth.id";
    leagues.viewRule = leagues.listRule;
    app.save(leagues);

    const teams = app.findCollectionByNameOrId("league_teams");
    teams.listRule = "@request.auth.id != '' && league.league_memberships_via_league.user = @request.auth.id";
    teams.viewRule = teams.listRule;
    app.save(teams);

    const teamMembers = app.findCollectionByNameOrId("league_team_members");
    teamMembers.listRule = "@request.auth.id != '' && league_team.league.league_memberships_via_league.user = @request.auth.id";
    teamMembers.viewRule = teamMembers.listRule;
    app.save(teamMembers);
  }
);
