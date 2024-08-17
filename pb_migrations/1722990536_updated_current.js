/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wm2swlow",
    "name": "max_ncaaf_binny_picks",
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

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uqm2enkn",
    "name": "max_nfl_binny_picks",
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
  collection.schema.removeField("wm2swlow")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uqm2enkn",
    "name": "max_binny_buy",
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
})
