// PocketBase treats required numeric zero values as blank in this migration
// path. Scoring values legitimately include zero, so these fields are made
// optional during the seed. They remain explicitly populated by the seed
// migration and can be made required again in a later validation migration.

migrate(
  (app) => {
    const seasons = app.findCollectionByNameOrId("seasons");
    for (const name of [
      "regular_win_points",
      "regular_push_points",
      "regular_loss_points",
      "binny_win_points",
      "binny_push_points",
      "binny_loss_points",
    ]) {
      seasons.fields.getByName(name).required = false;
    }
    app.save(seasons);
  },

  (app) => {
    const seasons = app.findCollectionByNameOrId("seasons");
    for (const name of [
      "regular_win_points",
      "regular_push_points",
      "regular_loss_points",
      "binny_win_points",
      "binny_push_points",
      "binny_loss_points",
    ]) {
      seasons.fields.getByName(name).required = true;
    }
    app.save(seasons);
  }
);
