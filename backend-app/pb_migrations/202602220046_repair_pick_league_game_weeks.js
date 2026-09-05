// Repair historical league-game records that were linked to the wrong league
// week during the game-to-league-game migration. Picks and groups use stable
// record IDs, not display names, so their associations survive renames.
migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const leagueGames = app.findCollectionByNameOrId("league_games");
    const expectedWeekByLeagueGame = {};

    for (const pick of app.findAllRecords(picks)) {
      const leagueGame = pick.getString("league_game");
      const week = pick.getString("week_record");
      if (!leagueGame || !week) continue;

      if (expectedWeekByLeagueGame[leagueGame] && expectedWeekByLeagueGame[leagueGame] !== week) {
        throw new Error(`League game ${leagueGame} has picks from multiple weeks.`);
      }
      expectedWeekByLeagueGame[leagueGame] = week;
    }

    let repaired = 0;
    for (const [leagueGameID, weekID] of Object.entries(expectedWeekByLeagueGame)) {
      const leagueGame = app.findRecordById(leagueGames, leagueGameID);
      if (leagueGame.getString("week") === weekID) continue;
      leagueGame.set("week", weekID);
      app.save(leagueGame);
      repaired++;
    }
    console.log(`Repaired ${repaired} league-game week associations.`);
  },
  () => {}
);
