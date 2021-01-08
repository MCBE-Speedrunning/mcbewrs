#!/usr/bin/env sh

# Format all typescript/javascript files with clang-format

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)

for FILE in $(find "$SCRIPT_PATH/../../" | grep "\.[jt]s$" | grep -v "node_modules"); do
    clang-format --verbose -i -style=file "$FILE"
done
