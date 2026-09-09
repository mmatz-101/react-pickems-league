// A season may have one current/open week at most. Future weeks remain SETUP
// until the current, locked week is completed by the results scheduler.

migrate(
  (app) => {
    const weeks = app.findCollectionByNameOrId("weeks");
    const openBySeason = {};

    for (const week of app.findAllRecords(weeks)) {
      if (week.getString("status") !== "OPEN") continue;
      const season = week.getString("season");
      const kept = openBySeason[season];
      if (!kept || (!kept.getBool("is_current") && week.getBool("is_current"))) {
        if (kept) {
          kept.set("status", "SETUP");
          kept.set("allow_picks", false);
          app.save(kept);
        }
        openBySeason[season] = week;
        continue;
      }
      week.set("status", "SETUP");
      week.set("allow_picks", false);
      app.save(week);
    }

    weeks.addIndex("idx_weeks_one_open_per_season", true, "season", "status = 'OPEN'");
    app.save(weeks);
  },
  (app) => {
    const weeks = app.findCollectionByNameOrId("weeks");
    weeks.removeIndex("idx_weeks_one_open_per_season");
    app.save(weeks);
  }
);
