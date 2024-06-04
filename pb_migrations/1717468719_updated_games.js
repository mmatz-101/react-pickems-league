/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_GYs99Vg` ON `games` (`game_id`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e69bh90yztf7olv")

  collection.indexes = []

  return dao.saveCollection(collection)
})
