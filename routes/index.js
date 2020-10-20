const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

function timeFormat(duration) {
	// Hours, minutes and seconds
	var hrs = ~~(duration / 3600);
	var mins = ~~((duration % 3600) / 60);
	var secs = ~~duration % 60;

	// Output like "1:01" or "4:03:59" or "123:03:59"
	var ret = "";

	if (hrs > 0) {
		ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
	}

	ret += "" + mins + ":" + (secs < 10 ? "0" : "");
	ret += "" + secs;
	return ret;
}

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { pageName: "Home" });
});

router.get("/home", function (req, res, next) {
	res.redirect("/");
});

router.get("/leaderboard/:cat?", function (req, res, next) {
	const db = req.app.get("leaderboard");

	if (typeof req.params.cat === "undefined") {
		res.render("leaderboardhome");
	}

	db.all(
		"SELECT date, time, name, nationality, platform, version, link FROM runner, pairs, run WHERE runner.rowid = runner_id AND run.rowid = run_id AND category = ? ORDER BY date ASC",
		[req.params.cat],
		function (err, rows) {
			// Calculate the duration of each run
			for (i = 0, len = rows.length; i < len; i++) {
				for (j = i + 1; j <= len; j++) {
					if (j === len) {
						rows[i].duration = Date.now() / 1000 - rows[i].date;
					} else if (rows[j].time != rows[i].time) {
						rows[i].duration = rows[j].date - rows[i].date;
						break;
					}
				}
				// Properly format the runs date, time, and duration
				rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(
					"en-GB"
				);
				rows[i].time = timeFormat(rows[i].time);
				rows[i].duration = Math.trunc(rows[i].duration / 86400);

				if (rows[i].duration === 0) {
					rows[i].duration = "<1";
				}
			}

			res.render("leaderboard", {
				category: req.params.cat,
				leaderboard: rows,
			});
		}
	);
});

router.get("/about", function (req, res, next) {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

module.exports = router;
