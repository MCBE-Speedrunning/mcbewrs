import express, {NextFunction, Request, Response} from "express";
import fs from "fs";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import path from "path";
import hashFunc from "pbkdf2-password";
import sqlite3 from "sqlite3";
import xml from "xml";
import {stringify} from "yaml";

const hash = hashFunc();
const router = express.Router();
const leaderboard = new sqlite3.Database(path.join(__dirname, "..", "data", "leaderboard.db"));
const auth = new sqlite3.Database(path.join(__dirname, "..", "data", "auth.db"));
const config =
    JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "config.json"), "utf-8"));
/*
 * username is in the form { username: "my cool username" }
 * ^^the above object structure is completely arbitrary
 */
function generateAccessToken(username: string) {
	// Expires after half and hour (1800 seconds = 30 minutes)
	return jwt.sign({username}, config.token_secret, {expiresIn: "1800s"});
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
	// Gather the jwt access token from the request header
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	// If there isn't any token
	if (token == null)
		return res.sendStatus(401);

	jwt.verify(token, config.token_secret, (err: any, user: any) => {
		if (err)
			return next(err);
		req.user = user;
		// Pass the execution off to whatever request the client intended
		next();
	});
}

function parseData(req: Request, res: Response, rows: any) {
	for (let i in rows)
		for (let j in rows[i])
			if (rows[i][j] === "-")
				try {
					rows[i][j] = null;
				} catch (TypeError) {}

	switch (req.acceptsLanguages(["json", "xml", "yaml", "toml"])) {
		case "xml":
			res.set("Content-Type", "text/xml");
			res.send(xml({data: rows}));
			break;

		case "yaml":
			res.set("Content-Type", "text/yaml");
			res.send(stringify({data: rows}));
			break;

		default:
			res.jsonp({data: rows});
			break;
	}
}

router.get("/history", (req, res) => {
	leaderboard.all("SELECT * FROM runs WHERE id BETWEEN ? AND ?",
	    [req.query.min || 0, req.query.max || 10], (err, rows) => {
		    if (err)
			    throw err;
		    parseData(req, res, rows);
	    });
});

router.get("/categories", (req, res) => {
	leaderboard.all("SELECT * FROM categories WHERE id BETWEEN ? AND ?",
	    [req.query.min || 0, req.query.max || 10], (err, rows) => {
		    if (err)
			    throw err;
		    parseData(req, res, rows);
	    });
});

router.get("/runners", (req, res, next) => {
	leaderboard.all("SELECT * FROM runners WHERE id BETWEEN ? and ?",
	    [req.query.min || 0, req.query.max || 10], (err, rows) => {
		    if (err)
			    return next(err);
		    parseData(req, res, rows);
	    });
});

router.get("/login", authenticateToken, (req, res) => { parseData(req, res, req.user); });

router.post("/login", (req, res, next) => {
	auth.get("SELECT * FROM users WHERE username = ?", req.body.username, (err, user) => {
		if (err)
			return next(err);
		// Query the db for the given username
		if (!user)
			return next(createError(403, "User not found"));
		// Apply the same algorithm to the POSTed password, applying
		// the hash against the pass / salt, if there is a match we
		// found the user
		hash({password: req.body.password, salt: user.salt},
		    (err: Error, _pass: string, _salt: string, hash: string) => {
			    if (err)
				    return next(err);

			    if (hash === user.password) {
				    const token = generateAccessToken(req.body.username);
				    parseData(req, res, {token: token});
				    return;
			    }

			    parseData(req, res, {error: "Wrong passowrd"});
		    });
	});
});

router.post("/run/add", authenticateToken, (req, res, next) => {
	const run = req.body;
	// Multiple runners can be input by seperating them with ,
	run.runners = run.runners.trim().split(",");
	// Convert html date format to epoch ms then convert to seconds
	run.date = new Date(run.date).valueOf() / 1000;

	// All input from the client comes as a string, so everything must be parsed as an int
	run.time = parseInt(run.hour, 10) * 60 * 60 + parseInt(run.minutes, 10) * 60
	           + parseInt(run.seconds, 10);

	// Add 0.0001 to the end of runs that time with milliseconds
	// This ensures that the site will display 3 significant figures
	if (parseInt(run.milliseconds, 10))
		run.time += parseInt(run.milliseconds, 10) / 1000 + 0.0001;

	leaderboard.serialize(() => {
		leaderboard.run("INSERT INTO runs VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		    [
			    run.category_id,
			    run.date,
			    run.time,
			    // Run duration
			    0,
			    run.platform,
			    run.seed,
			    run.version,
			    run.input,
			    run.link,
			    // WR flag
			    0,
		    ],
		    (err) => {
			    if (err)
				    return next(err);
		    });

		// Prevents DoS
		if (!(run.runners instanceof Array))
			return [];

		// Insert the run/runner pairs
		for (let i = 0; i < run.runners.length; i++)
			leaderboard.run(`INSERT INTO pairs VALUES(
										(SELECT MAX(id) FROM runs),
										(SELECT id FROM runners WHERE name = ?)
								)`,
			    [run.runners[i]], (err) => {
				    if (err)
					    return next(err);
			    });

		// Update the WR flags
		leaderboard.run(`UPDATE runs
						SET wr = CASE WHEN time = (
								SELECT time FROM runs
								WHERE category_id = ?
								ORDER BY time ASC LIMIT 1
						)
						THEN 1 ELSE 0
						END`,
		    [run.category_id], (err) => {
			    if (err)
				    return next(err);
		    });

		// Calculate the duration of each run in the category just updated
		leaderboard.all(`SELECT id, date, time FROM runs
						WHERE category_id = ?
						ORDER BY date ASC`,
		    [run.category_id], (err, rows) => {
			    if (err)
				    return next(err);
			    for (let i = 0, len = rows.length; i < len; i++) {
				    // Check every newer record until a faster one is found
				    // Can't just check the very next because of ties
				    for (let j = i + 1; j <= len; j++) {
					    // Check if the record is current
					    if (j === len) {
						    rows[i].duration = Date.now() / 1000 - rows[i].date;
					    } else if (rows[j].time != rows[i].time) {
						    rows[i].duration = rows[j].date - rows[i].date;
						    break;
					    }
				    }

				    // Add the runs duration to the DB
				    leaderboard.run(`UPDATE runs SET duration = ? WHERE id = ?`,
				        [rows[i].duration, rows[i].id], (err) => {
					        if (err)
						        return next(err);
				        });
			    }
		    });

		leaderboard.all("SELECT * FROM categories", (err, rows) => {
			if (err)
				return next(err);
			res.render("admin_add", {
				banner: {
					text: "Run added succesfully",
					status: "success",
					csrfToken: req.csrfToken(),
				},
				categories: rows,
				csrfToken: req.csrfToken(),
			});
		});
	});
});

export default router;
