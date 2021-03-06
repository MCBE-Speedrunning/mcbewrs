import {exec} from "child_process";
import csurf from "csurf";
import express, {NextFunction, Request, Response} from "express";
import createError from "http-errors";
import path from "path";
// @ts-ignore No declarations available for this module
import hashFunc from "pbkdf2-password";
import {Database, open} from "sqlite";
import sqlite3 from "sqlite3";

const hash = hashFunc();
const router = express.Router();
let leaderboard: Database<sqlite3.Database, sqlite3.Statement>;
let db: Database<sqlite3.Database, sqlite3.Statement>;
(async () => {
	leaderboard = await open({
		filename: path.join(__dirname, "..", "data", "leaderboard.db"),
		driver: sqlite3.cached.Database
	});
	db = await open(
	    {filename: path.join(__dirname, "..", "data", "auth.db"), driver: sqlite3.cached.Database});
})();

/*
 * Add a new user to the DB
 */
function newUser(username: string, password: string, fn: (err: Error) => void) {
	hash({password: password}, async (err: any, _pass: string, salt: string, hash: string) => {
		if (err)
			return fn(new Error("Error during hashing"));
		// Store the salt & hash in the "db"
		await db.run(`INSERT INTO users VALUES(?, ?, ?)`, username, hash, salt);
	});
}

/*
 * Restrict access to the admin page
 */
function restrict(req: Request, res: Response, next: NextFunction) {
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
async function authenticate(name: string, pass: string, fn: (err: Error|null, user?: any) => void) {
	const user = await db.get("SELECT * FROM users WHERE username = ?", name);
	// Query the db for the given username
	if (!user)
		return fn(new Error("cannot find user"));
	/*
	 * Apply the same algorithm to the POSTed password, applying the hash against the pass / salt,
	 * if there is a match we found the user.
	 */
	hash({password: pass, salt: user.salt},
	    (err: Error|null, _pass: string, _salt: string, hash: string) => {
		    if (err)
			    return fn(err);
		    if (hash === user.password)
			    return fn(null, user);
		    fn(new Error("invalid password"));
	    });
}

router.use(csurf({cookie: false}));

router.get("/login",
    (req, res) => { res.render("login", {session: req.session, csrfToken: req.csrfToken()}); });

router.post("/login", async (req, res, next) => {
	await authenticate(req.body.username, req.body.password, (err, user) => {
		if (err)
			return next(err);
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
	req.session.destroy(() => { res.redirect("/admin/login"); });
});

router.get("/portal", restrict,
    (req, res) => { res.render("admin_portal", {csrfToken: req.csrfToken()}); });

router.get(
    "/register", restrict, (req, res) => { res.render("register", {csrfToken: req.csrfToken()}); });

router.post("/register", restrict, (req, res) => {
	newUser(req.body.username, req.body.password, (err) => { res.render("register", {err: err}); });

	res.render("login", {session: req.session, csrfToken: req.csrfToken()});
});

router.get("/add", restrict, async (req, res, _next) => {
	const rows = await leaderboard.all("SELECT * FROM categories");
	res.render("admin_add", {
		categories: rows,
		csrfToken: req.csrfToken(),
	});
});

router.post("/add", restrict, async (req, res, next) => {
	const run = req.body;
	const categories = await leaderboard.all("SELECT * FROM categories");

	/*
	 * Multiple runners can be input by seperating them with ','. We also need to make
	 * sure they exist before doing anything.
	 */
	run.runners = run.runners.trim().split(",");
	for (const runner of run.runners) {
		const check = await leaderboard.all("SELECT * FROM runners WHERE name=?", runner);
		if (!check.length) {
			res.render("admin_add", {
				banner: {
					text: `Runner ${runner} does not exist. Please add the runner first.`,
					status: "danger",
					csrfToken: req.csrfToken(),
				},
				categories: categories,
				csrfToken: req.csrfToken(),
			});
			return;
		}
	}

	/* Convert HTML date format to seconds from epoch */
	run.date = new Date(run.date).valueOf() / 1000;

	/* All input from the client comes as a string, so everything must be parsed as an int */
	run.time = parseInt(run.hour, 10) * 60 * 60 + parseInt(run.minutes, 10) * 60
	           + parseInt(run.seconds, 10);

	/*
	 * Add 0.0001 to the end of runs that time with milliseconds. This ensures that the
	 * site will display 3 significant figures.
	 */
	if (parseInt(run.milliseconds, 10))
		run.time += parseInt(run.milliseconds, 10) / 1000 + 0.0001;

	await leaderboard.run("INSERT INTO runs VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	    run.category_id, run.date, run.time,
	    /* Run duration */
	    0, run.platform, run.seed, run.version, run.input, run.link,
	    /* WR flag */
	    0);

	/* Prevents DoS according to GitHub */
	if (!(run.runners instanceof Array))
		return [];

	/* Insert the run/runner pairs */
	for (const runner of run.runners)
		await leaderboard.run(`INSERT INTO pairs VALUES(
						(SELECT MAX(id) FROM runs),
						(SELECT id FROM runners WHERE name = ?)
						)`,
		    runner);

	/* Update the WR flags */
	await leaderboard.run(`UPDATE runs
						SET wr = CASE WHEN time = (
								SELECT time FROM runs
								WHERE category_id = ?
								ORDER BY time ASC LIMIT 1
						)
						THEN 1 ELSE 0
						END`,
	    run.category_id);

	/* Calculate the duration of each run in the category just updated */
	const rows = await leaderboard.all(`SELECT id, date, time FROM runs
						WHERE category_id = ?
						ORDER BY date ASC`,
	    run.category_id);
	for (let i = 0, len = rows.length; i < len; i++) {
		/*
		 * Check every newer record until a faster one is found. You can't just
		 * check the very next run because of the possibility of ties.
		 */
		for (let j = i + 1; j <= len; j++) {
			/* Check if the record is current */
			if (j === len) {
				rows[i].duration = Date.now() / 1000 - rows[i].date;
			} else if (rows[j].time != rows[i].time) {
				rows[i].duration = rows[j].date - rows[i].date;
				break;
			}
		}

		/* Add the runs duration to the DB */
		await leaderboard.run(
		    `UPDATE runs SET duration = ? WHERE id = ?`, rows[i].duration, rows[i].id);
	}

	res.render("admin_add", {
		banner: {
			text: "Run added succesfully",
			status: "success",
			csrfToken: req.csrfToken(),
		},
		categories: categories,
		csrfToken: req.csrfToken(),
	});
});

router.get("/new_user", restrict, async (req, res, next) => {
	res.render("admin_newuser", {
		csrfToken: req.csrfToken(),
	});
});

router.post("/new_user", restrict, async (req, res, next) => {
	let username: string;
	if (req.body.name)
		username = req.body.name;
	else
		return createError(405, "No name provided");
	const nationality = req.body.nationality || null;
	await leaderboard.run(`INSERT INTO runners (name, nationality) VALUES(?, ?)`, username,
	    nationality.toUpperCase());
	res.render("admin_newuser", {
		banner: {
			text: "Runner added succesfully",
			status: "success",
			csrfToken: req.csrfToken(),
		},
	});
});

router.get("/pull", restrict, (_req, res, next) => {
	exec("git pull", (err, _stdout, stderr) => {
		if (err)
			return next(err);
		res.send(`Pulling complete \n ${stderr}`);
	});
});

export default router;
