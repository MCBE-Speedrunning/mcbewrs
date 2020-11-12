const express = require("express");
const router = express.Router();
const { getFlag, timeFormat } = require("../utils.js");

/* GET home page. */
router.get("/", (req, res) => {
	res.render("index", { pageName: "Home" });
});

router.get("/home", (req, res) => {
	res.redirect("/");
});

router.get("/history/:cat?", (req, res) => {
	const db = req.app.get("leaderboard");

	// Get recent WRs
	function getRecent(cat_type, callback) {
		db.all(
			"SELECT date, category, readable, link, time, name, nationality FROM runners, runs, pairs, categories WHERE runners.rowid = runner_id AND runs.rowid = run_id AND abbreviation = category AND type = ? ORDER BY date DESC LIMIT 10",
			cat_type,
			function (err, recent) {
				// For each run, format the date and time appropriately
				for (let i in recent) {
					recent[i].date = new Date(recent[i].date * 1000).toLocaleDateString(
						req.headers["accept-language"].substr(0, 5) // "en-GB"
					);

					recent[i].time = timeFormat(recent[i].time);
					recent[i].nationality = getFlag(recent[i].nationality);
				}

				callback(recent);
			}
		);
	}

	// If no category is specified, go to the history home page
	if (typeof req.params.cat === "undefined") {
		// Get the 10 most recent world record runs, for all 3 category types
		getRecent("main", (returned_value) => {
			main = returned_value;
			getRecent("il", (returned_value) => {
				il = returned_value;
				getRecent("catext", (returned_value) => {
					catext = returned_value;
					res.render("historyhome", {
						main: main,
						il: il,
						catext: catext,
					});
				});
			});
		});
	} else {
		// Query all the runs for the specified category, sorted by date
		db.all(
			"SELECT date, time, name, nationality, platform, input, version, seed, link FROM runners, runs, pairs WHERE runners.rowid = runner_id AND runs.rowid = run_id AND category = ? ORDER BY date ASC",
			req.params.cat,
			function (err, rows) {
				// Calculate the duration of each run
				for (i = 0, len = rows.length; i < len; i++) {
					// Check all the more recent records until a faster one is found
					// Can't just check the very next because of the possibility of ties
					for (j = i + 1; j <= len; j++) {
						rows[i].nationality = getFlag(rows[i].nationality);
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

					if (rows[i].duration === 0) rows[i].duration = "<1";
				}

				// Get the category name
				db.get(
					"SELECT readable FROM categories WHERE abbreviation = ?",
					req.params.cat,
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

router.get("/profile/:player?", (req, res) => {
	const db = req.app.get("leaderboard");

	db.all(
		"SELECT date, readable, link, time, platform, version FROM runs, categories, pairs WHERE pairs.run_id = runs.rowid AND pairs.runner_id = ? AND runs.category = categories.abbreviation ORDER BY date",
		req.params.player,
		function (err, runs) {
			for (i = 0, len = runs.length; i < len; i++) {
				runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(
					req.headers["accept-language"].substr(0, 5) // "en-GB"
				);

				runs[i].time = timeFormat(runs[i].time);
			}

			db.get(
				"SELECT COUNT(DISTINCT category) AS count, COUNT(DISTINCT abbreviation) AS total FROM runs, pairs, categories WHERE runs.rowid = run_id AND runner_id = ?",
				req.params.player,
				function (err, count) {
					unique_cats_count = count.count;
					total_cats = count.total;
				}
			);

			db.get(
				"SELECT name FROM runners WHERE rowid = ?",
				req.params.player,
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

router.get("/about", (req, res) => {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

module.exports = router;
