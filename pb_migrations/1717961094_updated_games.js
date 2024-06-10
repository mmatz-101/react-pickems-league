/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8txjrziu",
    "name": "league",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "NFL",
        "NCAAF"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8txjrziu",
    "name": "select",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "NFL",
        "NCAAF"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
