// Transitional schema adjustment for seeding. PocketBase's JS migration
// validation treats required zero/false values as blank in this path.
// These fields are explicitly populated by the seed migration.

migrate(
  (app) => {
    const weeks = app.findCollectionByNameOrId("weeks");
    for (const name of [
      "allow_picks",
      "max_nfl_picks",
      "max_ncaaf_picks",
      "max_nfl_binny_picks",
      "max_ncaaf_binny_picks",
      "is_current",
    ]) {
      weeks.fields.getByName(name).required = false;
    }
    app.save(weeks);
  },

  (app) => {
    const weeks = app.findCollectionByNameOrId("weeks");
    for (const name of [
      "allow_picks",
      "max_nfl_picks",
      "max_ncaaf_picks",
      "max_nfl_binny_picks",
      "max_ncaaf_binny_picks",
      "is_current",
    ]) {
      weeks.fields.getByName(name).required = true;
    }
    app.save(weeks);
  }
);
