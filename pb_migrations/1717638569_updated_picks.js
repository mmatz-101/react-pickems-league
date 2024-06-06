/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  collection.viewRule = ""
  collection.createRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ln5hiw4cx3y78ed")

  collection.viewRule = "@request.auth.id != \"\" && @request.auth.id = @request.data.user"
  collection.createRule = "@request.auth.id != \"\" && @request.auth.id = @request.data.user"

  return dao.saveCollection(collection)
})
