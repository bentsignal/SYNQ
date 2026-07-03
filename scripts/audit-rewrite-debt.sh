#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

NEW_APP_PATHS=(apps/new/app apps/new/src)
MAX_NEW_APP_STYLESHEET_CREATE="${MAX_NEW_APP_STYLESHEET_CREATE:-101}"
MAX_NEW_APP_CONTEXT_MODULES="${MAX_NEW_APP_CONTEXT_MODULES:-0}"

count_matches() {
  local pattern="$1"
  shift

  (rg --count-matches "$pattern" "$@" -g "*.ts" -g "*.tsx" || true) |
    awk -F: '{sum += $2} END {print sum + 0}'
}

count_files() {
  local pattern="$1"
  shift

  (rg -l "$pattern" "$@" -g "*.ts" -g "*.tsx" || true) | wc -l | tr -d " "
}

stylesheet_creates="$(count_matches "StyleSheet\\.create" "${NEW_APP_PATHS[@]}")"
context_modules="$(count_files "\\b(createContext|useContext)\\b" "${NEW_APP_PATHS[@]}")"

printf "New app StyleSheet.create calls: %s/%s max\n" \
  "$stylesheet_creates" "$MAX_NEW_APP_STYLESHEET_CREATE"
printf "New app React context modules: %s/%s max\n" \
  "$context_modules" "$MAX_NEW_APP_CONTEXT_MODULES"

failed=0

if (( stylesheet_creates > MAX_NEW_APP_STYLESHEET_CREATE )); then
  echo
  echo "StyleSheet.create usage grew. Convert styles to utility classes or lower the ratchet after cleanup."
  rg -n "StyleSheet\\.create" "${NEW_APP_PATHS[@]}" -g "*.ts" -g "*.tsx"
  failed=1
fi

if (( context_modules > MAX_NEW_APP_CONTEXT_MODULES )); then
  echo
  echo "React context module count grew. Prefer Rostra selector stores for new shared state."
  rg -n "\\b(createContext|useContext)\\b" "${NEW_APP_PATHS[@]}" -g "*.ts" -g "*.tsx"
  failed=1
fi

if (( failed != 0 )); then
  exit 1
fi

echo "Rewrite debt audit passed."
