#!/bin/sh

# This script is run as a cron job, and updates the durations of all standing records

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)
DB="$SCRIPT_PATH/../data/leaderboard.db"

for CAT in $(sqlite3 "$DB" "SELECT abbreviation FROM categories;"); do
    for RUN in $(sqlite3 "$DB" "SELECT rowid, date FROM runs WHERE time = (SELECT MIN(time) FROM runs WHERE category = '$CAT') AND category = '$CAT';"); do
        ROWID=$(echo $RUN | cut -f 1 -d "|")
        DURATION=$(echo "$(date +%s) - $(echo $RUN | cut -f 2 -d '|')" | bc)
        sqlite3 "$DB" "UPDATE runs SET duration = $DURATION WHERE rowid = $ROWID;"
    done
done
