// Treats the currently stored spread as the kickoff spread for historical
// completed games. This is the agreed fallback for games recorded before the
// kickoff-spread fields existed.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const completedStatuses = ["FINAL", "FINAL OT", "COMPLETE"];
    let updated = 0;

    for (const game of app.findAllRecords(games)) {
      if (game.getBool("kickoff_spread_captured")) continue;
      if (!completedStatuses.includes(game.getString("status").toUpperCase())) continue;

      const homeSpread = game.getFloat("home_spread");
      const awaySpread = game.getFloat("away_spread");
      if (homeSpread === 0 || awaySpread === 0) continue;

      game.set("kickoff_home_spread", homeSpread);
      game.set("kickoff_away_spread", awaySpread);
      game.set("kickoff_spread_captured", true);
      app.save(game);
      updated++;
    }

    console.log(`Backfilled kickoff spreads for ${updated} completed games.`);
  },

  (app) => {
    const games = app.findCollectionByNameOrId("games");
    for (const game of app.findAllRecords(games)) {
      game.set("kickoff_home_spread", null);
      game.set("kickoff_away_spread", null);
      game.set("kickoff_spread_captured", false);
      app.save(game);
    }
  }
);
