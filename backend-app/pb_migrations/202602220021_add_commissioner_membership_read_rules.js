// Allows commissioners to view all membership and shared-pick-group-member
// records within their own league. Normal members retain access to their own
// membership/team-member records only.

migrate(
  (app) => {
    const memberships = app.findCollectionByNameOrId("league_memberships");
    memberships.listRule = "@request.auth.id != '' && (user = @request.auth.id || (league.league_memberships_via_league.user ?= @request.auth.id && league.league_memberships_via_league.role ?= 'COMMISSIONER'))";
    memberships.viewRule = memberships.listRule;
    app.save(memberships);

    const teamMembers = app.findCollectionByNameOrId("league_team_members");
    teamMembers.listRule = "@request.auth.id != '' && (membership.user = @request.auth.id || (league_team.league.league_memberships_via_league.user ?= @request.auth.id && league_team.league.league_memberships_via_league.role ?= 'COMMISSIONER'))";
    teamMembers.viewRule = teamMembers.listRule;
    app.save(teamMembers);
  },

  (app) => {
    const memberships = app.findCollectionByNameOrId("league_memberships");
    memberships.listRule = "@request.auth.id != '' && user = @request.auth.id";
    memberships.viewRule = memberships.listRule;
    app.save(memberships);

    const teamMembers = app.findCollectionByNameOrId("league_team_members");
    teamMembers.listRule = "@request.auth.id != '' && league_team.league.league_memberships_via_league.user ?= @request.auth.id";
    teamMembers.viewRule = teamMembers.listRule;
    app.save(teamMembers);
  }
);
