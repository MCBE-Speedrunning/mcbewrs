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
	res.render("leaderboard", {
		pageName: "Leaderboard",
		leaderboard: req.app.get("leaderboard"),
	});
});

router.get("/about", function (req, res, next) {
    res.render("about", {
        pageName: "About MCBEWRS",
    });
});

module.exports = router;
