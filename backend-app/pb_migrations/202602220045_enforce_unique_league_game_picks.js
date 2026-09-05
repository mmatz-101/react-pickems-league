// A shared pick group may submit only one pick for a league-specific game.
// league_games is already unique per (league, game), and its week belongs to a
// season, so this constraint covers the league, season/year, week, and game.
migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const keepers = {};
    let removed = 0;

    // Retain the first submitted pick when cleaning historical duplicates. A
    // database constraint then protects against concurrent submissions.
    for (const pick of app.findAllRecords(picks)) {
      const leagueGame = pick.getString("league_game");
      const leagueTeam = pick.getString("league_team");
      if (!leagueGame || !leagueTeam) continue;

      const key = `${leagueGame}:${leagueTeam}`;
      if (keepers[key]) {
        app.delete(pick);
        removed++;
      } else {
        keepers[key] = pick.id;
      }
    }

    picks.addIndex("idx_picks_unique_league_game_team", true, "league_game, league_team", "league_game != '' AND league_team != ''");
    app.save(picks);
    console.log(`Removed ${removed} duplicate league-game picks.`);
  },
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    picks.removeIndex("idx_picks_unique_league_game_team");
    app.save(picks);
  }
);
