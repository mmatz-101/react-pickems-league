// Creates league invite records. Raw invite tokens are never stored; the
// acceptance workflow will store only a hash of each token.

migrate(
  (app) => {
    const leagues = app.findCollectionByNameOrId("leagues");
    const users = app.findCollectionByNameOrId("_pb_users_auth_");

    const invites = new Collection({
      type: "base",
      name: "league_invites",

      // Members may not enumerate invite records. Commissioners can see
      // invites for their own league.
      listRule: "@request.auth.id != '' && league.league_memberships_via_league.user ?= @request.auth.id && league.league_memberships_via_league.role ?= 'COMMISSIONER'",
      viewRule: "@request.auth.id != '' && league.league_memberships_via_league.user ?= @request.auth.id && league.league_memberships_via_league.role ?= 'COMMISSIONER'",

      // Invite creation/update/deletion will be performed through protected
      // server actions, not direct client writes.
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
          name: "created_by",
          type: "relation",
          required: true,
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: "token_hash",
          type: "text",
          required: true,
          max: 128,
        },
        { name: "expires_at", type: "date" },
        { name: "max_uses", type: "number", noDecimal: true },
        { name: "use_count", type: "number", noDecimal: true },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["ACTIVE", "REVOKED", "EXPIRED"],
          maxSelect: 1,
        },
      ],

      indexes: [
        "CREATE UNIQUE INDEX idx_league_invites_token_hash ON league_invites (token_hash)",
        "CREATE INDEX idx_league_invites_league_status ON league_invites (league, status)",
      ],
    });

    app.save(invites);
  },

  (app) => {
    app.delete(app.findCollectionByNameOrId("league_invites"));
  }
);
