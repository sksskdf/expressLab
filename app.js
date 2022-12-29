var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const router = express.Router();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

const myLogger = (req, res, next) => {
  console.log("LOGGED");
  next();
};

const requestTime = (req, res, next) => {
  req.requestTime = Date.now();
  next();
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(myLogger);
app.use(requestTime);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/middleware", (req, res) => {
  let reponseText = "Hello World!<br>";
  reponseText += `<small>Requested at: ${req.requestTime}</small`;
  res.send(reponseText);
});

// predicate the router with a check and bail out when needed
router.use((req, res, next) => {
  if (!req.headers["x-auth"]) res.sendStatus(500);
  next();
});

router.get("/user/:id", (req, res) => {
  console.log("a");
});

router.get("/user/:id", (req, res) => {
  console.log("b");
});

// use the router and 401 anything falling through
app.use("/admin", router, (req, res) => {
  res.sendStatus(401);
});

app.use("/error", (req, res) => {
  throw new Error("error occured");
});

app.get(
  "/example/b",
  (req, res, next) => {
    console.log("the response will be sent by the next function ...");
    next();
  },
  (req, res) => {
    res.download("public/images/sad_dog.jpg");
  }
);

router.use((req, res, next) => {
  console.log("Time: ", Date.now());
  next();
});

router.get("/", (req, res) => res.send("about"));

app.use("/time", router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
