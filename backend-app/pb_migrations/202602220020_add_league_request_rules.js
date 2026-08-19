// League requests are the only new collection that normal authenticated users
// may create directly. Activation and review remain platform-admin-only.

migrate(
  (app) => {
    const requests = app.findCollectionByNameOrId("league_requests");

    requests.listRule = "@request.auth.id != '' && (requester = @request.auth.id || @request.auth.platform_role = 'PLATFORM_ADMIN')";
    requests.viewRule = requests.listRule;
    requests.createRule = "@request.auth.id != '' && requester = @request.auth.id && status = 'PENDING'";
    requests.updateRule = "@request.auth.platform_role = 'PLATFORM_ADMIN'";
    requests.deleteRule = "@request.auth.platform_role = 'PLATFORM_ADMIN'";

    app.save(requests);
  },

  (app) => {
    const requests = app.findCollectionByNameOrId("league_requests");
    requests.listRule = null;
    requests.viewRule = null;
    requests.createRule = null;
    requests.updateRule = null;
    requests.deleteRule = null;
    app.save(requests);
  }
);
