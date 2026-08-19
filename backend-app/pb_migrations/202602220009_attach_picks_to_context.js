// Associates existing picks with their migrated shared pick group and week.
// Existing pick values and the legacy relations remain unchanged.

migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const userTeams = app.findCollectionByNameOrId("user_teams");
    const leagueTeams = app.findCollectionByNameOrId("league_teams");
    const games = app.findCollectionByNameOrId("games");

    const teamNameByLegacyId = {};
    for (const userTeam of app.findAllRecords(userTeams)) {
      teamNameByLegacyId[userTeam.id] = userTeam.getString("team_name");
    }

    const leagueTeamIdByName = {};
    for (const leagueTeam of app.findAllRecords(leagueTeams)) {
      leagueTeamIdByName[leagueTeam.getString("name")] = leagueTeam.id;
    }

    let attached = 0;
    let unmatchedTeams = 0;
    let unmatchedGames = 0;

    for (const pick of app.findAllRecords(picks)) {
      const legacyTeamId = pick.getString("user_team");
      const teamName = teamNameByLegacyId[legacyTeamId];
      const leagueTeamId = leagueTeamIdByName[teamName];

      if (!leagueTeamId) {
        unmatchedTeams++;
        continue;
      }

      const gameId = pick.getString("game");
      const game = app.findRecordById(games, gameId);
      const weekRecordId = game.getString("week_record");

      if (!weekRecordId) {
        unmatchedGames++;
        continue;
      }

      pick.set("league_team", leagueTeamId);
      pick.set("week_record", weekRecordId);
      app.save(pick);
      attached++;
    }

    console.log(
      `Attached ${attached} picks; ${unmatchedTeams} unmatched teams; ${unmatchedGames} unmatched games.`
    );
  },

  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    for (const pick of app.findAllRecords(picks)) {
      pick.set("league_team", "");
      pick.set("week_record", "");
      app.save(pick);
    }
  }
);
