// Associates existing picks with their league-specific game records.

migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const leagueGames = app.findCollectionByNameOrId("league_games");
    const byGame = {};
    for (const record of app.findAllRecords(leagueGames)) {
      byGame[record.getString("game")] = record.id;
    }

    let attached = 0;
    let unmatched = 0;
    for (const pick of app.findAllRecords(picks)) {
      const leagueGameId = byGame[pick.getString("game")];
      if (!leagueGameId) {
        unmatched++;
        continue;
      }
      pick.set("league_game", leagueGameId);
      app.save(pick);
      attached++;
    }

    if (unmatched > 0) throw new Error(`${unmatched} picks did not match a league game.`);
    console.log(`Attached ${attached} picks to league games.`);
  },

  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    for (const pick of app.findAllRecords(picks)) {
      pick.set("league_game", "");
      app.save(pick);
    }
  }
);
