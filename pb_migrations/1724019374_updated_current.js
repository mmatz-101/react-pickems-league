/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i2dai3fc",
    "name": "year",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // remove
  collection.schema.removeField("i2dai3fc")

  return dao.saveCollection(collection)
})
