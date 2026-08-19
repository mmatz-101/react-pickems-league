// Shared pick groups preserve the original user_teams behavior:
// multiple user accounts can belong to one group and share its picks.

migrate(
  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    const memberships = app.findCollectionByNameOrId("league_memberships");

    const leagueTeams = new Collection({
      type: "base",
      name: "league_teams",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "league",
          type: "relation",
          required: true,
          collectionId: leagues.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: "name", type: "text", required: true, max: 100 },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["ACTIVE", "SUSPENDED", "LEFT"],
          maxSelect: 1,
        },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_league_teams_league_name ON league_teams (league, name)",
        "CREATE INDEX idx_league_teams_league_status ON league_teams (league, status)",
      ],
    });
    app.save(leagueTeams);

    const teamMembers = new Collection({
      type: "base",
      name: "league_team_members",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "league_team",
          type: "relation",
          required: true,
          collectionId: leagueTeams.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: "membership",
          type: "relation",
          required: true,
          collectionId: memberships.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_team_members_team_membership ON league_team_members (league_team, membership)",
        "CREATE INDEX idx_team_members_membership ON league_team_members (membership)",
      ],
    });
    app.save(teamMembers);
  },

  (app) => {
    app.delete(app.findCollectionByNameOrId("league_team_members"));
    app.delete(app.findCollectionByNameOrId("league_teams"));
  }
);
