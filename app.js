const createError = require("http-errors");
const express = require("express");
const minify = require("express-minify");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const sassMiddleware = require("node-sass-middleware");
const fs = require("fs");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const apiRouter = require("./routes/api");
const adminRouter = require("./routes/admin");

const app = express();

app.set("users", []);

const valiadator = {
	get: (target, key) => {
		if (typeof target[key] === "object" && target[key] !== null) {
			return new Proxy(target[key], valiadator);
		}
		return target[key] || undefined;
	},
	set: (target, key, value) => {
		if (typeof target[key] === "object" && target[key] !== null) {
			return new Proxy(target[key], valiadator);
		}
		console.log(`${key} set to ${value}`);
		target[key] = value;
		fs.writeFile(
			"./data/leaderboard.json",
			JSON.stringify(app.get("leaderboard"), null, (space = "\t")),
			(err) => {}
		);
		return true;
	},
	deleteProperty: (target, key) => {
		let output = delete target[key];
		fs.writeFile(
			"./data/leaderboard.json",
			JSON.stringify(app.get("leaderboard"), null, (space = "\t")),
			(err) => {}
		);
		return output;
	},
};

fs.readFile("./data/leaderboard.json", (err, data) => {
	data = JSON.parse(data);
	dataProxy = new Proxy(data, valiadator);
	app.set("leaderboard", dataProxy);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(
	sassMiddleware({
		src: path.join(__dirname, "public"),
		dest: path.join(__dirname, "public"),
		debug: true,
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
app.use(minify({ cache: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
	logs = req.app.get("users");
	logs.push({
		ip: req.ip,
		time: Date.now(),
		url: req.url,
	});
	next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);
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
