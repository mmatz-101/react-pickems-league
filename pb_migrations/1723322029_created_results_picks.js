/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "9657rx9a9lr2mpm",
    "created": "2024-08-10 20:33:49.336Z",
    "updated": "2024-08-10 20:33:49.336Z",
    "name": "results_picks",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "chblvbri",
        "name": "user",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "dgv6z7bs",
        "name": "result_points",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "k1piw5gm",
        "name": "win_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "z9hnfvxm",
        "name": "lost_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "in6qblvq",
        "name": "push_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "e0z4v3ae",
        "name": "fav_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "gihes34n",
        "name": "und_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "bp85cizn",
        "name": "pick_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "37krcgr1",
        "name": "win_percentage",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "zo85yjrs",
        "name": "last_updated",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT \n  (ROW_NUMBER() OVER ()) as id,\n  user,\n  SUM(result_points) as result_points,\n  COUNT(CASE WHEN result_text = 'WIN' THEN 1 END) as win_count,\n  COUNT(CASE WHEN result_text = 'LOST' THEN 1 END) as lost_count,\n  COUNT(CASE WHEN result_text = 'PUSH' THEN 1 END) as push_count,\n  COUNT(CASE WHEN fav_or_und = 'FAV' THEN 1 END) as fav_count,\n  COUNT(CASE WHEN fav_or_und = 'UND' THEN 1 END) as und_count,\n  COUNT(*) as pick_count,\n  ROUND(((CAST(COUNT(CASE WHEN result_text = 'WIN' THEN 1 END) AS REAL) / \n  IFNULL(COUNT(*), 0)) * 100.0), 2) as win_percentage,\n  MAX(updated) as last_updated\nFROM picks\nGROUP BY user\nORDER BY SUM(result_points) DESC"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("9657rx9a9lr2mpm");

  return dao.deleteCollection(collection);
})
