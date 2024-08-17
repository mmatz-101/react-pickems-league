/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("84nd1w0ojnpwcwa")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i9cwf1v6",
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
  const collection = dao.findCollectionByNameOrId("84nd1w0ojnpwcwa")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i9cwf1v6",
    "name": "league",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "NFL",
        "NCAA"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
