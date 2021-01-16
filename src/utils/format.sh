#!/usr/bin/env sh

# Format all typescript/javascript files with clang-format
# and use tabs instead of spaces in shell scripts

not_installed() {
	echo "Error: package '$1' required for formatting not found"
	exit 1
}

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)

for FILE in $(find "$SCRIPT_PATH/../../" | grep "\.[jt]s$" | grep -v "node_modules"); do
	clang-format --verbose -i -style=file "$FILE" || not_installed clang-format
done

# Unexpanding and redirecting into the same file erases
# all the contents, so we redirect into a temporary file
# and then rename it, but that requires marking it as
# executable again.
for FILE in "$SCRIPT_PATH"/*.sh; do
	echo Formatting "$FILE"
	unexpand -t 4 --first-only "$FILE" >temp || not_installed unexpand
	mv temp "$FILE"
	chmod +x "$FILE"
done
