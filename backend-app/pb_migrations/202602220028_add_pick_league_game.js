// Adds the league-specific game relationship to picks while retaining the
// direct game relation during the transition.

migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const leagueGames = app.findCollectionByNameOrId("league_games");
    picks.fields.add(new RelationField({
      name: "league_game",
      required: false,
      collectionId: leagueGames.id,
      maxSelect: 1,
      cascadeDelete: false,
    }));
    picks.addIndex("idx_picks_league_game", false, "league_game", "");
    app.save(picks);
  },

  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    picks.fields.removeByName("league_game");
    picks.removeIndex("idx_picks_league_game");
    app.save(picks);
  }
);
