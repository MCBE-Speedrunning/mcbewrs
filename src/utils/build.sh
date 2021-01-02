#!/usr/bin/env sh

# Build everything

rm -r dist 2>/dev/null
mkdir dist dist/data dist/views dist/public
cp -r src/data src/views src/public dist/

tsc
find ./dist/ -name '*.ts' -type f -delete
sass --update dist/public/cdn/stylesheets/

# Avoid weird errors with tsc
exit 0
