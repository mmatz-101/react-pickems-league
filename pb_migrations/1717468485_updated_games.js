/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  collection.indexes = []

  // remove
  collection.schema.removeField("nhn3hry8")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_WeOjrLM` ON `games` (`game_id`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nhn3hry8",
    "name": "game_id",
    "type": "text",
    "required": true,
    "presentable": true,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
