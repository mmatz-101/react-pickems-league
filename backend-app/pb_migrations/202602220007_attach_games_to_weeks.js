// Associates existing games with the migrated shared season weeks.
// Legacy league/week fields remain in place until the application migration
// is complete and verified.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const weeks = app.findCollectionByNameOrId("weeks");
    const allGames = app.findAllRecords(games);
    const allWeeks = app.findAllRecords(weeks);
    const weeksByNumber = {};

    for (const week of allWeeks) {
      weeksByNumber[week.getInt("number")] = week;
    }

    let attached = 0;
    let unmatched = 0;

    for (const game of allGames) {
      const week = weeksByNumber[game.getInt("week")];
      if (!week) {
        unmatched++;
        continue;
      }

      game.set("week_record", week.id);
      app.save(game);
      attached++;
    }

    console.log(`Attached ${attached} games to weeks; ${unmatched} unmatched.`);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    for (const game of app.findAllRecords(games)) {
      game.set("week_record", "");
      app.save(game);
    }
  }
);
