import compression from "compression";
import cors from "cors";
import express, {NextFunction, Request, Response} from "express";
import minify from "express-minify";
import rateLimit from "express-rate-limit";
import session from "express-session";
import fs from "fs";
import createError, {HttpError} from "http-errors";
import logger from "morgan";
import path from "path";
import xml from "xml";
import {stringify} from "yaml";

// Routes
import adminRouter from "./routes/admin";
import apiRouter from "./routes/api";
import indexRouter from "./routes/index";

const debug = process.env.NODE_ENV === "development";

try {
	fs.mkdirSync("./cache/");
} catch (EEXIST) { console.log("Cache folder already exists, skipping..."); }

const app = express();
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "config.json"), "utf-8"));
const logger_options = {
	stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
		flags: "a",
	}),
};

function parseError(req: Request, res: Response, err: HttpError) {
	switch (req.acceptsLanguages(["json", "xml", "yaml", "toml"])) {
		case "xml":
			res.set("Content-Type", "text/xml");
			res.status(err.status).send(xml({error: err}));
			break;

		case "yaml":
			res.set("Content-Type", "text/yaml");
			res.status(err.status).send(stringify({error: err}));
			break;

		default:
			res.status(err.status).jsonp({error: err});
			break;
	}
}

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
if (debug)
	app.use(logger("dev", logger_options));
else
	app.use(logger("common", logger_options));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(compression());

// Limit each IP to 10,000 requests per 15 minutes
app.use(rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10000,
}));
app.use(minify({cache: "./cache/"}));
if (debug)
	app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(session({
	// Don't save session if unmodified
	resave: false,
	// Don't create session until something stored
	saveUninitialized: false,
	secret: config.db_secret,
}));

// Global variables to be accessed by pug templates
app.use((req, res, next) => {
	res.locals.full_url = req.url;
	next();
});

app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);
// Catch 404 and forward to error handler
app.use((_req, _res, next) => { next(createError(404)); });

// Error handler
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = debug ? err : {};

	// Render the error page
	if (req.path.includes("/api"))
		parseError(req, res, err);
	else
		res.status(err.status || 500).render("error");
});

export default app;
