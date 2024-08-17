/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dqcofkrg",
    "name": "regular_point_value",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "c3z7gkbx",
    "name": "binny_point_value",
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
  collection.schema.removeField("dqcofkrg")

  // remove
  collection.schema.removeField("c3z7gkbx")

  return dao.saveCollection(collection)
})
