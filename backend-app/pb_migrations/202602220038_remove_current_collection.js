// Removes the legacy global current configuration after runtime code has
// moved to league/season/week records.
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("current");
    if (collection) app.delete(collection);
  },
  (app) => {
    throw new Error("The legacy current collection cannot be restored automatically.");
  }
);
