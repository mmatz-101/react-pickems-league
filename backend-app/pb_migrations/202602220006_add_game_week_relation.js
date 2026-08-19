// Adds the explicit season/week relationship to games while retaining the
// legacy numeric week field during the transition.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const weeks = app.findCollectionByNameOrId("weeks");

    games.fields.add(new RelationField({
      name: "week_record",
      required: false,
      collectionId: weeks.id,
      maxSelect: 1,
      cascadeDelete: false,
    }));

    games.addIndex(
      "idx_games_week_record",
      false,
      "week_record",
      ""
    );

    app.save(games);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    games.fields.removeByName("week_record");
    games.removeIndex("idx_games_week_record");
    app.save(games);
  }
);
