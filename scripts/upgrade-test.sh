#!/usr/bin/env bash
# The 2.5.2 → 3.0 upgrade, end to end, in this worktree's simulator: the
# real 2.5.2 App Store build with the real 2.5.2 library
# (packages/db/fixtures/legacy-2.5.2), then SYNQ 3.0 (the production
# variant, Release) installed over it, as the App Store would.
#
#   scripts/upgrade-test.sh [all]     legacy, upgrade, relaunch, then down
#   scripts/upgrade-test.sh legacy    boot a simulator (through the queue),
#                                     install 2.5.2, restore the fixture into
#                                     its data container, launch it, screenshot
#   scripts/upgrade-test.sh upgrade   install 3.0 over it, launch, verify
#   scripts/upgrade-test.sh relaunch [--fresh-session]
#                                     restart 3.0; verify the import didn't
#                                     run again and the library is unchanged
#   scripts/upgrade-test.sh failure   a fresh 2.5.2 install whose synq.db is
#                                     corrupt (a copy; the fixture is never
#                                     touched); 3.0 must show its error. This
#                                     copy also renames song 9's file to
#                                     "Interlude #7.mp3", to play a `#` name
#   scripts/upgrade-test.sh recover   put the good synq.db back; then tap
#                                     Try Again and run the `verify` it prints
#   scripts/upgrade-test.sh verify <label> [--theme <id>] [--fresh-session]
#                                     check the container now (see
#                                     packages/db/scripts/verify-upgrade.ts)
#   scripts/upgrade-test.sh down      delete the simulator (scripts/sim.sh down)
#
# The steps run one at a time so screens can be driven between them (T3's
# Device panel: device_open with the id `legacy` prints). Screenshots go to
# .cache/evidence/upgrade-*.png; checks and snapshots to .cache/upgrade-test/.
#
# 2.5.2 comes from ~/Library/Caches/synq/legacy-2.5.2/synq-2.5.2-release.app
# (BUILD.md there; override with SYNQ_LEGACY_APP). 3.0 is
# `scripts/sim.sh build-release`, cached by native fingerprint and
# JavaScript, built under the heavy-work lock (override with
# SYNQ_RELEASE_APP, such as an older cached build).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
SIM="$ROOT/scripts/sim.sh"
BUNDLE_ID="com.directedbyshawn.synq"
FIXTURE="$ROOT/packages/db/fixtures/legacy-2.5.2"
LEGACY_APP="${SYNQ_LEGACY_APP:-$HOME/Library/Caches/synq/legacy-2.5.2/synq-2.5.2-release.app}"
RUN="$ROOT/.cache/upgrade-test"
STAGE="$RUN/fixture"
APP_SUPPORT="Library/Application Support/$BUNDLE_ID"
mkdir -p "$RUN"

release_app() {
  if [ -n "${SYNQ_RELEASE_APP:-}" ]; then echo "$SYNQ_RELEASE_APP"; else "$SIM" build-release; fi
}

verifier() {
  node --experimental-strip-types --no-warnings "$ROOT/packages/db/scripts/verify-upgrade.ts" "$@"
}

device() {
  local state="$ROOT/.cache/sim/ios" DEVICE=""
  # shellcheck disable=SC1090
  [ -f "$state" ] && . "$state"
  if [ -z "$DEVICE" ]; then
    echo "no simulator; run scripts/upgrade-test.sh legacy first" >&2
    exit 1
  fi
  touch "$state"
  echo "$DEVICE"
}

container() { xcrun simctl get_app_container "$(device)" "$BUNDLE_ID" data; }

shot() { "$SIM" shot "upgrade-$1" >/dev/null && echo "screenshot: .cache/evidence/upgrade-$1.png"; }

# The fixture as it was on the device: the committed container, with the two
# NFD file names (git stores them NFC) and the empty cover folders (git
# drops them) restored from the backup zip, which has the device's bytes.
stage_fixture() {
  rm -rf "$STAGE"
  mkdir -p "$STAGE"
  ditto "$FIXTURE/container" "$STAGE"
  python3 -I - "$FIXTURE/backup/synq-2.5.2-backup.zip" "$STAGE/Documents" <<'PY'
import os, sys, unicodedata, zipfile
archive, documents = sys.argv[1:]
with zipfile.ZipFile(archive) as z:
    for info in z.infolist():
        name = info.filename
        target = os.path.join(documents, name)
        if name.endswith("/"):
            os.makedirs(target, exist_ok=True)
            continue
        nfc = unicodedata.normalize("NFC", name)
        if nfc == name:
            continue
        checkout = os.path.join(documents, nfc)
        data = z.read(info)
        with open(checkout, "rb") as f:
            assert f.read() == data, f"{nfc} differs from the backup"
        os.remove(checkout)
        with open(target, "wb") as f:
            f.write(data)
        print(f"restored the device's NFD name: {name!r}")
PY
}

# Replaces the app's Documents and AsyncStorage with `$1` (a staged fixture).
restore_container() {
  local data
  data="$(container)"
  rm -rf "${data:?}/Documents" "${data:?}/$APP_SUPPORT"
  ditto "$1/Documents" "$data/Documents"
  mkdir -p "$data/$APP_SUPPORT"
  ditto "$1/$APP_SUPPORT" "$data/$APP_SUPPORT"
}

launch() { xcrun simctl launch "$(device)" "$BUNDLE_ID" >/dev/null; }
terminate() { xcrun simctl terminate "$(device)" "$BUNDLE_ID" 2>/dev/null || true; }

# A device with 2.5.2 installed and launched once, so iOS made its container.
install_legacy() {
  local id
  [ -d "$LEGACY_APP" ] || {
    echo "2.5.2 build missing: $LEGACY_APP" >&2
    exit 1
  }
  until id="$("$SIM" boot)"; do
    [ $? -eq 75 ] || exit 1
  done
  echo "simulator $id"
  xcrun simctl uninstall "$id" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl install "$id" "$LEGACY_APP"
  launch
  sleep 8
  terminate
}

legacy() {
  stage_fixture
  verifier manifest "$STAGE" "$RUN/fixture-files.json" >/dev/null
  install_legacy
  restore_container "$STAGE"
  launch
  sleep 10
  shot 252-library
  terminate
  echo "2.5.2 is ready; to look around, device_open $(device), then: scripts/upgrade-test.sh upgrade"
}

# What the person had when they last quit 2.5.2: the fixture. 2.5.2 runs
# here in a container other than the one the fixture came from, so its
# saved queue (absolute file URLs) fails to play, and it may rewrite its
# session (seen: lastTrackIndex 4 → 0). A real update never runs 2.5.2
# after its container moved, so its AsyncStorage goes back to the
# fixture's; anything else 2.5.2 changed stays and must survive too.
settle_legacy() {
  local data
  data="$(container)"
  verifier manifest "$data" "$RUN/after-legacy.json" >/dev/null
  node -e '
    const [a, b] = process.argv.slice(1).map((f) => require(f));
    const changed = Object.keys({ ...a, ...b }).filter((k) => a[k] !== b[k]);
    console.log(changed.length ? `2.5.2 changed while running: ${changed.join(", ")}` : "2.5.2 left the fixture as it was");
  ' "$RUN/fixture-files.json" "$RUN/after-legacy.json"
  rm -rf "${data:?}/$APP_SUPPORT/RCTAsyncLocalStorage_V1"
  ditto "$STAGE/$APP_SUPPORT/RCTAsyncLocalStorage_V1" "$data/$APP_SUPPORT/RCTAsyncLocalStorage_V1"
  verifier manifest "$data" "$RUN/legacy-files.json"
}

# Waits until 3.0 has recorded the import (or `$1` seconds pass).
wait_for_import() {
  local db
  db="$(container)/Documents/SQLite/library.db"
  for _ in $(seq 1 "$1"); do
    if [ -f "$db" ] && [ "$(sqlite3 "file:$db?mode=ro" 'SELECT count(*) FROM legacy_import' 2>/dev/null || echo 0)" = 1 ]; then
      return 0
    fi
    sleep 1
  done
  return 1
}

upgrade() {
  local release
  release="$(release_app)"
  terminate
  sleep 1
  settle_legacy
  echo "installing 3.0 over 2.5.2: $release"
  xcrun simctl install "$(device)" "$release"
  launch
  wait_for_import 60 || {
    shot 30-first-launch
    echo "3.0 did not finish the import in 60 seconds" >&2
    exit 1
  }
  sleep 4
  shot 30-first-launch
  verify first --fresh-session
}

relaunch() {
  terminate
  sleep 1
  launch
  sleep 8
  shot 30-relaunch
  verify relaunch "$@"
}

# The fixture with song 9's file renamed to have a `#` (the committed
# library has none), in synq.db too, as if 2.5.2 had imported it so.
HASH_NAME="Interlude #7.mp3"
stage_variant() {
  local variant="$RUN/variant"
  [ -d "$STAGE" ] || stage_fixture
  rm -rf "$variant"
  ditto "$STAGE" "$variant"
  mv "$variant/Documents/library/9/interlude.mp3" "$variant/Documents/library/9/$HASH_NAME"
  sqlite3 "$variant/Documents/SQLite/synq.db" "UPDATE songs SET fileName = '$HASH_NAME' WHERE id = 9"
}

failure() {
  local broken="$RUN/broken"
  stage_variant
  rm -rf "$broken"
  ditto "$RUN/variant" "$broken"
  # Garbage over the header: SQLite reports "file is not a database".
  dd if=/dev/urandom of="$broken/Documents/SQLite/synq.db" bs=100 count=1 conv=notrunc 2>/dev/null
  install_legacy
  restore_container "$broken"
  xcrun simctl install "$(device)" "$(release_app)"
  launch
  sleep 10
  shot 30-import-failed
  local db
  db="$(container)/Documents/SQLite/library.db"
  echo "library.db after the failed import: legacy_import $(sqlite3 "file:$db?mode=ro" 'SELECT count(*) FROM legacy_import'), songs $(sqlite3 "file:$db?mode=ro" 'SELECT count(*) FROM songs'), playlists $(sqlite3 "file:$db?mode=ro" 'SELECT count(*) FROM playlists')"
  echo "next: scripts/upgrade-test.sh recover, then tap Try Again"
}

recover() {
  cp "$RUN/variant/Documents/SQLite/synq.db" "$(container)/Documents/SQLite/synq.db"
  verifier manifest "$(container)" "$RUN/legacy-files.json" >/dev/null
  echo "synq.db restored; tap Try Again, then: scripts/upgrade-test.sh verify recovered --fresh-session --file '9=$HASH_NAME'"
}

verify() {
  local label="${1:?label}"
  shift
  verifier check "$(container)" "$RUN" "$label" "$@" | tee "$RUN/$label.log"
}

command="${1:-all}"
shift || true
case "$command" in
  all)
    trap '"$SIM" down >/dev/null 2>&1 || true' EXIT
    legacy
    upgrade
    # Nothing played in between, so the session is still exactly 2.5.2's.
    relaunch --fresh-session
    ;;
  legacy) legacy ;;
  upgrade) upgrade ;;
  relaunch) relaunch "$@" ;;
  failure) failure ;;
  recover) recover ;;
  verify) verify "$@" ;;
  down) "$SIM" down ;;
  *)
    sed -n '2,33p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac
