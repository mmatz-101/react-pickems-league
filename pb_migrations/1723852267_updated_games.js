/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "opdwzxcf",
    "name": "home_team",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "84nd1w0ojnpwcwa",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ymmw5oty",
    "name": "away_team",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "84nd1w0ojnpwcwa",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  // remove
  collection.schema.removeField("opdwzxcf")

  // remove
  collection.schema.removeField("ymmw5oty")

  return dao.saveCollection(collection)
})
