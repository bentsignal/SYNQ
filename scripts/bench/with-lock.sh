#!/usr/bin/env bash
# Serializes native builds and measurements across SYNQ and Vera worktrees.
# The lock is Vera's (~/Library/Caches/vera/heavy.lock), so a SYNQ build
# never overlaps a Vera one; keep this in sync with Vera's
# scripts/bench/with-lock.sh. Unlike Vera's, it is re-entrant: scripts/sim.sh
# and scripts/phone.sh take the lock around their own builds, so wrapping
# them in it too doesn't deadlock.
set -euo pipefail
if [ -n "${SYNQ_HEAVY_LOCK_HELD:-}" ]; then
  exec "$@"
fi
lock="$HOME/Library/Caches/vera/heavy.lock"
mkdir -p "$(dirname "$lock")"
until mkdir "$lock" 2>/dev/null; do
  if [ -n "$(find "$lock" -maxdepth 0 -mmin +90 2>/dev/null)" ]; then
    [ ! -f "$lock/owner" ] || unlink "$lock/owner"
    rmdir "$lock" 2>/dev/null || true
  fi
  sleep 15
done
trap 'unlink "$lock/owner"; rmdir "$lock"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
printf '%s %s %s\n' "synq/$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")" "$(date +%H:%M)" "$*" > "$lock/owner"
export SYNQ_HEAVY_LOCK_HELD=1
"$@"
