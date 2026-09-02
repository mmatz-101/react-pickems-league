// Transitional schema adjustment for league-game seeding. Required boolean
// false values are treated as blank by this JS migration validation path.

migrate(
  (app) => {
    const leagueGames = app.findCollectionByNameOrId("league_games");
    for (const name of ["included", "manual_override"]) {
      leagueGames.fields.getByName(name).required = false;
    }
    app.save(leagueGames);
  },

  (app) => {
    const leagueGames = app.findCollectionByNameOrId("league_games");
    for (const name of ["included", "manual_override"]) {
      leagueGames.fields.getByName(name).required = true;
    }
    app.save(leagueGames);
  }
);
