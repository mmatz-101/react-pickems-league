/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "epy7olyp",
    "name": "game",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "e69bh90yztf7olv",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  // remove
  collection.schema.removeField("epy7olyp")

  return dao.saveCollection(collection)
})
