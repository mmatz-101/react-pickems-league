// Shared provider games are visible to members of any league that includes the
// game through a league_games assignment, even when the game's original
// week_record belongs to another league.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const rule = "@request.auth.id != '' && (week_record.season.league.league_memberships_via_league.user ?= @request.auth.id || league_games_via_game.league.league_memberships_via_league.user ?= @request.auth.id)";
    games.listRule = rule;
    games.viewRule = rule;
    app.save(games);
  },
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const rule = "@request.auth.id != '' && week_record.season.league.league_memberships_via_league.user ?= @request.auth.id";
    games.listRule = rule;
    games.viewRule = rule;
    app.save(games);
  }
);
