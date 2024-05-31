/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v1ixctuh",
    "name": "allow_picks",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // remove
  collection.schema.removeField("v1ixctuh")

  return dao.saveCollection(collection)
})
