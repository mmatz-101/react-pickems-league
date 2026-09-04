// Provider week search values are obsolete now that game collection uses
// date windows. The legacy current collection is intentionally left intact
// until its remaining application references are removed.

migrate(
  (app) => {
    const weeks = app.findCollectionByNameOrId("weeks");
    weeks.fields.removeByName("nfl_week_search");
    weeks.fields.removeByName("ncaaf_week_search");
    app.save(weeks);
  },

  (app) => {
    throw new Error("Legacy provider week search fields cannot be restored automatically.");
  }
);
