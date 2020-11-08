const express = require("express");
const { use } = require(".");
const hash = require("pbkdf2-password")();
const sqlite3 = require("sqlite3").verbose();

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
		// query the db for the given username
		if (!user) return fn(new Error("cannot find user"));
		// apply the same algorithm to the POSTed password, applying
		// the hash against the pass / salt, if there is a match we
		// found the user
		hash({ password: pass, salt: user.salt }, (err, pass, salt, hash) => {
			if (err) return fn(err);
			if (hash === user.password) return fn(null, user);
			fn(new Error("invalid password"));
		});
	});
}

/* GET users listing. */
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
	res.render("admin_add");
});

router.post("/add", restrict, (req, res) => {
	const run = req.body;
	leaderboard.serialize(() => {
		console.log(req.body);
		leaderboard.run("INSERT INTO runs VALUES(?, ?, ?, ?, ?, ?)", [
			run.category,
			run.date,
			run.time,
			run.platform,
			run.version,
			run.link,
		]);
		for (let player in run.players) {
			leaderboard.get("SELECT Count() FROM runs", (err, runid) => {
				leaderboard.get(
					"SELECT rowid FROM runner WHERE name = ?",
					player,
					(err, playerid) => {
						leaderboard.run("INSERT INTO pairs VALUES(?, ?)", [
							runid,
							playerid,
						]);
					}
				);
			});
		}
	});
});

module.exports = router;
