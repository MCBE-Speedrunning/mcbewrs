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
		output += hours + ":" + (minutes < 10 ? "0" : "");
	}

	output += minutes + ":" + (seconds < 10 ? "0" : "");
	output += seconds;

	// Check if the time has milliseconds
	if (!isNaN(duration) && duration.toString().indexOf(".") != -1) {
		// Slice off the last digit of the milliseconds
		// Every IL has .0001 added to it to ensure trailing 0's with sqlite3
		output += "." + duration.toString().split(".")[1].slice(0, -1);
	}

	return output;
}

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { pageName: "Home" });
});

router.get("/home", function (req, res, next) {
	res.redirect("/");
});

router.get("/leaderboard/:cat", function (req, res, next) {
	const db = req.app.get("leaderboard");

	if (typeof req.params.cat === "undefined") {
		res.render("leaderboardhome");
	}
});
router.get("/history/:cat?", function (req, res, next) {
	const db = req.app.get("leaderboard");

	// Get recent WRs
	function getRecent(cat_type, callback) {
		db.all(
			"SELECT date, category, readable, link, time, name, nationality FROM runners, runs, pairs, categories WHERE runners.rowid = runner_id AND runs.rowid = run_id AND abbreviation = category AND type = ? ORDER BY date DESC LIMIT 10",
			[cat_type],
			function (err, recent) {
				// For each run, format the date and time appropriately
				for (i = 0, len = recent.length; i < len; i++) {
					recent[i].date = new Date(recent[i].date * 1000).toLocaleDateString(
						req.headers["accept-language"].substr(0, 5) // "en-GB"
					);

					recent[i].time = timeFormat(recent[i].time);
				}

				callback(recent);
			}
		);
	}

	// If no category is specified, go to the history home page
	if (typeof req.params.cat === "undefined") {
		// Get the 10 most recent main world record runs, sorted by date
		getRecent("main", (returnedValue) => {
			main = returnedValue;
		});

		getRecent("il", (returnedValue) => {
			il = returnedValue;
		});

		getRecent("catext", (returnedValue) => {
			catext = returnedValue;
		});

		res.render("historyhome", {
			main: main,
			il: il,
			catext: catext,
		});
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
						res.render("history", {
							category: category.readable,
							history: rows,
						});
					}
				);
			}
		);
	}
});

router.get("/profile/:player?", function (req, res, next) {
	const db = req.app.get("leaderboard");

	db.all(
		"SELECT date, readable, link, time, platform, version FROM runs, categories, pairs WHERE pairs.run_id = runs.rowid AND pairs.runner_id = ? AND runs.category = categories.abbreviation ORDER BY date",
		[req.params.player],
		function (err, runs) {
			for (i = 0, len = runs.length; i < len; i++) {
				runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(
					req.headers["accept-language"].substr(0, 5) // "en-GB"
				);

				runs[i].time = timeFormat(runs[i].time);
			}

			db.get(
				"SELECT COUNT(DISTINCT category) AS count, COUNT(DISTINCT abbreviation) AS total FROM runs, pairs, categories WHERE runs.rowid = run_id AND runner_id = ?",
				[req.params.player],
				function (err, count) {
					unique_cats_count = count.count;
					total_cats = count.total;
				}
			);

			db.get(
				"SELECT name FROM runners WHERE rowid = ?",
				[req.params.player],
				function (err, runner) {
					res.render("profile", {
						player: runner.name,
						current_wrs: 0,
						total_wrs: runs.length,
						unique_cats: unique_cats_count + " / " + total_cats,
						total_duration: 0,
						days_with_wr: 0,
						runs: runs,
					});
				}
			);
		}
	);
});

router.get("/about", function (req, res, next) {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

module.exports = router;
