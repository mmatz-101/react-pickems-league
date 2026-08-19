// Enables authenticated pick creation through the new league context. The
// server action remains responsible for limits, kickoff checks, and spread
// snapshots; this rule enforces league-team ownership and week membership.

migrate(
  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    picks.fields.getByName("user_team").required = false;
    picks.createRule = "@request.auth.id != '' && league_team.league_team_members_via_league_team.membership.user ?= @request.auth.id && week_record.season.league.league_memberships_via_league.user ?= @request.auth.id && week_record.allow_picks = true";
    picks.updateRule = null;
    picks.deleteRule = null;
    app.save(picks);
  },

  (app) => {
    const picks = app.findCollectionByNameOrId("picks");
    picks.createRule = null;
    picks.updateRule = null;
    picks.deleteRule = null;
    picks.fields.getByName("user_team").required = true;
    app.save(picks);
  }
);
