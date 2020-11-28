.open leaderboard.db

CREATE TABLE IF NOT EXISTS runners (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE,
    nationality     TEXT
);

CREATE TABLE IF NOT EXISTS categories (
	id				INTEGER PRIMARY KEY AUTOINCREMENT,
	readable		TEXT NOT NULL UNIQUE,
	abbreviation	TEXT NOT NULL UNIQUE,
	type			TEXT NOT NULL DEFAULT 'main',
    corder          INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
	id				INTEGER PRIMARY KEY AUTOINCREMENT,
	category_id		INTEGER NOT NULL,
	date			INTEGER NOT NULL,
	time			NUMERIC NOT NULL,
	duration		INTEGER NOT NULL,
	platform		TEXT NOT NULL DEFAULT '-',
	seed			TEXT NOT NULL DEFAULT '-',
	version			TEXT NOT NULL DEFAULT '-',
	input			TEXT NOT NULL DEFAULT '-',
	link			TEXT,
    wr              INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS pairs (
	run_id          INTEGER NOT NULL,
	runner_id       INTEGER NOT NULL,
	FOREIGN KEY (run_id) REFERENCES runs(id),
	FOREIGN KEY (runner_id) REFERENCES runners(id)
);

.quit
