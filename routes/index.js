const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/leaderboard.db");
const {
	getFlag,
	timeFormat,
	durationFormat,
} = require("../utils/functions.js");

/*
 * Home page
 */
router.get("/", (req, res, next) => {
	/*
	 * Get the 10 most recent world records
	 * for each of the category types
	 */
	function getRecent(cat_type, callback) {
		db.all(
			`SELECT
                date, abbreviation, readable, link, time,
				name, nationality, runner_id FROM runs
            INNER JOIN
                categories ON categories.id = runs.category_id
                AND categories.type = ?
            INNER JOIN
                pairs ON pairs.run_id = runs.id
            INNER JOIN
                runners ON runners.id = pairs.runner_id
            ORDER BY date DESC LIMIT 10`,
			[cat_type],
			(err, recent) => {
				if (err) next(err);
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
			`SELECT
                date, time, name, nationality, platform,
                input, version, seed, duration, link,
				runner_id FROM runs
            INNER JOIN
                pairs ON pairs.run_id = runs.id
            INNER JOIN
                runners ON runners.id = pairs.runner_id
                AND runs.category_id = (
                    SELECT id FROM categories
                    WHERE abbreviation = ?
                )
            ORDER BY date ASC`,
			[req.params.cat],
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
					`SELECT readable FROM categories
                    WHERE abbreviation = ?`,
					[req.params.cat],
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
		`SELECT abbreviation, date, readable, link, time,
        platform, version, duration, wr FROM runs
        INNER JOIN
            pairs ON pairs.run_id = runs.id
            AND pairs.runner_id = ?
        INNER JOIN
            categories ON categories.id = runs.category_id
        ORDER BY date`,
		[req.params.player],
		(err, runs) => {
			if (err) next(err);
			let current_wrs = 0;
			let total_duration = 0;
			let timestamps = [];
			let beg_end_flags = [];

			for (i = 0, len = runs.length; i < len; i++) {
				// Store the beginning and end of each wr
				const beg = {
					date: runs[i].date,
					beg: 1,
				};

				const end = {
					date: runs[i].date + runs[i].duration,
					beg: 0,
				};

				timestamps.push(beg, end);

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

			timestamps.sort((a, b) => {
				return a.date - b.date;
			});

			console.log(timestamps);

			// https://canary.discord.com/channels/574267523869179904/574268036052156416/781707906428043264
			let beg_time = (total_time = 0);
			let beg_count = (end_count = 0);

			for (let i = 0, len = timestamps.length; i < len; i++) {
				if (timestamps[i].beg) {
					if (beg_count++ === 0) beg_time = timestamps[i].date;
				} else {
					if (beg_count === ++end_count) {
						total_time += timestamps[i].date - beg_time;
						beg_count = 0;
						end_count = 0;
					}
				}
			}

			total_time = durationFormat(total_time);
			const leaderboard_age = durationFormat(new Date() / 1000 - 1548098280);
			const wr_percentage = ((total_time / leaderboard_age) * 100).toFixed(2);
			const time_with_wr = `${total_time} / ${leaderboard_age} (${wr_percentage}%)`;

			// Get the number of unique categories the player has had records in
			db.get(
				`SELECT COUNT(DISTINCT category_id) AS count,
                    COUNT(DISTINCT abbreviation) AS total
                FROM runs
                INNER JOIN
                    pairs ON pairs.run_id = runs.id
                    AND pairs.runner_id = ?
                INNER JOIN categories`,
				req.params.player,
				(err, count) => {
					if (err) next(err);
					unique_cats_count = count.count;
					total_cats = count.total;

					// Get the runners name and nationality, then render the page
					db.get(
						`SELECT name, nationality FROM runners
                        WHERE id = ?`,
						[req.params.player],
						(err, runner) => {
							if (err) next(err);
							res.render("profile", {
								player: runner.name,
								nationality: getFlag(runner.nationality),
								current_wrs: current_wrs,
								total_wrs: runs.length,
								unique_cats: unique_cats_count + " / " + total_cats,
								total_duration: durationFormat(total_duration),
								time_with_wr: time_with_wr,
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
