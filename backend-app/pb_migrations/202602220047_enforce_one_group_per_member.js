// A league membership represents one person in one league and must belong to
// exactly one pick group. Creation paths assign a group; this unique index
// prevents duplicate assignments during concurrent member moves.
migrate(
  (app) => {
    const members = app.findCollectionByNameOrId("league_team_members");
    const keeperByMembership = {};
    let removed = 0;

    for (const record of app.findAllRecords(members)) {
      const membership = record.getString("membership");
      if (!membership) continue;
      if (keeperByMembership[membership]) {
        app.delete(record);
        removed++;
      } else {
        keeperByMembership[membership] = record.id;
      }
    }

    members.addIndex("idx_team_members_unique_membership", true, "membership", "membership != ''");
    app.save(members);
    console.log(`Removed ${removed} duplicate group assignments.`);
  },
  (app) => {
    const members = app.findCollectionByNameOrId("league_team_members");
    members.removeIndex("idx_team_members_unique_membership");
    app.save(members);
  }
);
