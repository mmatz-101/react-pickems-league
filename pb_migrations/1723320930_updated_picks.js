/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uh2uiqhx",
    "name": "fav_or_und",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "FAV",
        "UND"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  // remove
  collection.schema.removeField("uh2uiqhx")

  return dao.saveCollection(collection)
})
