#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SMOKE_FILE="$ROOT_DIR/apps/new/src/__stylesheet_lint_smoke__.tsx"

cleanup() {
  rm -f "$SMOKE_FILE"
}

trap cleanup EXIT

cat > "$SMOKE_FILE" <<'SMOKE'
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export function StyleSheetLintSmoke() {
  return <View style={styles.root} />;
}
SMOKE

set +e
output="$(
  cd "$ROOT_DIR" &&
    corepack pnpm@10.17.0 --filter @synq/new exec eslint src/__stylesheet_lint_smoke__.tsx 2>&1
)"
status=$?
set -e

if (( status == 0 )); then
  printf "%s\n" "$output"
  echo "Expected the new app StyleSheet lint smoke to fail."
  exit 1
fi

if ! printf "%s\n" "$output" | rg -q "synq-nativewind/no-stylesheet"; then
  printf "%s\n" "$output"
  echo "Expected the custom StyleSheet lint rule to report the smoke file."
  exit 1
fi

echo "New app custom ESLint rule smoke passed."
