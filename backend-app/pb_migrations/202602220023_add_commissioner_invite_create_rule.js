// Allows active commissioners to create invite records for their own league.
// Update/delete remain locked until dedicated revoke/management actions exist.

migrate(
  (app) => {
    const invites = app.findCollectionByNameOrId("league_invites");
    invites.createRule = "@request.auth.id != '' && created_by = @request.auth.id && league.league_memberships_via_league.user ?= @request.auth.id && league.league_memberships_via_league.role ?= 'COMMISSIONER'";
    app.save(invites);
  },

  (app) => {
    const invites = app.findCollectionByNameOrId("league_invites");
    invites.createRule = null;
    app.save(invites);
  }
);
