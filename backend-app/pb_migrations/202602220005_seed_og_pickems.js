// Seeds the existing single-league data model into the new league structure.
// This migration creates organizational records only. Existing games and picks
// are intentionally left unchanged for a later, separately verified migration.

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("_pb_users_auth_");
    const currentCollection = app.findCollectionByNameOrId("current");
    const userTeams = app.findCollectionByNameOrId("user_teams");
    const games = app.findCollectionByNameOrId("games");

    const leagues = app.findCollectionByNameOrId("leagues");
    const requests = app.findCollectionByNameOrId("league_requests");
    const memberships = app.findCollectionByNameOrId("league_memberships");
    const leagueTeams = app.findCollectionByNameOrId("league_teams");
    const teamMembers = app.findCollectionByNameOrId("league_team_members");
    const seasons = app.findCollectionByNameOrId("seasons");
    const weeks = app.findCollectionByNameOrId("weeks");

    const current = app.findFirstRecordByFilter(currentCollection, "id != ''");
    const currentWeek = current.getInt("week");
    const currentYear = current.getInt("year");

    const commissionerId = "e92i470xtvcxtz7";

    const league = new Record(leagues);
    league.set("name", "OG Pickems");
    league.set("slug", "og-pickems");
    league.set("description", "Original Pickems league");
    league.set("status", "ACTIVE");
    league.set("created_by", commissionerId);
    league.set("approved_by", commissionerId);
    league.set("approved_at", new Date().toISOString());
    league.set("timezone", "America/Chicago");
    app.save(league);

    const regularWinPoints = current.getFloat("regular_point_value");
    const binnyWinPoints = current.getFloat("binny_point_value");
    const season = new Record(seasons, {
      league: league.id,
      name: `${currentYear} Season`,
      year: currentYear,
      status: "ACTIVE",
      regular_win_points: regularWinPoints,
      regular_push_points: regularWinPoints / 2,
      regular_loss_points: 0,
      binny_win_points: binnyWinPoints,
      binny_push_points: 0,
      binny_loss_points: -binnyWinPoints,
    });
    app.save(season);

    const allGames = app.findAllRecords(games);
    const weekDates = {};

    for (const game of allGames) {
      const number = game.getInt("week");
      const date = game.getString("date");
      if (!number || !date) continue;

      if (!weekDates[number]) {
        weekDates[number] = { start: date, end: date };
      } else {
        if (date < weekDates[number].start) weekDates[number].start = date;
        if (date > weekDates[number].end) weekDates[number].end = date;
      }
    }

    for (let number = 1; number <= currentWeek; number++) {
      const dates = weekDates[number] || {
        start: current.getString("start_date"),
        end: current.getString("end_date"),
      };
      const isCurrent = number === currentWeek;
      const week = new Record(weeks, {
        season: season.id,
        number: number,
        name: `Week ${number}`,
        status: isCurrent
          ? (current.getBool("allow_picks") ? "OPEN" : "LOCKED")
          : "COMPLETED",
        start_date: dates.start,
        end_date: dates.end,
        allow_picks: isCurrent && current.getBool("allow_picks"),
        max_nfl_picks: isCurrent ? current.getInt("max_nfl_picks") : 4,
        max_ncaaf_picks: isCurrent ? current.getInt("max_ncaaf_picks") : 4,
        max_nfl_binny_picks: isCurrent ? current.getInt("max_nfl_binny_picks") : 1,
        max_ncaaf_binny_picks: isCurrent ? current.getInt("max_ncaaf_binny_picks") : 1,
        nfl_week_search: current.getString("nfl_week_search"),
        ncaaf_week_search: current.getString("ncaaf_week_search"),
        is_current: isCurrent,
      });
      app.save(week);
    }

    const membershipByUser = {};
    const allUserTeams = app.findAllRecords(userTeams);

    for (const userTeam of allUserTeams) {
      const linkedUsers = userTeam.get("users");
      const userIds = Array.isArray(linkedUsers) ? linkedUsers : [linkedUsers];
      const validUserIds = userIds.filter((id) => typeof id === "string" && id !== "");

      for (const userId of validUserIds) {
        if (membershipByUser[userId]) continue;

        const membership = new Record(memberships);
        membership.set("league", league.id);
        membership.set("user", userId);
        membership.set("role", userId === commissionerId ? "COMMISSIONER" : "MEMBER");
        membership.set("status", "ACTIVE");
        membership.set("display_name", userTeam.getString("team_name"));
        membership.set("team_name", userTeam.getString("team_name"));
        membership.set("joined_at", new Date().toISOString());
        app.save(membership);
        membershipByUser[userId] = membership.id;
      }
    }

    for (const userTeam of allUserTeams) {
      const leagueTeam = new Record(leagueTeams);
      leagueTeam.set("league", league.id);
      leagueTeam.set("name", userTeam.getString("team_name"));
      leagueTeam.set("status", "ACTIVE");
      app.save(leagueTeam);

      const linkedUsers = userTeam.get("users");
      const userIds = Array.isArray(linkedUsers) ? linkedUsers : [linkedUsers];
      for (const userId of userIds) {
        const membershipId = membershipByUser[userId];
        if (!membershipId) continue;

        const teamMember = new Record(teamMembers);
        teamMember.set("league_team", leagueTeam.id);
        teamMember.set("membership", membershipId);
        app.save(teamMember);
      }
    }

    // Keep the variable referenced so PocketBase does not optimize away the
    // collection lookup in older JSVM versions.
    void users;
    void requests;
  },

  (app) => {
    const league = app.findFirstRecordByFilter(
      app.findCollectionByNameOrId("leagues"),
      'slug = "og-pickems"'
    );

    if (!league) return;

    const leagueId = league.id;
    const memberships = app.findCollectionByNameOrId("league_memberships");
    const teams = app.findCollectionByNameOrId("league_teams");
    const seasons = app.findCollectionByNameOrId("seasons");

    for (const record of app.findAllRecords(
      app.findCollectionByNameOrId("league_team_members")
    )) {
      app.delete(record);
    }

    for (const record of app.findAllRecords(teams)) {
      if (record.getString("league") === leagueId) app.delete(record);
    }

    for (const record of app.findAllRecords(memberships)) {
      if (record.getString("league") === leagueId) app.delete(record);
    }

    for (const record of app.findAllRecords(seasons)) {
      if (record.getString("league") === leagueId) app.delete(record);
    }

    app.delete(league);
  }
);
