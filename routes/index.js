const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Convert seconds to human readable time
function timeFormat(duration) {
	const hours = ~~(duration / 3600);
	const minutes = ~~((duration % 3600) / 60);
	const seconds = ~~duration % 60;
	let output = "";

	if (hours > 0) {
		output += "" + hours + ":" + (minutes < 10 ? "0" : "");
	}

	output += "" + minutes + ":" + (seconds < 10 ? "0" : "");
	output += "" + seconds;

	return output;
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

	// If no category is specified, go to the leaderboard home page
	if (typeof req.params.cat === "undefined") {
		// Get the 10 most recent world record runs, sorted by date
		db.all(
			"SELECT date, readable, time, name, nationality FROM runners, runs, pairs, categories WHERE runners.rowid = runner_id AND runs.rowid = run_id AND abbreviation = category ORDER BY date DESC LIMIT 10",
			[],
			function (err, recent) {
				// For each run, format the date and time appropriately
				for (i = 0, len = recent.length; i < len; i++) {
					recent[i].date = new Date(recent[i].date * 1000).toLocaleDateString(
						req.headers["accept-language"].substr(0, 5)
					);

					recent[i].time = timeFormat(recent[i].time);
				}

				res.render("leaderboardhome", {
					recent: recent,
				});
			}
		);
	} else {
		// Query all the runs for the specified category, sorted by date
		db.all(
			"SELECT date, time, name, nationality, platform, version, link FROM runners, runs, pairs WHERE runners.rowid = runner_id AND runs.rowid = run_id AND category = ? ORDER BY date ASC",
			[req.params.cat],
			function (err, rows) {
				// Calculate the duration of each run
				for (i = 0, len = rows.length; i < len; i++) {
					// Check all the more recent records until a faster one is found
					// Can't just check the very next because of the possibility of ties
					for (j = i + 1; j <= len; j++) {
						// Check if the record is current
						if (j === len) {
							rows[i].duration = Date.now() / 1000 - rows[i].date;
						} else if (rows[j].time != rows[i].time) {
							rows[i].duration = rows[j].date - rows[i].date;
							break;
						}
					}

					// Properly format the runs date, time, and duration
					rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(
						req.headers["accept-language"].substr(0, 5) // "en-GB"
					);

					rows[i].time = timeFormat(rows[i].time);
					rows[i].duration = Math.trunc(rows[i].duration / 86400);

					if (rows[i].duration === 0) {
						rows[i].duration = "<1";
					}
				}

				// Get the category name
				db.get(
					"SELECT readable FROM categories WHERE abbreviation = ?",
					[req.params.cat],
					function (err, category) {
						res.render("leaderboard", {
							category: category.name,
							leaderboard: rows,
						});
					}
				);
			}
		);
	}
});

router.get("/about", function (req, res, next) {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

module.exports = router;
