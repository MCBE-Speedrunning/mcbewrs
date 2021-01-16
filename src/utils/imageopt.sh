#!/usr/bin/env sh

# Optimze the images used on the site

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_PATH"/../public/cdn/assets || exit 1

for FILE in *.jpg; do
    jpegtran -optimize -outfile "$FILE" -copy none -perfect -v "$FILE"
done
