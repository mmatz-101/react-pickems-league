// Makes the provider/sport-week distinction explicit while retaining the
// legacy league and week fields during the application transition.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");

    games.fields.add(new SelectField({
      name: "sport",
      required: false,
      values: ["NFL", "NCAAF"],
      maxSelect: 1,
    }));

    games.fields.add(new NumberField({
      name: "provider_week",
      required: false,
      onlyInt: true,
    }));

    games.addIndex("idx_games_sport_provider_week", false, "sport, provider_week", "");
    app.save(games);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    games.fields.removeByName("sport");
    games.fields.removeByName("provider_week");
    games.removeIndex("idx_games_sport_provider_week");
    app.save(games);
  }
);
