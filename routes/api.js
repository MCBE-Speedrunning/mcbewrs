const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const xml = require("xml");
const { safeDump } = require("js-yaml");
var { toToml } = require("tomlify-j0.4");

const db = new sqlite3.Database("./data/leaderboard.db");

function parseData(req, res, rows) {
	switch (req.headers["content-type"]) {
		case "application/json":
			res.jsonp({ data: rows });
			break;
		case "application/xml":
			res.set("Content-Type", "text/xml");
			res.send(xml({ data: rows }));
			break;
		case "application/yaml":
			res.set("Content-Type", "text/yaml");
			res.send(safeDump({ data: rows }));
			break;
		case "application/toml":
			res.set("Content-Type", "text/toml");
			res.send(toToml({ data: rows }, { space: 4 }));
			break;
		default:
			res.jsonp({ data: rows });
			break;
	}
}

router.get("/history", (req, res) => {
	db.all(
		"SELECT * FROM runs WHERE rowid >= ? AND rowid <= ?;",
		[req.query.min || 0, req.query.max || 10],
		(err, rows) => {
			if (err) throw err;
			parseData(req, res, rows);
		}
	);
});

router.get("/categories", (req, res) => {
	db.all(
		"SELECT * FROM categories WHERE rowid >= ? AND rowid <= ?;",
		[req.query.min || 0, req.query.max || 10],
		(err, rows) => {
			if (err) throw err;
			parseData(req, res, rows);
		}
	);
});

router.get("/runners", (req, res) => {
	db.all(
		"SELECT * FROM runners WHERE rowid >= ? AND rowid <= ?;",
		[req.query.min || 0, req.query.max || 10],
		(err, rows) => {
			if (err) throw err;
			parseData(req, res, rows);
		}
	);
});

module.exports = router;
