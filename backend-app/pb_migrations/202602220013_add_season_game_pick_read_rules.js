// Adds authenticated read access to season, week, game, and pick data scoped
// through the league membership relationships.

migrate(
  (app) => {
    const seasons = app.findCollectionByNameOrId("seasons");
    seasons.listRule = "@request.auth.id != '' && league.league_memberships_via_league.user ?= @request.auth.id";
    seasons.viewRule = seasons.listRule;
    app.save(seasons);

    const weeks = app.findCollectionByNameOrId("weeks");
    weeks.listRule = "@request.auth.id != '' && season.league.league_memberships_via_league.user ?= @request.auth.id";
    weeks.viewRule = weeks.listRule;
    app.save(weeks);

    const games = app.findCollectionByNameOrId("games");
    games.listRule = "@request.auth.id != '' && week_record.season.league.league_memberships_via_league.user ?= @request.auth.id";
    games.viewRule = games.listRule;
    app.save(games);

    const picks = app.findCollectionByNameOrId("picks");
    picks.listRule = "@request.auth.id != '' && week_record.season.league.league_memberships_via_league.user ?= @request.auth.id";
    picks.viewRule = picks.listRule;
    app.save(picks);
  },

  (app) => {
    for (const name of ["seasons", "weeks", "games", "picks"]) {
      const collection = app.findCollectionByNameOrId(name);
      collection.listRule = null;
      collection.viewRule = null;
      app.save(collection);
    }
  }
);
