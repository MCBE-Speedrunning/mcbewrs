const cors = require("cors");
const createError = require("http-errors");
const express = require("express");
const minify = require("express-minify");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const fs = require("fs");
const sassMiddleware = require("node-sass-middleware");
const session = require("express-session");

if (process.env.NODE_ENV === "development") {
	var sqlite3 = require("sqlite3").verbose();
	var debug = true;
} else {
	var sqlite3 = require("sqlite3");
	var debug = false;
}
try {
	fs.mkdirSync("./cache/");
} catch (EEXIST) {
	console.log("Cache folder already exists, skipping...");
}
const app = express();
const leaderboard = new sqlite3.Database("./data/leaderboard.db");

const config = JSON.parse(fs.readFileSync("./data/config.json"));

app.set("leaderboard", leaderboard);
app.set("users", []);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
	sassMiddleware({
		src: path.join(__dirname, "public"),
		dest: path.join(__dirname, "public"),
		debug: debug,
		outputStyle: "compressed",
		//indentedSyntax: true, // true = .sass and false = .scss
		sourceMap: true,
	})
);
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 10000, // limit each IP to 10 000 requests per windowMs
	})
);
app.use(minify({ cache: "./cache/" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(
	session({
		resave: false, // don't save session if unmodified
		saveUninitialized: false, // don't create session until something stored
		secret: config.db_secret,
	})
);
app.use(cookieParser());
app.use((req, res, next) => {
	logs = req.app.get("users");
	logs.push({
		ip: req.ip,
		time: Date.now(),
		url: req.url,
	});
	next();
});

app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/api", require("./routes/api"));
app.use("/admin", require("./routes/admin"));
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
