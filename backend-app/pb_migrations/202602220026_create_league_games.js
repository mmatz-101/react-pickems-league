// Associates shared provider games with a league-specific competition week.
// This allows different leagues to use different week windows without
// duplicating the shared games table.

migrate(
  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    const games = app.findCollectionByNameOrId("games");
    const weeks = app.findCollectionByNameOrId("weeks");

    const leagueGames = new Collection({
      type: "base",
      name: "league_games",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "league", type: "relation", required: true, collectionId: leagues.id, maxSelect: 1, cascadeDelete: false },
        { name: "game", type: "relation", required: true, collectionId: games.id, maxSelect: 1, cascadeDelete: false },
        { name: "week", type: "relation", required: true, collectionId: weeks.id, maxSelect: 1, cascadeDelete: false },
        { name: "included", type: "bool", required: true },
        { name: "manual_override", type: "bool", required: true },
        { name: "resolution_note", type: "text", max: 2000 },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_league_games_league_game ON league_games (league, game)",
        "CREATE INDEX idx_league_games_league_week ON league_games (league, week)",
        "CREATE INDEX idx_league_games_game ON league_games (game)",
      ],
    });
    app.save(leagueGames);
  },

  (app) => {
    app.delete(app.findCollectionByNameOrId("league_games"));
  }
);
