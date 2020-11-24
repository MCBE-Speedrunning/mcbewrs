const express = require("express");
const router = express.Router();
const {
	getFlag,
	timeFormat,
	durationFormat,
} = require("../utils/functions.js");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/leaderboard.db");

/*
 * Home page
 */
router.get("/", (req, res) => {
	/*
	 * Get the 10 most recent world records
	 * for each of the category types
	 */
	function getRecent(cat_type, callback) {
		db.all(
			"SELECT date, category, readable, link, time, name, nationality \
			FROM runners, runs, pairs, categories 							\
			WHERE runners.rowid = runner_id 								\
			AND runs.rowid = run_id 										\
			AND abbreviation = category 									\
			AND type = ? 													\
			ORDER BY date DESC LIMIT 10",
			cat_type,
			(err, recent) => {
				// For each run, format the date and time appropriately
				for (let i in recent) {
					switch (req.acceptsLanguages(["en-GB", "en-US", "en", "es-ES"])) {
						case "en-GB":
							recent[i].date = new Date(
								recent[i].date * 1000
							).toLocaleDateString("en-GB");
							break;

						case "en-US":
							recent[i].date = new Date(
								recent[i].date * 1000
							).toLocaleDateString("en");
							break;

						case "es-ES":
							recent[i].date = new Date(
								recent[i].date * 1000
							).toLocaleDateString("es-ES");
							break;

						default:
							recent[i].date = new Date(
								recent[i].date * 1000
							).toLocaleDateString("en");
							break;
					}

					recent[i].time = timeFormat(recent[i].time);
					recent[i].nationality = getFlag(recent[i].nationality);
				}

				callback(recent);
			}
		);
	}

	// Get the 10 most recent world record runs, for all 3 category types
	getRecent("main", (returned_value) => {
		main = returned_value;
		getRecent("il", (returned_value) => {
			il = returned_value;
			getRecent("catext", (returned_value) => {
				catext = returned_value;
				res.render("index", {
					main: main,
					il: il,
					catext: catext,
				});
			});
		});
	});
});

router.get("/home", (req, res) => {
	res.redirect("/");
});

/*
 * World record history
 */
router.get("/history/:cat?", (req, res) => {
	const db = req.app.get("leaderboard");

	// If no category is specified, go to the history home page
	if (typeof req.params.cat === "undefined") {
		res.render("historyhome");
	} else {
		// Query all the runs for the specified category, sorted by date
		db.all(
			"SELECT date, time, name, nationality, platform, input, version, seed, duration link \
			FROM runners, runs, pairs 															 \
			WHERE runners.rowid = runner_id 													 \
			AND runs.rowid = run_id 															 \
			AND category = ? 																	 \
			ORDER BY date ASC",
			req.params.cat,
			(err, rows) => {
				for (i = 0, len = rows.length; i < len; i++) {
					rows[i].nationality = getFlag(rows[i].nationality);

					// Properly format the runs date, time, and duration
					switch (req.acceptsLanguages(["en-GB", "en-US", "en", "es-ES"])) {
						case "en-GB":
							rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(
								"en-GB"
							);
							break;

						case "en-US":
							rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(
								"en"
							);
							break;

						case "es-ES":
							rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(
								"es-ES"
							);
							break;

						default:
							rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(
								"en"
							);
							break;
					}

					rows[i].time = timeFormat(rows[i].time);
					rows[i].duration = Math.trunc(rows[i].duration / 86400);

					if (rows[i].duration === 0) rows[i].duration = "<1";
				}

				// Get the category name
				db.get(
					"SELECT readable FROM categories WHERE abbreviation = ?",
					req.params.cat,
					(err, category) => {
						if (err) throw err;
						if (!category) res.send("No category found");
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

/*
 * Player profiles
 */
router.get("/profile/:player?", (req, res) => {
	const db = req.app.get("leaderboard");

	// Get all the players runs
	db.all(
		"SELECT date, readable, link, time, platform, version, duration, wr \
		FROM runs, categories, pairs 										\
		WHERE pairs.run_id = runs.rowid 									\
		AND pairs.runner_id = ? 											\
		AND runs.category = categories.abbreviation 						\
		ORDER BY date",
		req.params.player,
		(err, runs) => {
			let current_wrs = 0;
			let total_duration = 0;

			for (i = 0, len = runs.length; i < len; i++) {
				// Format the date according to the users browser settings
				switch (req.acceptsLanguages(["en-GB", "en-US", "en", "es-ES"])) {
					case "en-GB":
						runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(
							"en-GB"
						);
						break;

					case "en-US":
						runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(
							"en"
						);
						break;

					case "es-ES":
						runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(
							"es-ES"
						);
						break;

					default:
						runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(
							"en"
						);
						break;
				}

				// Update stats, and format the runs time and duration
				total_duration += runs[i].duration;

				runs[i].time = timeFormat(runs[i].time);
				runs[i].duration = durationFormat(runs[i].duration);

				if (runs[i].wr === 1) current_wrs++;
			}

			// Get the number of unique categories the player has had records in
			db.get(
				"SELECT COUNT(DISTINCT category) AS count, COUNT(DISTINCT abbreviation) AS total \
				FROM runs, pairs, categories 													 \
				WHERE runs.rowid = run_id 													   	 \
				AND runner_id = ?",
				req.params.player,
				(err, count) => {
					unique_cats_count = count.count;
					total_cats = count.total;

					// Get the runners name and render the page
					db.get(
						"SELECT name FROM runners WHERE rowid = ?",
						req.params.player,
						(err, runner) => {
							res.render("profile", {
								player: runner.name,
								current_wrs: current_wrs,
								total_wrs: runs.length,
								unique_cats: unique_cats_count + " / " + total_cats,
								total_duration: durationFormat(total_duration),
								runs: runs,
							});
						}
					);
				}
			);
		}
	);
});

/*
 * About page
 */
router.get("/about", (req, res) => {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

module.exports = router;
