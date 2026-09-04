// Removes the retired weekly-winner feature after its frontend and backend
// references have been removed. Restore from a PocketBase backup to recover
// these collections; this migration is intentionally not reversible.

migrate(
  (app) => {
    for (const name of [
      "results_weekly_winner",
      "weekly_winner_table",
      "weekly_winner_comp",
    ]) {
      const collection = app.findCollectionByNameOrId(name);
      if (collection) app.delete(collection);
    }
  },
  (app) => {
    throw new Error("The weekly-winner collections cannot be restored automatically.");
  }
);
