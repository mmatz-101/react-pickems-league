/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("84nd1w0ojnpwcwa")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_k9cW8LN` ON `teams` (`name`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("84nd1w0ojnpwcwa")

  collection.indexes = []

  return dao.saveCollection(collection)
})
