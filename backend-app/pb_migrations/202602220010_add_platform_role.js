// Adds platform-level administration separately from league-level roles.
// The existing commissioner account is the initial platform administrator.

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("_pb_users_auth_");

    users.fields.add(new SelectField({
      name: "platform_role",
      required: false,
      values: ["USER", "PLATFORM_ADMIN"],
      maxSelect: 1,
    }));

    app.save(users);

    const commissioner = app.findRecordById(users, "e92i470xtvcxtz7");
    commissioner.set("platform_role", "PLATFORM_ADMIN");
    app.save(commissioner);
  },

  (app) => {
    const users = app.findCollectionByNameOrId("_pb_users_auth_");
    const commissioner = app.findRecordById(users, "e92i470xtvcxtz7");
    commissioner.set("platform_role", "");
    app.save(commissioner);
    users.fields.removeByName("platform_role");
    app.save(users);
  }
);
