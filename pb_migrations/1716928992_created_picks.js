/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ln5hiw4cx3y78ed",
    "created": "2024-05-28 20:43:12.702Z",
    "updated": "2024-05-28 20:43:12.702Z",
    "name": "picks",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "thqq7ltq",
        "name": "user",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "3u02eotv",
        "name": "week",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 20,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "bmhgyzwk",
        "name": "team_selected",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "HOME",
            "AWAY"
          ]
        }
      },
      {
        "system": false,
        "id": "7ig9upwh",
        "name": "result_points",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "0yxboedz",
        "name": "result_text",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "WIN",
            "PUSH",
            "LOST"
          ]
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": "@request.auth.id != \"\" && @request.auth.id = @request.data.user",
    "createRule": "@request.auth.id != \"\" && @request.auth.id = @request.data.user",
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed");

  return dao.deleteCollection(collection);
})
