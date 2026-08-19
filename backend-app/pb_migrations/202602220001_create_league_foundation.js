// Initial multi-league foundation.
//
// This migration intentionally creates the new collections with locked API
// rules. Access rules will be added only after the relationships and data
// migration have been verified in a local database copy.

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("_pb_users_auth_");

    const leagues = new Collection({
      type: "base",
      name: "leagues",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "name", type: "text", required: true, max: 100 },
        { name: "slug", type: "text", required: true, max: 100 },
        { name: "description", type: "text", max: 2000 },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["ACTIVE", "SUSPENDED", "ARCHIVED"],
          maxSelect: 1,
        },
        {
          name: "created_by",
          type: "relation",
          required: true,
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: "approved_by",
          type: "relation",
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: "approved_at", type: "date" },
        { name: "timezone", type: "text", required: true, max: 100 },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_leagues_slug ON leagues (slug)",
      ],
    });
    app.save(leagues);

    const leagueRequests = new Collection({
      type: "base",
      name: "league_requests",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "requester",
          type: "relation",
          required: true,
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: "requested_name", type: "text", required: true, max: 100 },
        { name: "description", type: "text", max: 2000 },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["PENDING", "APPROVED", "REJECTED"],
          maxSelect: 1,
        },
        {
          name: "reviewed_by",
          type: "relation",
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: "reviewed_at", type: "date" },
        { name: "admin_notes", type: "text", max: 2000 },
      ],
      indexes: [
        "CREATE INDEX idx_league_requests_status ON league_requests (status)",
        "CREATE INDEX idx_league_requests_requester ON league_requests (requester)",
      ],
    });
    app.save(leagueRequests);

    const memberships = new Collection({
      type: "base",
      name: "league_memberships",
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
        {
          name: "user",
          type: "relation",
          required: true,
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: "role",
          type: "select",
          required: true,
          values: ["COMMISSIONER", "MEMBER"],
          maxSelect: 1,
        },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["INVITED", "ACTIVE", "SUSPENDED", "LEFT"],
          maxSelect: 1,
        },
        { name: "display_name", type: "text", max: 100 },
        { name: "team_name", type: "text", max: 100 },
        { name: "joined_at", type: "date" },
        {
          name: "invited_by",
          type: "relation",
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_memberships_league_user ON league_memberships (league, user)",
        "CREATE INDEX idx_memberships_league_status ON league_memberships (league, status)",
        "CREATE INDEX idx_memberships_user_status ON league_memberships (user, status)",
      ],
    });
    app.save(memberships);

    const seasons = new Collection({
      type: "base",
      name: "seasons",
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
        { name: "year", type: "number", required: true, noDecimal: true },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["SETUP", "ACTIVE", "COMPLETED", "ARCHIVED"],
          maxSelect: 1,
        },
        { name: "started_at", type: "date" },
        { name: "ended_at", type: "date" },
        { name: "regular_win_points", type: "number", required: true },
        { name: "regular_push_points", type: "number", required: true },
        { name: "regular_loss_points", type: "number", required: true },
        { name: "binny_win_points", type: "number", required: true },
        { name: "binny_push_points", type: "number", required: true },
        { name: "binny_loss_points", type: "number", required: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_seasons_league_year ON seasons (league, year)",
        "CREATE INDEX idx_seasons_league_status ON seasons (league, status)",
      ],
    });
    app.save(seasons);

    const weeks = new Collection({
      type: "base",
      name: "weeks",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "season",
          type: "relation",
          required: true,
          collectionId: seasons.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: "number", type: "number", required: true, noDecimal: true },
        { name: "name", type: "text", max: 100 },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["SETUP", "OPEN", "LOCKED", "COMPLETED"],
          maxSelect: 1,
        },
        { name: "start_date", type: "date", required: true },
        { name: "end_date", type: "date", required: true },
        { name: "allow_picks", type: "bool", required: true },
        { name: "max_nfl_picks", type: "number", required: true },
        { name: "max_ncaaf_picks", type: "number", required: true },
        { name: "max_nfl_binny_picks", type: "number", required: true },
        { name: "max_ncaaf_binny_picks", type: "number", required: true },
        { name: "nfl_week_search", type: "text", max: 100 },
        { name: "ncaaf_week_search", type: "text", max: 100 },
        { name: "is_current", type: "bool", required: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_weeks_season_number ON weeks (season, number)",
        "CREATE INDEX idx_weeks_season_status ON weeks (season, status)",
      ],
    });
    app.save(weeks);
  },

  (app) => {
    for (const name of [
      "weeks",
      "seasons",
      "league_memberships",
      "league_requests",
      "leagues",
    ]) {
      app.delete(app.findCollectionByNameOrId(name));
    }
  }
);
