/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "axe5kyfm7kgd8no",
    "created": "2024-05-28 20:12:53.970Z",
    "updated": "2024-05-28 20:12:53.970Z",
    "name": "current",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "mtzgkcnu",
        "name": "week",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no");

  return dao.deleteCollection(collection);
})
