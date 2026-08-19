// Corrects picks.week_record to use the league competition week stored on the
// pick itself. The legacy picks.week field is the league week; games.week is
// the provider/sport week and must not be used for this relationship.

migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const weeks = app.findCollectionByNameOrId("weeks");
    const weeksByNumber = {};

    for (const week of app.findAllRecords(weeks)) {
      weeksByNumber[week.getInt("number")] = week.id;
    }

    let corrected = 0;
    let unmatched = 0;

    for (const pick of app.findAllRecords(picks)) {
      const weekId = weeksByNumber[pick.getInt("week")];
      if (!weekId) {
        unmatched++;
        continue;
      }

      pick.set("week_record", weekId);
      app.save(pick);
      corrected++;
    }

    if (unmatched > 0) {
      throw new Error(`${unmatched} picks did not match a league week.`);
    }

    console.log(`Corrected ${corrected} picks to league weeks; ${unmatched} unmatched.`);
  },

  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const games = app.findCollectionByNameOrId("games");

    for (const pick of app.findAllRecords(picks)) {
      const game = app.findRecordById(games, pick.getString("game"));
      pick.set("week_record", game.getString("week_record"));
      app.save(pick);
    }
  }
);
