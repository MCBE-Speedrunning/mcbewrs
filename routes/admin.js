const express = require("express");
const hash = require("pbkdf2-password")();
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");

const router = express.Router();
const db = new sqlite3.Database("./data/auth.db");

const leaderboard = new sqlite3.Database("./data/leaderboard.db");

/*
 * Add a new user to the DB
 */
function newUser(username, password, fn) {
	hash({ password: password }, (err, _pass, salt, hash) => {
		if (err) return fn(new Error("Error during hashing"));
		// Store the salt & hash in the "db"
		db.run(
			`INSERT INTO users VALUES(?, ?, ?)`,
			[username, hash, salt],
			(err) => {
				if (err) return fn(new Error("Error during insertion"));
			}
		);
	});
}

/*
 * Restrict access to the admin page
 */
function restrict(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		req.session.error = "Access denied!";
		res.redirect("/admin/login");
	}
}

/*
 * User authentication
 */
function authenticate(name, pass, fn) {
	db.get("SELECT * FROM users WHERE username = ?", name, (err, user) => {
		if (err) return fn(err);
		// Query the db for the given username
		if (!user) return fn(new Error("cannot find user"));
		// Apply the same algorithm to the POSTed password, applying
		// the hash against the pass / salt, if there is a match we
		// found the user
		hash({ password: pass, salt: user.salt }, (err, _pass, _salt, hash) => {
			if (err) return fn(err);
			if (hash === user.password) return fn(null, user);
			fn(new Error("invalid password"));
		});
	});
}

router.get("/login", (req, res) => {
	res.render("login", { session: req.session, csrfToken: req.csrfToken() });
});

router.post("/login", (req, res, next) => {
	authenticate(req.body.username, req.body.password, (err, user) => {
		if (err) return next(err);
		if (user) {
			// Regenerate session when signing in
			// to prevent fixation
			req.session.regenerate(() => {
				// Store the user's primary key
				// in the session store to be retrieved,
				// or in this case the entire user object
				req.session.user = user;
				req.session.success = `Welcome, ${user.username}!`;
				res.redirect("back");
			});
		} else {
			req.session.error = `Authentication failed, please check your username and password.`;
			res.redirect("/admin/login");
		}
	});
});

router.get("/logout", (req, res) => {
	// Destroy the user's session to log them out;
	// will be re-created next request
	req.session.destroy(() => {
		res.redirect("/admin/login");
	});
});

router.get("/register", restrict, (_req, res) => {
	res.render("register", { csrfToken: req.csrfToken() });
});

router.post("/register", restrict, (req, res) => {
	newUser(req.body.username, req.body.password, (err) => {
		res.render("register", { err: err });
	});

	res.render("login", { session: req.session, csrfToken: req.csrfToken() });
});

router.get("/add", restrict, (req, res, next) => {
	leaderboard.all("SELECT * FROM categories", (err, rows) => {
		if (err) return next(err);
		res.render("admin_add", {
			categories: rows,
			csrfToken: req.csrfToken(),
		});
	});
});

router.post("/add", restrict, (req, res, next) => {
	const run = req.body;
	// Multiple runners can be input by seperating them with ,
	run.runners = run.runners.trim().split(",");
	// Convert html date format to epoch ms then convert to seconds
	run.date = new Date(run.date).valueOf() / 1000;

	// All input from the client comes as a string, so everything must be parsed as an int
	run.time =
		parseInt(run.hour, 10) * 60 * 60 +
		parseInt(run.minutes, 10) * 60 +
		parseInt(run.seconds, 10);

	// Add 0.0001 to the end of runs that time with milliseconds
	// This ensures that the site will display 3 significant figures
	if (parseInt(run.milliseconds, 10))
		run.time += parseInt(run.milliseconds, 10) / 1000 + 0.0001;

	leaderboard.serialize(() => {
		leaderboard.run(
			"INSERT INTO runs VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				run.category_id,
				run.date,
				run.time,
				// Run duration
				0,
				run.platform,
				run.seed,
				run.version,
				run.input,
				run.link,
				// WR flag
				0,
			],
			(err) => {
				if (err) return next(err);
			}
		);

		// Prevents DoS
		if (!(run.runners instanceof Array)) return [];

		// Insert the run/runner pairs
		for (let i = 0; i < run.runners.length; i++)
			leaderboard.run(
				`INSERT INTO pairs VALUES(
										(SELECT MAX(id) FROM runs),
										(SELECT id FROM runners WHERE name = ?)
								)`,
				[run.runners[i]],
				(err) => {
					if (err) return next(err);
				}
			);

		// Update the WR flags
		leaderboard.run(
			`UPDATE runs
						SET wr = CASE WHEN time = (
								SELECT time FROM runs
								WHERE category_id = ?
								ORDER BY time ASC LIMIT 1
						)
						THEN 1 ELSE 0
						END`,
			[run.category_id],
			(err) => {
				if (err) return next(err);
			}
		);

		// Calculate the duration of each run in the category just updated
		leaderboard.all(
			`SELECT id, date, time FROM runs
						WHERE category_id = ?
						ORDER BY date ASC`,
			[run.category_id],
			(err, rows) => {
				if (err) return next(err);
				for (let i = 0, len = rows.length; i < len; i++) {
					// Check every newer record until a faster one is found
					// Can't just check the very next because of ties
					for (let j = i + 1; j <= len; j++) {
						// Check if the record is current
						if (j === len) {
							rows[i].duration = Date.now() / 1000 - rows[i].date;
						} else if (rows[j].time != rows[i].time) {
							rows[i].duration = rows[j].date - rows[i].date;
							break;
						}
					}

					// Add the runs duration to the DB
					leaderboard.run(
						`UPDATE runs SET duration = ? WHERE id = ?`,
						[rows[i].duration, rows[i].id],
						(err) => {
							if (err) return next(err);
						}
					);
				}
			}
		);

		leaderboard.all("SELECT * FROM categories", (err, rows) => {
			if (err) return next(err);
			res.render("admin_add", {
				banner: {
					text: "Run added succesfully",
					status: "success",
					csrfToken: req.csrfToken(),
				},
				categories: rows,
				csrfToken: req.csrfToken(),
			});
		});
	});
});

router.post("/new_user", restrict, (req, _res) => {
	if (req.body.name) name = req.body.name;
	nationality = req.body.nationality || null;
	db.run(
		`INSERT INTO runners (name, nationality) VALUES(?, ?)`,
		[name, nationality],
		(err) => {
			if (err) return next(err);
			res.render("new_user", {
				banner: {
					text: "Runner added succesfully",
					status: "success",
					csrfToken: req.csrfToken(),
				},
			});
		}
	);
});

router.get("/pull", restrict, (_req, res, next) => {
	exec("git pull", (err, _stdout, stderr) => {
		if (err) return next(err);
		res.send(`Pulling complete \n ${stderr}`);
	});
});

module.exports = router;
