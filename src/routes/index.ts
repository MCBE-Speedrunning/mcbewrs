import express from "express";
import createError from "http-errors";
import path from "path";
import {Database, open} from "sqlite";
import sqlite3 from "sqlite3";

import Runs from "../types/runs";
import {durationFormat, getFlag, timeFormat} from "../utils/functions";

const router = express.Router();
let db: Database<sqlite3.Database, sqlite3.Statement>;

// Open the database
(async () => {db = await open({
	filename: path.join(__dirname, "..", "data", "leaderboard.db"),
	driver: sqlite3.cached.Database
})})();

/*
 * Home page
 */
router.get("/", async (req, res, next) => {
	async function getRecent(cat_type: string): Promise<any[]> {
		const recent = await db.all(`SELECT
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
		    cat_type);
		const locale = req.acceptsLanguages([
			"en-GB",
			"en-US",
			"en-ES",
			"en",
		]);

		// For each run, format the date and time appropriately
		for (let i = 0, len = recent.length; i < len; i++) {
			if (recent[i] === undefined)
				continue;

			// Support coop runs
			if (recent[i + 1] !== undefined && recent[i].link === recent[i + 1].link) {
				recent[i].name = `${recent[i].name} & ${recent[i + 1].name}`;
				recent[i].nationality = `${getFlag(recent[i].nationality)} ${
					getFlag(recent[i + 1].nationality)}`;
				delete recent[i + 1];
			} else {
				recent[i].nationality = getFlag(recent[i].nationality);
			}

			recent[i].time = timeFormat(recent[i].time);
			recent[i].date = new Date(recent[i].date * 1000).toLocaleDateString(locale || "en-GB");
		}
		return recent;
	}

	// Get the 10 most recent world record runs, for all 3 category types
	res.render("index", {
		main: await getRecent("main"),
		il: await getRecent("il"),
		catext: await getRecent("catext"),
	});
});

router.get("/home", (_req, res) => { res.redirect("/"); });

/*
 * Category select
 */
router.get("/catselect/:type?", async (req, res, next) => {
	let runType: string;
	let runTypeTitle: string;
	switch (req.params.type) {
	case "il":
		runType = "il";
		runTypeTitle = "Individual Level";
		break;
	case "catext":
		runType = "catext";
		runTypeTitle = "Category Extension";
		break;
	default: // Default to Full Game
		runType = "main";
		runTypeTitle = "Full Game";
		break;
	}

	// Query all the records for the specified cat type
	const records = await db.all(`SELECT
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
	    runType);
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
		records[i].date = new Date(records[i].date * 1000).toLocaleDateString(locale || "en-GB");

		if (records[i].duration === 0)
			records[i].duration = "<1";
	}

	res.render("cat_select", {
		pageTitle: runTypeTitle,
		records: records,
	});
});

/*
 * World record history
 */
router.get("/history/:cat?", async (req, res, next) => {
	// If no category is specified, go to the history home page
	if (typeof req.params.cat === "undefined") {
		res.render("history_home");
	} else {
		// Query all the runs for the specified category, sorted by date
		const rows = await db.all(`SELECT
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
		    req.params.cat);
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
				rows[i].nationality = `${getFlag(rows[i].nationality)} ${
					getFlag(rows[i + 1].nationality)}`;
				delete rows[i + 1];
				console.log(rows[i]);
			} else {
				rows[i].nationality = getFlag(rows[i].nationality);
			}

			rows[i].time = timeFormat(rows[i].time);
			rows[i].duration = durationFormat(rows[i].duration);
			rows[i].date = new Date(rows[i].date * 1000).toLocaleDateString(locale || "en-GB");
		}

		// Get the category name
		const category = await db.get(`SELECT readable FROM categories
					WHERE abbreviation = ?`,
		    req.params.cat);
		if (!category)
			res.send("No category found");

		res.render("history", {
			category: category.readable,
			history: rows,
		});
	}
});

/*
 * Player profiles
 */
router.get("/profile/:player?", async (req, res, next) => {
	if (!req.params.player)
		return next(createError(501, "Page not ready"));
	// Get all the players runs
	const runs = await db.all(`SELECT abbreviation, date, readable, link, time,
		platform, version, duration, wr FROM runs
		INNER JOIN
			pairs ON pairs.run_id = runs.id
			AND pairs.runner_id = ?
		INNER JOIN
			categories ON categories.id = runs.category_id
		ORDER BY date`,
	    req.params.player);
	let current_wrs = 0;
	let total_duration = 0;
	let timestamps: Runs.Timestamp[] = [];

	const locale = req.acceptsLanguages([
		"en-GB",
		"en-US",
		"en-ES",
		"en",
	]);

	for (let i = 0, len = runs.length; i < len; i++) {
		// Store the beginning and end of each wr
		const beg: Runs.Timestamp = {
			date: runs[i].date,
			beg: 1,
		};

		const end: Runs.Timestamp = {
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
	let beg_time: number = 0, total_time: Runs.Duration = 0;
	let beg_count: number = 0, end_count: number = 0;

	for (let i in timestamps) {
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
	const count = await db.get(`SELECT COUNT(DISTINCT category_id) AS count,
					COUNT(DISTINCT abbreviation) AS total
				FROM runs
				INNER JOIN
					pairs ON pairs.run_id = runs.id
					AND pairs.runner_id = ?
				INNER JOIN categories`,
	    req.params.player);
	let unique_cats_count = count.count;
	let total_cats = count.total;

	// Get the runners name and nationality, then render the
	// page
	const runner = await db.get(`SELECT name, nationality FROM runners
						WHERE id = ?`,
	    req.params.player);
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

/*
 * Admin page
 */
router.get("/admin", (req, res) => { res.redirect("/admin/portal"); });

/*
 * About page
 */
router.get("/about", (_req, res) => {
	res.render("about", {
		pageName: "About MCBEWRS",
	});
});

export default router;
