// Migrates the existing OG Pickems game/week assignments into league_games.

migrate(
  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    const games = app.findCollectionByNameOrId("games");
    const weeks = app.findCollectionByNameOrId("weeks");
    const leagueGames = app.findCollectionByNameOrId("league_games");
    const league = app.findFirstRecordByFilter(leagues, 'slug="og-pickems"');

    let attached = 0;
    for (const game of app.findAllRecords(games)) {
      const weekId = game.getString("week_record");
      const week = app.findRecordById(weeks, weekId);
      const record = new Record(leagueGames, {
        league: league.id,
        game: game.id,
        week: week.id,
        included: true,
        manual_override: false,
        resolution_note: "",
      });
      app.save(record);
      attached++;
    }

    console.log(`Attached ${attached} games to OG Pickems.`);
  },

  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    const league = app.findFirstRecordByFilter(leagues, 'slug="og-pickems"');
    const leagueGames = app.findCollectionByNameOrId("league_games");
    for (const record of app.findAllRecords(leagueGames)) {
      if (record.getString("league") === league.id) app.delete(record);
    }
  }
);
