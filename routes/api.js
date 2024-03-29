// Packages
const express = require("express");
const router = express.Router();

const fs = require("fs");

const multer = require("multer");
const upload = multer();

// Mongo
const MongoClient = require("mongodb").MongoClient;
const mongo_url = "mongodb://site181982:Ko9sheeg@mongo_site181982";
const mongo_dbName = "techweb";

// Middlewares
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/", function (req, res, next) {
  res.send("Api page - you shouldn't be here.");
});

router.post("/stories/new", (req, res) => {
  insertOne("stories", req.body).then((data) => res.send(data.result));
});

router.post("/missions/new", (req, res) => {
  insertOne("missions", req.body).then((data) => res.send(data.result));
});

router.post("/activities/new", (req, res) => {
  insertOne("activities", req.body).then((data) => res.send(data.result));
});

router.post("/stories/delete", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("stories");
    collection.findOneAndDelete({ key: req.body.key }).then((response) => {
      res.send(response.result);
      client.close();
    });
  });
});

router.post("/missions/delete", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("missions");
    collection.findOneAndDelete({ key: req.body.key }).then((response) => {
      res.send(response.result);
      client.close();
    });
  });
});

router.post("/activities/delete", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("activities");
    collection.findOneAndDelete({ key: req.body.key }).then((response) => {
      res.send(response.result);
      client.close();
    });
  });
});

router.post("/stories/edit", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("stories");
    collection
      .updateOne(
        { key: req.body.key },
        {
          $set: {
            title: req.body.title,
            paths: req.body.paths,
            settings: req.body.settings,
          },
        }
      )
      .then((response) => {
        res.send(response.result);
        client.close();
      });
  });
});

router.post("/missions/edit", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("missions");
    collection
      .updateOne(
        { key: req.body.key },
        {
          $set: {
            title: req.body.title,
            activities: req.body.activities,
            first_activity: req.body.first_activity,
          },
        }
      )
      .then((response) => {
        res.send(response.result);
        client.close();
      });
  });
});

router.post("/activities/edit", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("activities");
    collection
      .updateOne(
        { key: req.body.key },
        {
          $set: {
            title: req.body.title,
            elements: req.body.elements,
            time: req.body.time,
          },
        }
      )
      .then((response) => {
        res.send(response.result);
        client.close();
      });
  });
});

router.get("/stories", (req, res) => {
  find("stories", req.query).then((response) => res.send(response));
});

router.get("/missions", (req, res) => {
  find("missions", req.query).then((response) => res.send(response));
});

router.get("/activities", (req, res) => {
  find("activities", req.query).then((response) => res.send(response));
});

// Fetch iniziale del tutor
router.get("/tutor", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .findOne({
        game_key: req.query.game_key,
      })
      .then((response, error) => {
        res.send(response);
        client.close();
      });
  });
});

// Creazione nuova partita
router.post("/tutor", (req, res) => {
  insertOne("games", {
    story_key: req.query.story_key,
    game_key: req.query.game_key,
    players: [],
  }).then(() => res.send());
});

// Fetch dei dati dei giocatori
router.get("/tutor/update", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .findOne({
        game_key: req.query.game_key,
      })
      .then((response, error) => {
        res.send(response);
        client.close();
      });
  });
});

// Tutor aggiorna i dati dei giocatori
router.post("/tutor/update", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .findOne({
        game_key: req.query.game_key,
      })
      .then((response, error) => {
        let db_index = findPlayer(req.query.player_id, response.players).index;
        collection
          .updateOne(
            { game_key: req.query.game_key },
            {
              $set: {
                ["players." + db_index.toString() + ".name"]: req.body.name,
              },
            }
          )
          .then(() => {
            res.send();
          });
        client.close();
      });
  });
});

// Player esegue l'update dello status
router.post("/player/update", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .findOne({
        game_key: req.query.game_key,
      })
      .then((response, error) => {
        let db_index = findPlayer(req.query.player_id, response.players).index;
        let root_str = "players." + db_index.toString() + ".";
        collection
          .updateOne(
            { game_key: req.query.game_key },
            {
              $set: {
                [root_str + "status"]: req.body.status,
                [root_str + "mission_points"]: req.body.mission_points,
                [root_str + "mission_activities"]: req.body.mission_activities,
                [root_str + "total_points"]: req.body.total_points,
                [root_str + "total_activities"]: req.body.total_activities,
                [root_str + "time"]: req.body.time,
              },
            }
          )
          .then(() => {
            res.send();
          });
      });
  });
});

// Chiamata solo una volta all'apertura del player
router.get("/player", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .findOne({
        game_key: req.query.game_key,
      })
      .then((response, error) => {
        if (!error)
          res.send(findPlayer(req.query.player_id, response.players).player);
        else res.sendStatus(400);
        client.close();
      });
  });
});

// Chiamata alla creazione di un nuovo player
router.post("/player", (req, res) => {
  MongoClient.connect(mongo_url, (err, client) => {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .findOne({
        game_key: req.query.game_key,
      })
      .then((response, error) => {
        if (error || response.story_key != req.query.story_key) {
          res.send({ ok: false });
        } else {
          response.players.push({
            id: req.query.player_id,
            name: req.query.player_id,
            status: {
              path: null,
              mission: null,
              activity: null,
              // tempo impiegato per l'attività corrente
              time_stuck: 0,
            },
            // tempo totale di gioco
            time: 0,
            // punti della missione corrente
            mission_points: 0,
            // attività visitate nella missione corrente
            mission_activities: 0,
            // punti totali
            total_points: 0,
            // attività visitate totali
            total_activities: 0,
          });
          collection
            .updateOne(
              { game_key: req.query.game_key },
              {
                $set: {
                  players: response.players,
                },
              }
            )
            .then(() => {
              res.send({ ok: true });
            });
        }
      });
  });
});

router.post("/uploadPhoto", upload.single("photo"), (req, res) => {
  try {
    let data = req.file.buffer;
    let type;
    let dir_path;
    if (req.file.mimetype.includes("image/")) {
      type = req.file.mimetype.replace("image/", "");
      dir_path = "/webapp/MM/public/uploads/images";
    } else if (req.file.mimetype.includes("video/")) {
      type = req.file.mimetype.replace("video/", "");
      dir_path = "/webapp/MM/public/uploads/videos";
    } else {
      throw "Mimetype Error";
    }
    let data_path = dir_path + "/" + Date.now() + "." + type;
    if (!fs.existsSync(dir_path)) fs.mkdirSync(dir_path); // check folder existance
    fs.writeFile(data_path, data, "base64", (err) => {
      if (err) {
        console.log(err);
        throw "Write File Error";
      }
    }); // save photo
    let response_path = data_path.replace(
      "/webapp/MM/public",
      "https://site181982.tw.cs.unibo.it/public"
    );
    res.send({ path: response_path });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/resetGames", (req, res) => {
  MongoClient.connect(mongo_url, function (err, client) {
    let mongo_db = client.db(mongo_dbName);
    let collection = mongo_db.collection("games");
    collection
      .deleteMany({
        game_key: req.query.game_key,
      })
      .then(() => {
        res.send("Games successfully removed.");
      });
  });
});

/* GET test route */
router.get("/testing", function (req, res, next) {
  res.send("Test route");
});

// Inserisce l'elemento nella collezione, ritornando il risultato dell'inserimento
function insertOne(collection_name, element) {
  return new Promise((resolve, reject) => {
    try {
      MongoClient.connect(mongo_url, (err, client) => {
        if (err) throw "Connection Error";
        let mongo_db = client.db(mongo_dbName);
        let collection = mongo_db.collection(collection_name);
        collection.insertOne(element).then((response) => {
          client.close();
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
      reject();
    }
  });
}

// Trova e ritrna un array contenente gli elementi corrispondenti alla query
function find(collection_name, query = null) {
  return new Promise((resolve, reject) => {
    try {
      MongoClient.connect(mongo_url, (err, client) => {
        if (err) throw "Connection Error";
        let mongo_db = client.db(mongo_dbName);
        let collection = mongo_db.collection(collection_name);
        collection
          .find(query)
          .toArray()
          .then((response, data_error) => {
            if (data_error) throw "Operation Error";
            client.close();
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
      reject();
    }
  });
}

// Ritorna l'oggetto player se trovato nella partita
function findPlayer(player_id, players) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id == player_id)
      return {
        player: players[i],
        index: i,
      };
  }
  return null;
}

module.exports = router;
