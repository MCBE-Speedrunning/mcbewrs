const express = require("express");
const router = express.Router();

// Thank you vim!
function getFlag(code) {
	switch (code) {
		case "AD":
			return "🇦🇩";
		case "AE":
			return "🇦🇪";
		case "AF":
			return "🇦🇫";
		case "AG":
			return "🇦🇬";
		case "AI":
			return "🇦🇮";
		case "AL":
			return "🇦🇱";
		case "AM":
			return "🇦🇲";
		case "AO":
			return "🇦🇴";
		case "AQ":
			return "🇦🇶";
		case "AR":
			return "🇦🇷";
		case "AS":
			return "🇦🇸";
		case "AT":
			return "🇦🇹";
		case "AU":
			return "🇦🇺";
		case "AW":
			return "🇦🇼";
		case "AX":
			return "🇦🇽";
		case "AZ":
			return "🇦🇿";
		case "BA":
			return "🇧🇦";
		case "BB":
			return "🇧🇧";
		case "BD":
			return "🇧🇩";
		case "BE":
			return "🇧🇪";
		case "BF":
			return "🇧🇫";
		case "BG":
			return "🇧🇬";
		case "BH":
			return "🇧🇭";
		case "BI":
			return "🇧🇮";
		case "BJ":
			return "🇧🇯";
		case "BL":
			return "🇧🇱";
		case "BM":
			return "🇧🇲";
		case "BN":
			return "🇧🇳";
		case "BO":
			return "🇧🇴";
		case "BQ":
			return "🇧🇶";
		case "BR":
			return "🇧🇷";
		case "BS":
			return "🇧🇸";
		case "BT":
			return "🇧🇹";
		case "BV":
			return "🇧🇻";
		case "BW":
			return "🇧🇼";
		case "BY":
			return "🇧🇾";
		case "BZ":
			return "🇧🇿";
		case "CA":
			return "🇨🇦";
		case "CC":
			return "🇨🇨";
		case "CD":
			return "🇨🇩";
		case "CF":
			return "🇨🇫";
		case "CG":
			return "🇨🇬";
		case "CH":
			return "🇨🇭";
		case "CI":
			return "🇨🇮";
		case "CK":
			return "🇨🇰";
		case "CL":
			return "🇨🇱";
		case "CM":
			return "🇨🇲";
		case "CN":
			return "🇨🇳";
		case "CO":
			return "🇨🇴";
		case "CR":
			return "🇨🇷";
		case "CU":
			return "🇨🇺";
		case "CV":
			return "🇨🇻";
		case "CW":
			return "🇨🇼";
		case "CX":
			return "🇨🇽";
		case "CY":
			return "🇨🇾";
		case "CZ":
			return "🇨🇿";
		case "DE":
			return "🇩🇪";
		case "DJ":
			return "🇩🇯";
		case "DK":
			return "🇩🇰";
		case "DM":
			return "🇩🇲";
		case "DO":
			return "🇩🇴";
		case "DZ":
			return "🇩🇿";
		case "EC":
			return "🇪🇨";
		case "EE":
			return "🇪🇪";
		case "EG":
			return "🇪🇬";
		case "EH":
			return "🇪🇭";
		case "ER":
			return "🇪🇷";
		case "ES":
			return "🇪🇸";
		case "ET":
			return "🇪🇹";
		case "FI":
			return "🇫🇮";
		case "FJ":
			return "🇫🇯";
		case "FK":
			return "🇫🇰";
		case "FM":
			return "🇫🇲";
		case "FO":
			return "🇫🇴";
		case "FR":
			return "🇫🇷";
		case "GA":
			return "🇬🇦";
		case "GB":
			return "🇬🇧";
		case "GD":
			return "🇬🇩";
		case "GE":
			return "🇬🇪";
		case "GF":
			return "🇬🇫";
		case "GG":
			return "🇬🇬";
		case "GH":
			return "🇬🇭";
		case "GI":
			return "🇬🇮";
		case "GL":
			return "🇬🇱";
		case "GM":
			return "🇬🇲";
		case "GN":
			return "🇬🇳";
		case "GP":
			return "🇬🇵";
		case "GQ":
			return "🇬🇶";
		case "GR":
			return "🇬🇷";
		case "GS":
			return "🇬🇸";
		case "GT":
			return "🇬🇹";
		case "GU":
			return "🇬🇺";
		case "GW":
			return "🇬🇼";
		case "GY":
			return "🇬🇾";
		case "HK":
			return "🇭🇰";
		case "HM":
			return "🇭🇲";
		case "HN":
			return "🇭🇳";
		case "HR":
			return "🇭🇷";
		case "HT":
			return "🇭🇹";
		case "HU":
			return "🇭🇺";
		case "ID":
			return "🇮🇩";
		case "IE":
			return "🇮🇪";
		case "IL":
			return "🇮🇱";
		case "IM":
			return "🇮🇲";
		case "IN":
			return "🇮🇳";
		case "IO":
			return "🇮🇴";
		case "IQ":
			return "🇮🇶";
		case "IR":
			return "🇮🇷";
		case "IS":
			return "🇮🇸";
		case "IT":
			return "🇮🇹";
		case "JE":
			return "🇯🇪";
		case "JM":
			return "🇯🇲";
		case "JO":
			return "🇯🇴";
		case "JP":
			return "🇯🇵";
		case "KE":
			return "🇰🇪";
		case "KG":
			return "🇰🇬";
		case "KH":
			return "🇰🇭";
		case "KI":
			return "🇰🇮";
		case "KM":
			return "🇰🇲";
		case "KN":
			return "🇰🇳";
		case "KP":
			return "🇰🇵";
		case "KR":
			return "🇰🇷";
		case "KW":
			return "🇰🇼";
		case "KY":
			return "🇰🇾";
		case "KZ":
			return "🇰🇿";
		case "LA":
			return "🇱🇦";
		case "LB":
			return "🇱🇧";
		case "LC":
			return "🇱🇨";
		case "LI":
			return "🇱🇮";
		case "LK":
			return "🇱🇰";
		case "LR":
			return "🇱🇷";
		case "LS":
			return "🇱🇸";
		case "LT":
			return "🇱🇹";
		case "LU":
			return "🇱🇺";
		case "LV":
			return "🇱🇻";
		case "LY":
			return "🇱🇾";
		case "MA":
			return "🇲🇦";
		case "MC":
			return "🇲🇨";
		case "MD":
			return "🇲🇩";
		case "ME":
			return "🇲🇪";
		case "MF":
			return "🇲🇫";
		case "MG":
			return "🇲🇬";
		case "MH":
			return "🇲🇭";
		case "MK":
			return "🇲🇰";
		case "ML":
			return "🇲🇱";
		case "MM":
			return "🇲🇲";
		case "MN":
			return "🇲🇳";
		case "MO":
			return "🇲🇴";
		case "MP":
			return "🇲🇵";
		case "MQ":
			return "🇲🇶";
		case "MR":
			return "🇲🇷";
		case "MS":
			return "🇲🇸";
		case "MT":
			return "🇲🇹";
		case "MU":
			return "🇲🇺";
		case "MV":
			return "🇲🇻";
		case "MW":
			return "🇲🇼";
		case "MX":
			return "🇲🇽";
		case "MY":
			return "🇲🇾";
		case "MZ":
			return "🇲🇿";
		case "NA":
			return "🇳🇦";
		case "NC":
			return "🇳🇨";
		case "NE":
			return "🇳🇪";
		case "NF":
			return "🇳🇫";
		case "NG":
			return "🇳🇬";
		case "NI":
			return "🇳🇮";
		case "NL":
			return "🇳🇱";
		case "NO":
			return "🇳🇴";
		case "NP":
			return "🇳🇵";
		case "NR":
			return "🇳🇷";
		case "NU":
			return "🇳🇺";
		case "NZ":
			return "🇳🇿";
		case "OM":
			return "🇴🇲";
		case "PA":
			return "🇵🇦";
		case "PE":
			return "🇵🇪";
		case "PF":
			return "🇵🇫";
		case "PG":
			return "🇵🇬";
		case "PH":
			return "🇵🇭";
		case "PK":
			return "🇵🇰";
		case "PL":
			return "🇵🇱";
		case "PM":
			return "🇵🇲";
		case "PN":
			return "🇵🇳";
		case "PR":
			return "🇵🇷";
		case "PS":
			return "🇵🇸";
		case "PT":
			return "🇵🇹";
		case "PW":
			return "🇵🇼";
		case "PY":
			return "🇵🇾";
		case "QA":
			return "🇶🇦";
		case "RE":
			return "🇷🇪";
		case "RO":
			return "🇷🇴";
		case "RS":
			return "🇷🇸";
		case "RU":
			return "🇷🇺";
		case "RW":
			return "🇷🇼";
		case "SA":
			return "🇸🇦";
		case "SB":
			return "🇸🇧";
		case "SC":
			return "🇸🇨";
		case "SD":
			return "🇸🇩";
		case "SE":
			return "🇸🇪";
		case "SG":
			return "🇸🇬";
		case "SH":
			return "🇸🇭";
		case "SI":
			return "🇸🇮";
		case "SJ":
			return "🇸🇯";
		case "SK":
			return "🇸🇰";
		case "SL":
			return "🇸🇱";
		case "SM":
			return "🇸🇲";
		case "SN":
			return "🇸🇳";
		case "SO":
			return "🇸🇴";
		case "SR":
			return "🇸🇷";
		case "SS":
			return "🇸🇸";
		case "ST":
			return "🇸🇹";
		case "SV":
			return "🇸🇻";
		case "SX":
			return "🇸🇽";
		case "SY":
			return "🇸🇾";
		case "SZ":
			return "🇸🇿";
		case "TC":
			return "🇹🇨";
		case "TD":
			return "🇹🇩";
		case "TF":
			return "🇹🇫";
		case "TG":
			return "🇹🇬";
		case "TH":
			return "🇹🇭";
		case "TJ":
			return "🇹🇯";
		case "TK":
			return "🇹🇰";
		case "TL":
			return "🇹🇱";
		case "TM":
			return "🇹🇲";
		case "TN":
			return "🇹🇳";
		case "TO":
			return "🇹🇴";
		case "TR":
			return "🇹🇷";
		case "TT":
			return "🇹🇹";
		case "TV":
			return "🇹🇻";
		case "TW":
			return "🇹🇼";
		case "TZ":
			return "🇹🇿";
		case "UA":
			return "🇺🇦";
		case "UG":
			return "🇺🇬";
		case "UM":
			return "🇺🇲";
		case "US":
			return "🇺🇸";
		case "UY":
			return "🇺🇾";
		case "UZ":
			return "🇺🇿";
		case "VA":
			return "🇻🇦";
		case "VC":
			return "🇻🇨";
		case "VE":
			return "🇻🇪";
		case "VG":
			return "🇻🇬";
		case "VI":
			return "🇻🇮";
		case "VN":
			return "🇻🇳";
		case "VU":
			return "🇻🇺";
		case "WF":
			return "🇼🇫";
		case "WS":
			return "🇼🇸";
		case "XK":
			return "🇽🇰";
		case "YE":
			return "🇾🇪";
		case "YT":
			return "🇾🇹";
		case "ZA":
			return "🇿🇦";
		case "ZM":
			return "🇿🇲";
		default:
			return "🏳";
	}
}

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
					recent[i].nationality = getFlag(recent[i].nationality.slice(0, -1));
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
			req.params.cat,
			function (err, rows) {
				// Calculate the duration of each run
				for (i = 0, len = rows.length; i < len; i++) {
					// Check all the more recent records until a faster one is found
					// Can't just check the very next because of the possibility of ties
					for (j = i + 1; j <= len; j++) {
						rows[i].nationality = getFlag(rows[i].nationality.slice(0, -1));
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
