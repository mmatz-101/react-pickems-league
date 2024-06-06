/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gfn0td7l",
    "name": "pick_type",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "REGULAR",
        "BINNY"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  // remove
  collection.schema.removeField("gfn0td7l")

  return dao.saveCollection(collection)
})
