.open auth.db

CREATE TABLE IF NOT EXISTS config (
	db_secret       TEXT NOT NULL,
	server_port     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
	username        TEXT NOT NULL UNIQUE,
	password        TEXT NOT NULL,
	salt            TEXT NOT NULL,
	PRIMARY KEY (username)
);

.quit
