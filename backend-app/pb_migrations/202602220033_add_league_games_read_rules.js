// Allows active league members to read their league-specific game mappings.
// Direct writes remain locked; scheduler/commissioner operations use protected
// backend code.

migrate(
  (app) => {
    const leagueGames = app.findCollectionByNameOrId("league_games");
    leagueGames.listRule = "@request.auth.id != '' && league.league_memberships_via_league.user ?= @request.auth.id && league.league_memberships_via_league.status ?= 'ACTIVE'";
    leagueGames.viewRule = leagueGames.listRule;
    app.save(leagueGames);
  },

  (app) => {
    const leagueGames = app.findCollectionByNameOrId("league_games");
    leagueGames.listRule = null;
    leagueGames.viewRule = null;
    app.save(leagueGames);
  }
);
