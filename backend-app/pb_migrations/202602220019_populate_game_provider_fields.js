// Copies the legacy provider/sport values into the explicit fields.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    let updated = 0;
    let invalid = 0;

    for (const game of app.findAllRecords(games)) {
      const sport = game.getString("league");
      const providerWeek = game.getInt("week");

      if (!["NFL", "NCAAF"].includes(sport) || providerWeek <= 0) {
        invalid++;
        continue;
      }

      game.set("sport", sport);
      game.set("provider_week", providerWeek);
      app.save(game);
      updated++;
    }

    if (invalid > 0) {
      throw new Error(`${invalid} games have invalid provider/sport values.`);
    }

    console.log(`Populated provider fields for ${updated} games.`);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    for (const game of app.findAllRecords(games)) {
      game.set("sport", "");
      game.set("provider_week", null);
      app.save(game);
    }
  }
);
