// Assigns games to league competition weeks using scheduled dates. The
// legacy games.week field remains the provider/sport week counter.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const weeks = app.findCollectionByNameOrId("weeks");
    const allWeeks = app.findAllRecords(weeks);
    const allGames = app.findAllRecords(games);
    let attached = 0;
    let unmatched = 0;

    for (const game of allGames) {
      const date = game.getString("date");
      const matchingWeeks = allWeeks.filter((week) => {
        const start = week.getString("start_date");
        const end = week.getString("end_date");
        return date >= start && date < end;
      });

      if (matchingWeeks.length !== 1) {
        unmatched++;
        continue;
      }

      game.set("week_record", matchingWeeks[0].id);
      app.save(game);
      attached++;
    }

    if (unmatched > 0) {
      throw new Error(`${unmatched} games did not match exactly one league week.`);
    }

    console.log(`Assigned ${attached} games to league weeks; ${unmatched} unmatched.`);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    for (const game of app.findAllRecords(games)) {
      game.set("week_record", "");
      app.save(game);
    }
  }
);
