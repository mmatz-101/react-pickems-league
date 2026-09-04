// Adds an immutable creation timestamp to legacy invitation records so the
// commissioner invitation history can be ordered chronologically.

migrate(
  (app) => {
    const invites = app.findCollectionByNameOrId("league_invites");
    invites.fields.add(new AutodateField({
      name: "created_at",
      onCreate: true,
      onUpdate: false,
    }));
    app.save(invites);
  },

  (app) => {
    const invites = app.findCollectionByNameOrId("league_invites");
    invites.fields.removeByName("created_at");
    app.save(invites);
  }
);
