var express = require("express");

var apiRouter = require("./routes/api");
var userRouter = require("./routes/user");

var app = express();

app.use(express.json());
app.use("/public", express.static("/webapp/MM/public"));

app.all("*", (req, res, next) => {
  if (req.get("x-forwarded-proto") == "https") {
    return next();
  }
  res.redirect("https://" + req.hostname + req.originalUrl);
});

app.use("/api", apiRouter);
app.use("/", userRouter);

module.exports = app;
