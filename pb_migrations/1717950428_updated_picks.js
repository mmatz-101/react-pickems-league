/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  collection.indexes = [
    "CREATE INDEX `idx_WI2nlKg` ON `picks` (\n  `user`,\n  `game`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  collection.indexes = []

  return dao.saveCollection(collection)
})
