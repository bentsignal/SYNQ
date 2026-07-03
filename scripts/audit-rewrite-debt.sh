#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

NEW_APP_PATHS=(apps/new/app apps/new/src)
MAX_NEW_APP_STYLESHEET_CREATE="${MAX_NEW_APP_STYLESHEET_CREATE:-0}"
MAX_NEW_APP_CONTEXT_MODULES="${MAX_NEW_APP_CONTEXT_MODULES:-0}"
MAX_EXTERNAL_PLAYBACK_SELECTOR_IMPORTS="${MAX_EXTERNAL_PLAYBACK_SELECTOR_IMPORTS:-0}"
MAX_LIBRARY_HOOK_LIVE_QUERY_MODULES="${MAX_LIBRARY_HOOK_LIVE_QUERY_MODULES:-2}"

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
context_directories="$(
  find apps/new/src/features -type d -name context -print | wc -l | tr -d " "
)"
external_playback_selector_imports="$(
  (
    (rg -l "usePlaybackSessionSelector|usePlaybackSession\\(" \
      apps/new/src/features \
      -g "*.ts" -g "*.tsx" || true) |
      (rg -v "apps/new/src/features/playback/" || true)
  ) |
    wc -l |
    tr -d " "
)"
library_hook_live_query_modules="$(
  (rg -l "useLiveQuery|drizzle-orm/expo-sqlite" \
    apps/new/src/features/library/hooks \
    -g "*.ts" -g "*.tsx" || true) |
    wc -l |
    tr -d " "
)"

printf "New app StyleSheet.create calls: %s/%s max\n" \
  "$stylesheet_creates" "$MAX_NEW_APP_STYLESHEET_CREATE"
printf "New app React context modules: %s/%s max\n" \
  "$context_modules" "$MAX_NEW_APP_CONTEXT_MODULES"
printf "New app context directories: %s/0 max\n" "$context_directories"
printf "External playback selector imports: %s/%s max\n" \
  "$external_playback_selector_imports" "$MAX_EXTERNAL_PLAYBACK_SELECTOR_IMPORTS"
printf "Library hook live-query modules: %s/%s max\n" \
  "$library_hook_live_query_modules" "$MAX_LIBRARY_HOOK_LIVE_QUERY_MODULES"

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

if (( context_directories > 0 )); then
  echo
  echo "Feature context directories are not allowed in the new app. Use Rostra-backed state modules instead."
  find apps/new/src/features -type d -name context -print
  failed=1
fi

if (( external_playback_selector_imports > MAX_EXTERNAL_PLAYBACK_SELECTOR_IMPORTS )); then
  echo
  echo "Non-playback features should use named playback facade hooks instead of raw playback store selectors."
  (rg -l "usePlaybackSessionSelector|usePlaybackSession\\(" \
    apps/new/src/features \
    -g "*.ts" -g "*.tsx" || true) |
    rg -v "apps/new/src/features/playback/"
  failed=1
fi

if (( library_hook_live_query_modules > MAX_LIBRARY_HOOK_LIVE_QUERY_MODULES )); then
  echo
  echo "Library UI hooks should move Drizzle live-query adapters behind library data modules."
  rg -l "useLiveQuery|drizzle-orm/expo-sqlite" \
    apps/new/src/features/library/hooks \
    -g "*.ts" -g "*.tsx"
  failed=1
fi

if (( failed != 0 )); then
  exit 1
fi

echo "Rewrite debt audit passed."
