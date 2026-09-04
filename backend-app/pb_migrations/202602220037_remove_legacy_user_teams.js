// Removes the legacy user_teams collection after its data was migrated to
// league_teams, league_memberships, and league_team_members.

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("user_teams");
    if (collection) app.delete(collection);
  },
  (app) => {
    throw new Error("The legacy user_teams collection cannot be restored automatically.");
  }
);
