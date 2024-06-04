/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "iz0htes7",
    "name": "game_id",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  // remove
  collection.schema.removeField("iz0htes7")

  return dao.saveCollection(collection)
})
