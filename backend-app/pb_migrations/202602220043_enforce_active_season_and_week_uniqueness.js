// Enforces one active season per league and one current, uniquely named week per season.

migrate(
  (app) => {
    const seasons = app.findCollectionByNameOrId("seasons");
    const weeks = app.findCollectionByNameOrId("weeks");

    seasons.addIndex("idx_seasons_one_active_per_league", true, "league", "status = 'ACTIVE'");
    weeks.addIndex("idx_weeks_season_name", true, "season, name", "");
    weeks.addIndex("idx_weeks_one_current_per_season", true, "season", "is_current = true");

    app.save(seasons);
    app.save(weeks);
  },
  (app) => {
    const seasons = app.findCollectionByNameOrId("seasons");
    const weeks = app.findCollectionByNameOrId("weeks");
    seasons.removeIndex("idx_seasons_one_active_per_league");
    weeks.removeIndex("idx_weeks_season_name");
    weeks.removeIndex("idx_weeks_one_current_per_season");
    app.save(seasons);
    app.save(weeks);
  }
);
