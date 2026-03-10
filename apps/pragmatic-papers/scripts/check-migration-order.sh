#!/usr/bin/env bash
# Checks that migrations in index.ts are listed in chronological order
# based on their timestamp prefixes (YYYYMMDD_HHMMSS).

set -euo pipefail

MIGRATIONS_INDEX="$(dirname "$0")/../src/migrations/index.ts"

# Extract migration name strings from the exports array
NAMES=$(grep -o "name: '[0-9]\{8\}_[0-9]\{6\}" "$MIGRATIONS_INDEX" | grep -o '[0-9]\{8\}_[0-9]\{6\}')

PREV=""
EXIT_CODE=0

while IFS= read -r name; do
  if [[ -n "$PREV" && "$name" < "$PREV" ]]; then
    echo "ERROR: Migration '$name' is out of order — it comes after '$PREV' but has an earlier timestamp."
    EXIT_CODE=1
  fi
  PREV="$name"
done <<< "$NAMES"

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "All migrations are in chronological order."
fi

exit $EXIT_CODE
