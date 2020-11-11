const express = require("express");
const hash = require("pbkdf2-password")();
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");

const router = express.Router();
const db = new sqlite3.Database("./data/auth.db");

const leaderboard = new sqlite3.Database("./data/leaderboard.db");

function newUser(username, password, fn) {
	hash({ password: password }, (err, pass, salt, hash) => {
		if (err) return fn(new Error("Error during hashing"));
		// store the salt & hash in the "db"
		db.run(
			`INSERT INTO users VALUES(?, ?, ?); `,
			[username, hash, salt],
			(err) => {
				if (err) return fn(new Error("Error during insertion"));
			}
		);
	});
}

function restrict(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		req.session.error = "Access denied!";
		res.redirect("/admin/login");
	}
}

function authenticate(name, pass, fn) {
	db.get("SELECT * FROM users WHERE username=?; ", name, (err, user) => {
		// Query the db for the given username
		if (!user) return fn(new Error("cannot find user"));
		// Apply the same algorithm to the POSTed password, applying
		// the hash against the pass / salt, if there is a match we
		// found the user
		hash({ password: pass, salt: user.salt }, (err, pass, salt, hash) => {
			if (err) return fn(err);
			if (hash === user.password) return fn(null, user);
			fn(new Error("invalid password"));
		});
	});
}

router.get("/login", (req, res) => {
	res.render("admin", { session: req.session });
});

router.post("/login", (req, res) => {
	authenticate(req.body.username, req.body.password, (err, user) => {
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
	// destroy the user's session to log them out
	// will be re-created next request
	req.session.destroy(() => {
		res.redirect("/admin/login");
	});
});

router.get("/register", restrict, (req, res) => {
	res.render("register");
});

router.post("/register", restrict, (req, res) => {
	newUser(req.body.username, req.body.password, (err) => {
		res.render("register", { err: err });
	});

	res.render("admin", { session: req.session });
});

router.get("/add", restrict, (req, res) => {
	leaderboard.all("SELECT * FROM categories", (err, rows) => {
		res.render("admin_add", { categories: rows });
	});
});

router.post("/add", restrict, (req, res) => {
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
	if (parseInt(run.milliseconds, 10)) {
		run.time += parseInt(run.milliseconds, 10) / 1000 + 0.0001;
	}

	leaderboard.serialize(() => {
		leaderboard.run("INSERT INTO runs VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", [
			run.category,
			run.date,
			run.time,
			"",
			//run.duration,
			run.platform,
			run.seed,
			run.version,
			run.input,
			run.link,
		]);

		// Prevents DoS
		if (!(run.runners instanceof Array)) {
			return [];
		}

		// TODO: Make page stop loading when done!
		// Insert the run/runner pairs
		for (let i = 0, len = run.runners.length; i < len; i++) {
			leaderboard.run("INSERT INTO pairs VALUES((SELECT Count() FROM runs), (SELECT rowid FROM runners WHERE name = ?))", [
				run.runners[i],
			]);
		}
	});
});

router.get("/pull", restrict, (req, res) => {
	exec("git pull", (error, stdout, stderr) => {
		if (error) throw err;
		res.send(`Pulling complete \n ${stderr} \n ${stdout}`);
	});
});

module.exports = router;
