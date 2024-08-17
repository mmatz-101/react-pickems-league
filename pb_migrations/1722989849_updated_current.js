/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tm4tjxhw",
    "name": "max_nfl_picks",
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
    "id": "aljljzlh",
    "name": "max_ncaaf_picks",
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
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("axe5kyfm7kgd8no")

  // remove
  collection.schema.removeField("tm4tjxhw")

  // remove
  collection.schema.removeField("aljljzlh")

  // remove
  collection.schema.removeField("uqm2enkn")

  return dao.saveCollection(collection)
})
