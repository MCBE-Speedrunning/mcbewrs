const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const hash = require("pbkdf2-password")();
const xml = require("xml");
const { safeDump } = require("js-yaml");
const { toToml } = require("tomlify-j0.4");
const jwt = require("jsonwebtoken");
const config = require("../data/config.json");

const leaderboard = new sqlite3.Database("./data/leaderboard.db");
const auth = new sqlite3.Database("./data/auth.db");

// username is in the form { username: "my cool username" }
// ^^the above object structure is completely arbitrary
function generateAccessToken(username) {
	// expires after half and hour (1800 seconds = 30 minutes)
	return jwt.sign(username, config.token_secret, { expiresIn: "1800s" });
}

function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.sendStatus(401); // if there isn't any token

	jwt.verify(token, config.token_secret, (err, user) => {
		console.log(err);
		if (err) return res.sendStatus(403);
		req.user = user;
		next(); // pass the execution off to whatever request the client intended
	});
}

function parseData(req, res, rows) {
	for (let i in rows) {
		for (let j in rows[i]) {
			if (rows[i][j] === "-") {
				rows[i][j] = null;
			}
		}
	}
	switch (req.acceptsLanguages(["json", "xml", "yaml", "toml"])) {
		case "json":
			res.jsonp({ data: rows });
			break;

		case "xml":
			res.set("Content-Type", "text/xml");
			res.send(xml({ data: rows }));
			break;

		case "yaml":
			res.set("Content-Type", "text/yaml");
			res.send(safeDump({ data: rows }));
			break;

		case "toml":
			res.set("Content-Type", "text/toml");
			res.send(toToml({ data: rows }, { space: 4 }));
			break;

		default:
			res.jsonp({ data: rows });
			break;
	}
}

router.get("/history", (req, res) => {
	leaderboard.all(
		"SELECT * FROM runs WHERE rowid >= ? AND rowid <= ?;",
		[req.query.min || 0, req.query.max || 10],
		(err, rows) => {
			if (err) throw err;
			parseData(req, res, rows);
		}
	);
});

router.get("/categories", (req, res) => {
	leaderboard.all(
		"SELECT * FROM categories WHERE rowid >= ? AND rowid <= ?;",
		[req.query.min || 0, req.query.max || 10],
		(err, rows) => {
			if (err) throw err;
			parseData(req, res, rows);
		}
	);
});

router.get("/runners", (req, res) => {
	leaderboard.all(
		"SELECT * FROM runners WHERE rowid >= ? AND rowid <= ?;",
		[req.query.min || 0, req.query.max || 10],
		(err, rows) => {
			if (err) throw err;
			parseData(req, res, rows);
		}
	);
});

router.get("/login", authenticateToken, (req, res) => {
	parseData(req, res, req.user);
});

router.post("/login", (req, res) => {
	auth.get(
		"SELECT * FROM users WHERE username=?; ",
		req.body.username,
		(err, user) => {
			// Query the db for the given username
			if (!user) parseData(req, res, { error: "User not found" });
			// Apply the same algorithm to the POSTed password, applying
			// the hash against the pass / salt, if there is a match we
			// found the user
			hash(
				{ password: req.body.password, salt: user.salt },
				(err, pass, salt, hash) => {
					if (err) parseData(req, res, err);
					if (hash === user.password) {
						const token = generateAccessToken({ username: req.body.username });
						parseData(req, res, { token: token });
						return;
					}
					parseData(req, res, { error: "Wrong passowrd" });
				}
			);
		}
	);
});

module.exports = router;
