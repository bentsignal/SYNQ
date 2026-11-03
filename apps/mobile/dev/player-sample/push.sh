#!/usr/bin/env bash
# Copies this sample library into this worktree's simulator (SYNQ Dev's
# Documents/dev-player-sample), for `synqDev.seedPlayer()` to import:
#
#   apps/mobile/dev/player-sample/push.sh
#   scripts/sim.sh eval "synqDev.seedPlayer()"
#
# Development only; nothing here ships in the app bundle.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(git -C "$HERE" rev-parse --show-toplevel)"
DEVICE=""
# shellcheck disable=SC1091
. "$ROOT/.cache/sim/ios"
[ -n "$DEVICE" ] || { echo "No simulator: run scripts/sim.sh up first." >&2; exit 1; }
DATA="$(xcrun simctl get_app_container "$DEVICE" com.directedbyshawn.synq.dev data)"
mkdir -p "$DATA/Documents/dev-player-sample"
cp "$HERE"/*.m4a "$HERE"/*.jpg "$HERE"/manifest.json "$DATA/Documents/dev-player-sample/"
echo "copied to $DATA/Documents/dev-player-sample"
