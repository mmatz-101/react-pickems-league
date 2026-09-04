// Adds an automatic modification timestamp to invitation records.

migrate(
  (app) => {
    const invites = app.findCollectionByNameOrId("league_invites");
    invites.fields.add(new AutodateField({
      name: "updated_at",
      onCreate: true,
      onUpdate: true,
    }));
    app.save(invites);
  },

  (app) => {
    const invites = app.findCollectionByNameOrId("league_invites");
    invites.fields.removeByName("updated_at");
    app.save(invites);
  }
);
