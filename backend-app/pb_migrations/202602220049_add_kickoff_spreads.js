// Preserves the final pregame line for team ATS records.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");

    games.fields.add(new NumberField({
      name: "kickoff_home_spread",
      required: false,
    }));
    games.fields.add(new NumberField({
      name: "kickoff_away_spread",
      required: false,
    }));
    games.fields.add(new BoolField({
      name: "kickoff_spread_captured",
      required: false,
    }));

    app.save(games);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    games.fields.removeByName("kickoff_home_spread");
    games.fields.removeByName("kickoff_away_spread");
    games.fields.removeByName("kickoff_spread_captured");
    app.save(games);
  }
);
