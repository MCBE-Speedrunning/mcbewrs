#!/bin/sh

# This script when run will setup all the data files
# required for the site

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)
DATA="${SCRIPT_PATH}/../data"

sqlite3 ".read ${DATA}/setup/auth.sql"
sqlite3 ".read ${DATA}/setup/leaderboard.sql"

mv auth.db ${DATA}
mv leaderboard.db ${DATA}

cat << EOF >> ${DATA}/config.json
{
    "db_secret": "",
    "port": 80,
    "token_secret": ""
}
EOF
