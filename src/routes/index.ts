import express from "express";
import createError from "http-errors";
import path from "path";
import sqlite3 from "sqlite3";

import {durationFormat, getFlag, timeFormat} from "../utils/functions";

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, "..", "data", "leaderboard.db"));

/*
 * Home page
 */
router.get("/", (req, res, next) => {
	/*
	 * Get the 10 most recent world records for
	 * each of the category types. Also this function
	 * actually ends up returning an array that
	 * contains strings and numbers, but it does so
	 * with weird callback magic that I stole from
	 * duckduckgo. In typical TypeScript fashion I
	 * am now forced to lie about the true return type.
	 */
	function getRecent(cat_type: string, callback: (val: (string|number)[]) => void): void {
		db.all(`SELECT
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
		    [cat_type], (err, recent) => {
			    if (err)
				    return next(err);

			    const locale = req.acceptsLanguages([
				    "en-GB",
				    "en-US",
				    "en-ES",
				    "en",
			    ]);

			    // For each run, format the date and time appropriately
			    for (let i = 0; i < recent.length; i++) {
				    if (recent[i] === undefined)
					    continue;

				    if (recent[i + 1] !== undefined && recent[i].link === recent[i + 1].link) {
					    recent[i].name = `${recent[i].name} & ${recent[i + 1].name}`;
					    recent[i].nationality = `${getFlag(recent[i].nationality)} ${
							getFlag(recent[i + 1].nationality)}`;
					    delete recent[i + 1];
				    } else {
					    recent[i].nationality = getFlag(recent[i].nationality);
				    }

				    recent[i].time = timeFormat(recent[i].time);
				    recent[i].date =
				        new Date(recent[i].date * 1000).toLocaleDateString(locale || "en-GB");
			    }
			    callback(recent);
		    });
	}

	// Get the 10 most recent world record runs, for all 3 category types
	getRecent("main", (returned_value) => {
		const main = returned_value;
		getRecent("il", (returned_value) => {
			const il = returned_value;
			getRecent("catext", (returned_value) => {
				const catext = returned_value;
				res.render("index", {
					main: main,
					il: il,
					catext: catext,
				});
			});
		});
	});
});

router.get("/home", (_req, res) => { res.redirect("/"); });

/*
 * Category select
 */
router.get("/catselect/:type?", (req, res, next) => {
	// If no type is specified, go to the history home page
	if (typeof req.params.type === "undefined") {
		res.render("history_home");
	} else {
		// Query all the records for the specified cat type
		db.all(`SELECT
				abbreviation, readable, link, time,
				runner_id, name, nationality, date,
				platform, input, version, seed, duration
			FROM runs
			INNER JOIN
				pairs ON pairs.run_id = runs.id
			INNER JOIN
				runners ON runners.id = pairs.runner_id
			INNER JOIN
				categories ON categories.id = runs.category_id
				AND categories.type = ?
			WHERE wr = 1
			ORDER BY corder`,
		    [req.params.type], (err, records) => {
			    if (err)
				    return next(err);

			    const locale = req.acceptsLanguages([
				    "en-GB",
				    "en-US",
				    "es-ES",
				    "en",
			    ]);

			    for (let i = 0, len = records.length; i < len; i++) {
				    records[i].nationality = getFlag(records[i].nationality);
				    records[i].time = timeFormat(records[i].time);
				    records[i].duration = Math.trunc(records[i].duration / 86400);
				    records[i].date =
				        new Date(records[i].date * 1000).toLocaleDateString(locale || "en-GB");

				    if (records[i].duration === 0)
					    records[i].duration = "<1";
			    }

			    // Set the title for the page
			    if (req.params.type === "main")
				    const type = "Full Game";
			    else if (req.params.type === "il")
				    const type = "Individual Level";
			    else
				    const type = "Category Extension";

			    res.render("cat_select", {
				    type: type,
				    records: records,
			    });
		    });
	}
});

/*
 * World record history
 */
router.get("/history/:cat?", (req, res, next) => {
	// If no category is specified, go to the history home page
	if (typeof req.params.cat === "undefined") {
		res.render("history_home");
	} else {
		// Query all the runs for the specified category, sorted by date
		db.all(`SELECT
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
		    [req.params.cat], (err, rows) => {
			    if (err)
				    return next(err);

			    const locale = req.acceptsLanguages([
				    "en-GB",
				    "en-US",
				    "es-ES",
				    "en",
			    ]);

			    for (let i = 0, len = rows.length; i < len; i++) {
				    if (rows[i] === undefined)
					    continue;

				    if (rows[i + 1] !== undefined && rows[i].link === rows[i + 1].link) {
					    rows[i].name = `${rows[i].name} & ${rows[i + 1].name}`;
					    rows[i].nationality =
					        `${getFlag(rows[i].nationality)} ${getFlag(rows[i + 1].nationality)}`;
					    delete rows[i + 1];
					    console.log(rows[i]);
				    } else {
					    rows[i].nationality = getFlag(rows[i].nationality);
				    }

				    if (rows[i].duration === 0)
					    rows[i].duration = "<1";

				    rows[i].time = timeFormat(rows[i].time);
				    rows[i].duration = Math.trunc(rows[i].duration / 86400);
				    rows[i].date =
				        new Date(rows[i].date * 1000).toLocaleDateString(locale || "en-GB");
			    }

			    // Get the category name
			    db.get(`SELECT readable FROM categories
					WHERE abbreviation = ?`,
			        [req.params.cat], (err, category) => {
				        if (err)
					        throw err;
				        if (!category)
					        res.send("No category found");

				        res.render("history", {
					        category: category.readable,
					        history: rows,
				        });
			        });
		    });
	}
});

/*
 * Player profiles
 */
router.get("/profile/:player?", (req, res, next) => {
	if (!req.params.player)
		return next(createError(501, "Page not ready"));
	// Get all the players runs
	db.all(`SELECT abbreviation, date, readable, link, time,
		platform, version, duration, wr FROM runs
		INNER JOIN
			pairs ON pairs.run_id = runs.id
			AND pairs.runner_id = ?
		INNER JOIN
			categories ON categories.id = runs.category_id
		ORDER BY date`,
	    [req.params.player], (err, runs) => {
		    if (err)
			    return next(err);
		    let current_wrs = 0;
		    let total_duration = 0;
		    let timestamps: {date: number; beg: number}[] = [];

		    const locale = req.acceptsLanguages([
			    "en-GB",
			    "en-US",
			    "en-ES",
			    "en",
		    ]);

		    for (let i = 0, len = runs.length; i < len; i++) {
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
			    runs[i].date = new Date(runs[i].date * 1000).toLocaleDateString(locale || "en-GB");

			    // Update stats, and format the runs time and duration
			    total_duration += runs[i].duration;

			    runs[i].time = timeFormat(runs[i].time);
			    runs[i].duration = durationFormat(runs[i].duration);

			    if (runs[i].wr === 1)
				    current_wrs++;
		    }

		    timestamps.sort((a, b) => { return a.date - b.date; });

		    // https://canary.discord.com/channels/574267523869179904/574268036052156416/781707906428043264
		    let beg_time = 0, total_time: number|string = 0, beg_count = 0, end_count = 0;

		    for (let i = 0, len = timestamps.length; i < len; i++) {
			    if (timestamps[i].beg) {
				    if (beg_count++ === 0)
					    beg_time = timestamps[i].date;
			    } else {
				    if (beg_count === ++end_count) {
					    total_time += timestamps[i].date - beg_time;
					    beg_count = end_count = 0;
				    }
			    }
		    }

		    total_time = durationFormat(total_time);
		    const leaderboard_age = durationFormat(new Date().valueOf() / 1000 - 1548098280);

		    /*
		     * There is actually no need to check if `leaderboard_age`
		     * is not equal to "<1" because we know the leaderboard has
		     * been around for over a day (I've been there!), but alas,
		     * Microsoft is a bitch and won't give us alternative ways
		     * to shut up errors, so now I need to try to sleep at night
		     * knowing that my code is just a little bit less efficient.
		     *
		     * Please just give me a good language D:
		     */
		    let wr_percentage: string;
		    if (typeof total_time === "number" && typeof leaderboard_age === "number")
			    wr_percentage = ((total_time / leaderboard_age) * 100).toFixed(2);
		    else
			    wr_percentage = "00";

		    const time_with_wr = `${total_time} / ${leaderboard_age} (${wr_percentage}%)`;

		    // Get the number of unique categories the player has had records in
		    db.get(`SELECT COUNT(DISTINCT category_id) AS count,
					COUNT(DISTINCT abbreviation) AS total
				FROM runs
				INNER JOIN
					pairs ON pairs.run_id = runs.id
					AND pairs.runner_id = ?
				INNER JOIN categories`,
		        req.params.player, (err, count) => {
			        if (err)
				        return next(err);
			        let unique_cats_count = count.count;
			        let total_cats = count.total;

			        // Get the runners name and nationality, then render the
			        // page
			        db.get(`SELECT name, nationality FROM runners
						WHERE id = ?`,
			            [req.params.player], (err, runner) => {
				            if (err)
					            return next(err);
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
			            });
		        });
	    });
});

/*
 * About page
 */
router.get("/about", (_req, res) => {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

export default router;
