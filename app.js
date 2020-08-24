var express = require("express");

var apiRouter = require("./routes/api");
var userRouter = require("./routes/user");

var app = express();

app.use(express.json());
app.use("/public", express.static("public"));

app.use("/", userRouter);
app.use("/api", apiRouter);

module.exports = app;