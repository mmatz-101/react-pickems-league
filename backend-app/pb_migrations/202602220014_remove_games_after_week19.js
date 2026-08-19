// Removes out-of-window games from the test/imported 2025 season.
// The league's Week 19 window ends at 2026-01-06. The migration refuses to
// delete any game that still has a pick referencing it.

migrate(
  (app) => {
    const games = app.findCollectionByNameOrId("games");
    const picks = app.findCollectionByNameOrId("picks");
    const pickedGameIds = {};

    for (const pick of app.findAllRecords(picks)) {
      pickedGameIds[pick.getString("game")] = true;
    }

    const cutoff = "2026-01-06 00:00:00.000Z";
    let removed = 0;
    let withPicks = 0;

    for (const game of app.findAllRecords(games)) {
      if (game.getString("date") < cutoff) continue;

      if (pickedGameIds[game.id]) {
        withPicks++;
        continue;
      }

      app.delete(game);
      removed++;
    }

    if (withPicks > 0) {
      throw new Error(`${withPicks} out-of-window games still have picks; nothing should be deleted.`);
    }

    console.log(`Removed ${removed} games on or after ${cutoff}.`);
  },

  (app) => {
    throw new Error("This destructive cleanup migration cannot be automatically reversed from the database.");
  }
);
