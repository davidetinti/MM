var express = require("express");
var router = express.Router();
var path = require("path");

/* MONK setup */
var monk = require("monk");
const { response } = require("express");
var user = "davide";
var passw = "zJRJBT3skYKKVWaw";
var dbName = "techweb";
//const url = "mongodb://127.0.0.1:27017";
var url =
    "mongodb+srv://" +
    user +
    ":" +
    passw +
    "@clustertw.wi8xg.gcp.mongodb.net/" +
    dbName +
    "?retryWrites=true&w=majority";
var db = monk(url);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

/* GET api homapage */
router.get("/", function (req, res, next) {
    res.send("api page");
});

/* CREATE a new story */
router.post("/stories/new", (req, res) => {
    db.get("stories")
        .insert(req.body)
        .then((response) => res.send(response));
});

router.post("/missions/new", (req, res) => {
    db.get("missions")
        .insert(req.body)
        .then((response) => res.send(response));
});

router.post("/activities/new", (req, res) => {
    db.get("activities")
        .insert(req.body)
        .then((response) => res.send(response));
});

/* DELETE a story */
router.post("/stories/delete", (req, res) => {
    db.get("stories")
        .findOneAndDelete({ key: req.body.key })
        .then((response) => res.send(response));
});

router.post("/missions/delete", (req, res) => {
    db.get("missions")
        .findOneAndDelete({ key: req.body.key })
        .then((response) => res.send(response));
});

router.post("/activities/delete", (req, res) => {
    db.get("activities")
        .findOneAndDelete({ key: req.body.key })
        .then((response) => res.send(response));
});

/* REPLACE/EDIT a story */
router.post("/stories/edit", (req, res) => {
    db.get("stories")
        .update(
            { key: req.body.key },
            {
                $set: {
                    title: req.body.title,
                    paths: req.body.paths,
                    settings: req.body.settings,
                },
            }
        )
        .then((response) => res.send(response));
});

router.post("/missions/edit", (req, res) => {
    db.get("missions")
        .update(
            { key: req.body.key },
            {
                $set: {
                    title: req.body.title,
                    activities: req.body.activities,
                    player: req.body.player,
                    first_activity: req.body.first_activity,
                },
            }
        )
        .then((response) => res.send(response));
});

router.post("/activities/edit", (req, res) => {
    db.get("activities")
        .update(
            { key: req.body.key },
            {
                $set: {
                    title: req.body.title,
                    elements: req.body.elements,
                    player: req.body.player,
                    correct: req.body.correct,
                    wrong: req.body.wrong,
                },
            }
        )
        .then((response) => res.send(response));
});

/* GET stories data */
router.get("/stories", (req, res) => {
    db.get("stories")
        .find(req.query)
        .then((response) => {
            res.send(response);
        });
});

router.get("/missions", (req, res) => {
    db.get("missions")
        .find(req.query)
        .then((response) => {
            res.send(response);
        });
});

router.get("/activities", (req, res) => {
    db.get("activities")
        .find(req.query)
        .then((response) => {
            res.send(response);
        });
});

router.get("/tutor", (req, res) => {
    db.get("games")
        .insert({
            story_key: req.query.story_key,
            game_key: req.query.game_key,
            players: [],
        })
        .then(() => res.send());
});

router.get("/player", (req, res) => {
    db.get("games")
        .find({
            game_key: req.query.game_key,
        })
        .then((response) => {
            if (response.length == 1) {
                console.log(response[0]);
                response[0].players.push({
                    player_id: req.query.player_id,
                });
                db.get("games")
                    .update(
                        { game_key: req.query.game_key },
                        {
                            $set: {
                                players: response[0].players,
                            },
                        }
                    )
                    .then(() => {
                        res.send({ ok: true });
                    });
            } else res.send({ ok: false });
        });
});

router.get("/update", (req, res) => {
    db.get("games")
        .find({
            game_key: req.query.game_key,
        })
        .then((response) => res.send(response));
});

module.exports = router;
