const compression = require("compression");
const cors = require("cors");
const createError = require("http-errors");
const csurf = require("csurf");
const express = require("express");
const fs = require("fs");
const logger = require("morgan");
const minify = require("express-minify");
const path = require("path");
const rateLimit = require("express-rate-limit");
const sass = require("./utils/sass-middleware.js");
const session = require("express-session");
const xml = require("xml");
const { safeDump } = require("js-yaml");
const { toToml } = require("tomlify-j0.4");

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
const config = JSON.parse(fs.readFileSync("./data/config.json"));
const leaderboard = new sqlite3.Database("./data/leaderboard.db");
const cache = {};

function parseError(req, res, err) {
	switch (req.acceptsLanguages(["json", "xml", "yaml", "toml"])) {
		case "json":
			res.status(err.status).jsonp({ error: err });
			break;

		case "xml":
			res.set("Content-Type", "text/xml");
			res.status(err.status).send(xml({ error: err }));
			break;

		case "yaml":
			res.set("Content-Type", "text/yaml");
			res.status(err.status).send(safeDump({ error: err }));
			break;

		case "toml":
			res.set("Content-Type", "text/toml");
			res.status(err.status).send(toToml({ error: err }, { space: 4 }));
			break;

		default:
			res.status(err.status).jsonp({ error: err });
			break;
	}
}
app.set("leaderboard", leaderboard);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(sass);
app.use(
	// Limit each IP to 10,000 requests per 15 minutes
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 10000,
	})
);
app.use(minify({ cache: "./cache/" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(
	session({
		// Don't save session if unmodified
		resave: false,
		// Don't create session until something stored
		saveUninitialized: false,
		secret: config.db_secret,
	})
);
app.use(csurf({ cookie: false }));

app.use("/", require("./routes/index"));
app.use("/api", require("./routes/api"));
app.use("/admin", require("./routes/admin"));
// Catch 404 and forward to error handler
app.use(function (_req, _res, next) {
	next(createError(404));
});

// Error handler
app.use(function (err, req, res, _next) {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = debug ? err : {};

	if (req.path.includes("/api")) {
		parseError(req, res, err);
	} else {
		// Render the error page
		res.status(err.status || 500);
		res.render("error");
	}
});

module.exports = app;
