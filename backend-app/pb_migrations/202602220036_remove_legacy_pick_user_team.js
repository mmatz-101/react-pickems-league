// The application now uses league_team for shared pick ownership. The old
// user_team relation is retained only in migration history and is removed
// after all runtime references have been eliminated.

migrate(
  (app) => {
    const results = app.findCollectionByNameOrId("results_picks");
    if (results) app.delete(results);

    const picks = app.findCollectionByNameOrId("picks");
    picks.removeIndex("idx_FU1PuJw");
    picks.fields.removeByName("user_team");
    app.save(picks);
  },

  (app) => {
    throw new Error("The legacy picks.user_team field cannot be restored automatically.");
  }
);
