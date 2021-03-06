#!/usr/bin/env sh

# This script when run will setup all the data files
# required for the site

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)

test ! -d "$SCRIPT_PATH/../data" && mkdir "$SCRIPT_PATH/../data"

DATA="$SCRIPT_PATH/../data"

sqlite3 "$DATA/auth.db" <<EOF
CREATE TABLE IF NOT EXISTS config (
	db_secret		TEXT NOT NULL,
	server_port		INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
	username		TEXT NOT NULL UNIQUE,
	password		TEXT NOT NULL,
	salt			TEXT NOT NULL,
	PRIMARY KEY (username)
);
EOF

sqlite3 "$DATA/leaderboard.db" <<EOF
CREATE TABLE IF NOT EXISTS runners (
	id				INTEGER PRIMARY KEY AUTOINCREMENT,
	name			TEXT NOT NULL UNIQUE,
	nationality		TEXT
);

CREATE TABLE IF NOT EXISTS categories (
	id				INTEGER PRIMARY KEY AUTOINCREMENT,
	readable		TEXT NOT NULL UNIQUE,
	abbreviation	TEXT NOT NULL UNIQUE,
	type			TEXT NOT NULL DEFAULT 'main',
	corder			INTEGER NOT NULL
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
	wr				INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS pairs (
	run_id			INTEGER NOT NULL,
	runner_id		INTEGER NOT NULL,
	FOREIGN KEY (run_id) REFERENCES runs(id),
	FOREIGN KEY (runner_id) REFERENCES runners(id)
);
EOF

cat <<EOF >"$DATA/config.json"
{
	"db_secret": "",
	"port": 80,
	"token_secret": ""
}
EOF
