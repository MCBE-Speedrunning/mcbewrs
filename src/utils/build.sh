#!/usr/bin/env sh

# Build everything

npm run copy-files
tsc
find ./dist/ -name '*.ts' -type f -delete
sass --update dist/public/cdn/stylesheets/

# Avoid weird errors with tsc
exit 0
