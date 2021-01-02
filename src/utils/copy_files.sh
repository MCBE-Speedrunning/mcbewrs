#!/usr/bin/env sh

# Copy everything from src/ to dist/

rm -r dist
mkdir dist dist/data dist/views dist/public
cp -r src/data dist/
cp -r src/views dist/
cp -r src/public dist/
