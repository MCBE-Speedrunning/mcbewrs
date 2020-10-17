const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { pageName: "Home" });
});

router.get("/home", function (req, res, next) {
	res.redirect("/");
});

router.get("/leaderboard", function (req, res, next) {
	const db = req.app.get("leaderboard");
	db.all("SELECT rowid, * FROM runner", function (err, rows) {
		res.render("leaderboard", {
			pageName: "Leaderboard",
			leaderboard: rows,
		});
	});
});

router.get("/about", function (req, res, next) {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

module.exports = router;
