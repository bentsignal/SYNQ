#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

cleanup() {
  rm -rf apps/new/dist-export-smoke apps/old/dist-export-smoke
}

scan_for_forbidden_matches() {
  local label="$1"
  shift

  if "$@"; then
    echo "Forbidden matches found during ${label}."
    return 1
  fi
}

scan_async_storage_boundaries() {
  local matches

  matches="$(
    rg -n "AsyncStorage|@react-native-async-storage/async-storage" \
      apps/old/src apps/new/app apps/new/src shared -g "*.ts" -g "*.tsx" || true
  )"

  if [[ -z "$matches" ]]; then
    return 0
  fi

  local violations
  violations="$(
    printf "%s\n" "$matches" |
      rg -v "storage-service\\.ts:" || true
  )"

  if [[ -n "$violations" ]]; then
    printf "%s\n" "$violations"
    echo "AsyncStorage must stay behind feature storage services."
    return 1
  fi
}

scan_import_database_boundaries() {
  local matches

  matches="$(
    rg -n "@synq/db|@synq/db/schema|drizzle-orm|\\bdb\\." \
      apps/new/src/features/import/hooks \
      apps/new/src/features/import/components \
      apps/new/src/features/import/services \
      -g "*.ts" -g "*.tsx" || true
  )"

  if [[ -n "$matches" ]]; then
    printf "%s\n" "$matches"
    echo "Import database access must stay behind import repository modules."
    return 1
  fi
}

trap cleanup EXIT

echo "==> Typecheck"
pnpm typecheck

echo "==> Lint"
pnpm lint

echo "==> Whitespace"
git diff --check

echo "==> Event emitter scan"
scan_for_forbidden_matches "event emitter scan" \
  rg -n "usePlaybackContext\\(\\)|EventEmitter|DeviceEventEmitter|NativeEventEmitter|\\.emit\\(" \
  apps/old/src apps/new/app apps/new/src shared -g "*.ts" -g "*.tsx"

echo "==> New app hygiene scan"
scan_for_forbidden_matches "new app hygiene scan" \
  rg -n "console\\.log|console\\.error|Dimensions\\.get" \
  apps/new/app apps/new/src/features -g "*.ts" -g "*.tsx"

echo "==> Rewrite debt audit"
bash scripts/audit-rewrite-debt.sh

echo "==> AsyncStorage boundary scan"
scan_async_storage_boundaries

echo "==> Import database boundary scan"
scan_import_database_boundaries

echo "==> Deterministic rewrite smoke"
pnpm --filter @synq/rewrite-smoke smoke

echo "==> Old app iOS export smoke"
pnpm --filter @synq/old exec expo export --platform ios --output-dir dist-export-smoke

echo "==> New app iOS export smoke"
pnpm --filter @synq/new exec expo export --platform ios --output-dir dist-export-smoke

echo "Rewrite verification passed."
