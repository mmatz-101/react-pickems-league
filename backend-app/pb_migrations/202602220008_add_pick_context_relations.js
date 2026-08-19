// Adds explicit ownership/context relations to picks while retaining the
// legacy user_team and numeric week fields during the transition.

migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    const leagueTeams = app.findCollectionByNameOrId("league_teams");
    const weeks = app.findCollectionByNameOrId("weeks");

    picks.fields.add(new RelationField({
      name: "league_team",
      required: false,
      collectionId: leagueTeams.id,
      maxSelect: 1,
      cascadeDelete: false,
    }));

    picks.fields.add(new RelationField({
      name: "week_record",
      required: false,
      collectionId: weeks.id,
      maxSelect: 1,
      cascadeDelete: false,
    }));

    picks.addIndex("idx_picks_league_team", false, "league_team", "");
    picks.addIndex("idx_picks_week_record", false, "week_record", "");

    app.save(picks);
  },

  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    picks.fields.removeByName("league_team");
    picks.fields.removeByName("week_record");
    picks.removeIndex("idx_picks_league_team");
    picks.removeIndex("idx_picks_week_record");
    app.save(picks);
  }
);
