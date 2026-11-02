#!/usr/bin/env bash
# This worktree's own iOS simulator, for verifying changes and capturing PR
# evidence. One device and one Metro port per worktree, so agents in
# different worktrees never share a screen.
#
#   scripts/sim.sh <command>
#
#   up               build or reuse the dev client, boot, start Metro, open the app
#   build            cache the dev client without entering the device queue
#   build-release    cache SYNQ (the production variant, bundle
#                    com.directedbyshawn.synq) as a Release simulator app
#                    with its JavaScript embedded; prints its path
#   boot             wait for a slot and boot this worktree's simulator, with
#                    no app or Metro (for installing other builds, such as
#                    scripts/upgrade-test.sh does); prints the device id
#   open <path>      go to a route, such as `/settings` or `/search`
#   shot <name>      screenshot to .cache/evidence/<name>.png
#   record <name>    start a video to .cache/evidence/<name>.mp4
#   stop             stop the video
#   reload           reload the JavaScript
#   relaunch         restart the app (clears in-memory state)
#   eval "<js>"      evaluate JavaScript in the running app
#   seed [songs] [--reset]
#                    fill the library with the dev sample library
#                    (apps/mobile/dev/sample-library): 20 playable songs,
#                    covers, playlists, and likes; `songs` (e.g. 3000) adds
#                    made-up songs up to that many; --reset erases first
#   frames start     record the UI thread's frames (to measure an animation);
#                    waits until no device on the Mac is booting
#   frames stop      stop, and report the frames that drew slowly and how
#                    busy the Mac was
#   status           device, port, and Metro
#   queue            the simulator queue: devices up on this Mac, who is waiting, and why
#   down             delete the device; stops Metro unless the phone uses it
#
# `up` and `frames start` wait their turn in the simulator queue
# (scripts/simq.ts): up to three devices at once on the whole Mac, SYNQ's
# and Vera's together, and a boot never overlaps a performance
# measurement. Exit code 75 means still queued: run the same command again
# to keep your place. VERA_SIMQ=off skips the queue (the daemon sets it
# when it calls `down`; agents never do).
#
# Shared with Vera (~/dev/vera), so keep these in sync with Vera's
# scripts/sim.sh: scripts/simq.ts is a verbatim copy of Vera's, so both
# repos talk to one daemon (~/Library/Caches/vera/simq), and the daemon
# reclaims a device by running its worktree's `scripts/sim.sh down`, which
# reads the state in .cache/sim/ios. Copy simq.ts over again when Vera's
# changes, and keep that state layout and `down`.
#
# iOS simulators are clones of a template that has already booted once, so
# they skip iOS's first-boot setup (two minutes of every core on a fresh
# device; a clone settles in about 40 seconds). The template is Vera's
# (~/Library/Caches/vera/ios-template-<runtime>), shared rather than made
# again.
#
# Each dev client (SYNQ Dev, the dev variant in app.config.ts, as a Debug
# build) is built once per native fingerprint and cached in
# ~/Library/Caches/synq, so worktrees only rebuild when native code
# changed; the build runs under the heavy-work lock SYNQ and Vera share
# (scripts/bench/with-lock.sh). JavaScript comes from this worktree's
# Metro, which scripts/phone.sh shares (scripts/lib/metro.sh).
set -euo pipefail

PLATFORM=ios
ROOT="$(git rev-parse --show-toplevel)"
MOBILE="$ROOT/apps/mobile"
STATE_DIR="$ROOT/.cache/sim"
EVIDENCE="$ROOT/.cache/evidence"
CACHE="$HOME/Library/Caches/synq"
# Vera's cache, for the simulator template both repos clone from.
VERA_CACHE="$HOME/Library/Caches/vera"
BUNDLE_ID="com.directedbyshawn.synq.dev"
IOS_DEVICE_TYPE="com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro"
mkdir -p "$STATE_DIR" "$EVIDENCE" "$CACHE" "$VERA_CACHE"
# shellcheck source=lib/metro.sh
. "$ROOT/scripts/lib/metro.sh"

slug() {
  basename "$ROOT" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

# State: Metro is shared with the phone; the simulator keeps its own file.
load() {
  DEVICE="" RECORD_PID=""
  load_metro
  # shellcheck disable=SC1090
  [ -f "$STATE_DIR/$PLATFORM" ] && . "$STATE_DIR/$PLATFORM"
  return 0
}
save() {
  save_metro
  # SERIAL and EMULATOR_PID stay (empty) so the layout matches Vera's,
  # whose queue reads these files.
  printf 'DEVICE=%s\nSERIAL=\nEMULATOR_PID=\nRECORD_PID=%s\n' \
    "$DEVICE" "$RECORD_PID" >"$STATE_DIR/$PLATFORM"
}

# The simulator queue, which needs nothing installed; see scripts/simq.ts.
queue() {
  [ "${VERA_SIMQ:-on}" = off ] && return 0
  node --experimental-strip-types --no-warnings "$ROOT/scripts/simq.ts" "$@" --worktree "$ROOT"
}

require_up() {
  load
  if [ -z "$DEVICE" ]; then
    cat "$STATE_DIR/$PLATFORM.reclaimed" >&2 2>/dev/null || true
    echo "no simulator yet; run scripts/sim.sh up" >&2
    exit 1
  fi
}

fingerprint() {
  (cd "$MOBILE" && pnpm exec expo-updates fingerprint:generate --platform ios </dev/null 2>/dev/null) |
    node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).hash))'
}

build_ios_client() {
  npx expo prebuild --platform ios --clean </dev/null
  # Prebuild names the project after the app ("SYNQ Dev" → SYNQDev).
  local project
  project="$(basename ios/*.xcworkspace .xcworkspace)"
  xcodebuild -workspace "ios/$project.xcworkspace" -scheme "$project" -configuration Debug \
    -sdk iphonesimulator -derivedDataPath ios/build CODE_SIGN_IDENTITY=- \
    CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM=39K6A9FP99 \
    PROVISIONING_PROFILE_SPECIFIER= -quiet build
  cp -R "ios/build/Build/Products/Debug-iphonesimulator/$project.app" "$1"
}

# Builds `artifact` with `scripts/sim.sh <internal command> <path>` under
# the heavy-work lock, unless a worktree already did. Sets BUILT.
ensure_built() {
  local dir="$1" artifact="$2" command="$3" what="$4" lock
  BUILT="$artifact"
  [ -e "$artifact" ] && return
  mkdir -p "$(dirname "$dir")"
  lock="$dir.lock"
  until mkdir "$lock" 2>/dev/null; do
    echo "another worktree is building this $what; waiting"
    sleep 15
    [ -e "$artifact" ] && return
  done
  # shellcheck disable=SC2064 # the path now: lock is local
  trap "rmdir '$lock' 2>/dev/null || true" EXIT
  rm -rf "$dir.partial"
  mkdir -p "$dir.partial"
  # Under the heavy-work lock SYNQ and Vera share, so builds never overlap.
  (cd "$MOBILE" && "$ROOT/scripts/bench/with-lock.sh" "$ROOT/scripts/sim.sh" "$command" "$dir.partial/$(basename "$artifact")")
  # A failed build must not leave an empty cache entry that looks finished.
  if [ ! -e "$dir.partial/$(basename "$artifact")" ]; then
    echo "the $what build failed; see the output above" >&2
    rm -rf "$dir.partial"
    exit 1
  fi
  mv "$dir.partial" "$dir"
  rmdir "$lock"
  trap - EXIT
}

# Builds the dev client for this fingerprint unless a worktree already did.
ensure_client() {
  local hash dir
  hash="$(fingerprint)"
  dir="$CACHE/dev-client-$PLATFORM/$hash"
  if [ ! -e "$dir/SYNQ.app" ]; then
    echo "building the iOS dev client for fingerprint $hash (native code changed or first run)"
  fi
  ensure_built "$dir" "$dir/SYNQ.app" build-client "dev client"
  CLIENT="$BUILT"
}

# SYNQ, the production variant (no APP_VARIANT), as a Release simulator
# build: what people get from the App Store, with the JavaScript embedded,
# so it needs no Metro. Used to install 3.0 over 2.5.2
# (scripts/upgrade-test.sh). metro.sh exports the dev variant, so this
# overrides it for the fingerprint and the build.
build_ios_release() {
  export APP_VARIANT=production
  npx expo prebuild --platform ios --clean </dev/null
  local project
  project="$(basename ios/*.xcworkspace .xcworkspace)"
  xcodebuild -workspace "ios/$project.xcworkspace" -scheme "$project" -configuration Release \
    -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' ARCHS=arm64 \
    ONLY_ACTIVE_ARCH=YES -derivedDataPath ios/build CODE_SIGN_IDENTITY=- \
    CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM=39K6A9FP99 \
    PROVISIONING_PROFILE_SPECIFIER= -quiet build
  cp -R "ios/build/Build/Products/Release-iphonesimulator/$project.app" "$1"
}

# What the embedded JavaScript is built from: the app's and packages'
# source files as they are in this worktree (tests, fixtures, and scripts
# left out), sorted, since git lists tracked files before untracked ones and
# a commit mustn't change the name. With the native fingerprint, it names a
# release build.
javascript_hash() {
  (
    cd "$ROOT"
    git ls-files -z --cached --others --exclude-standard -- apps/mobile packages pnpm-lock.yaml \
      ':!*.test.ts' ':!*.test.tsx' ':!*.md' ':!apps/mobile/perf/*' ':!apps/mobile/dev/*' \
      ':!packages/*/scripts/*' ':!packages/*/fixtures/*' ':!packages/*/src/testing/*' |
      xargs -0 shasum 2>/dev/null | LC_ALL=C sort -k2 | shasum | cut -c1-12
  )
}

# The production Release build for this worktree's code; the newest three
# are kept.
ensure_release() {
  local hash dir old
  hash="$(APP_VARIANT=production fingerprint)-$(javascript_hash)"
  dir="$CACHE/release-$PLATFORM/$hash"
  if [ ! -e "$dir/SYNQ.app" ]; then
    echo "building SYNQ (production, Release) for $hash; about 15 minutes" >&2
  fi
  ensure_built "$dir" "$dir/SYNQ.app" build-release-app "release build" >&2
  RELEASE="$BUILT"
  touch "$dir"
  # shellcheck disable=SC2012 # names are hashes
  for old in $(ls -t "$CACHE/release-$PLATFORM" | grep -v '\.' | tail -n +4); do
    rm -rf "${CACHE:?}/release-$PLATFORM/$old"
  done
}

latest_ios_runtime() {
  xcrun simctl list runtimes -j | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const ios=JSON.parse(s).runtimes.filter(r=>r.platform==="iOS"&&r.isAvailable);
      console.log(ios.at(-1).identifier);
    })'
}

# The Mac's CPU, busy percent of all cores over two seconds.
cpu_busy() {
  top -l 2 -s 2 -n 0 | awk '/CPU usage/ { for (i = 1; i <= NF; i++) if ($i == "idle") idle = $(i - 1) } END { sub("%", "", idle); printf "%d\n", 100 - idle }'
}

# The simulator every worktree's is cloned from, SYNQ's and Vera's alike:
# booted once until iOS's first-boot work is done, then shut down for good.
# One per runtime, recorded and locked in Vera's cache exactly as Vera's
# sim.sh does, so whichever repo needs it first makes it, inside that
# `up`'s queue slot; a new runtime (an Xcode update) replaces it.
ios_template() {
  local runtime record udid lock name calm=0 started old
  runtime="$(latest_ios_runtime)"
  record="$VERA_CACHE/ios-template-$runtime"
  udid="$(cat "$record" 2>/dev/null || true)"
  if [ -n "$udid" ] && xcrun simctl list devices -j | grep -q "\"$udid\""; then
    echo "$udid"
    return
  fi
  lock="$VERA_CACHE/ios-template.lock"
  until mkdir "$lock" 2>/dev/null; do
    echo "another worktree is preparing the simulator template; waiting" >&2
    sleep 10
  done
  # shellcheck disable=SC2064 # the path now: lock is local
  trap "rmdir '$lock' 2>/dev/null || true" EXIT
  udid="$(cat "$record" 2>/dev/null || true)"
  if [ -z "$udid" ] || ! xcrun simctl list devices -j | grep -q "\"$udid\""; then
    # Vera's name, since it's Vera's template too (its skills say never to
    # open the "Vera template" simulator).
    name="Vera template ${runtime##*.}"
    echo "preparing the simulator template for ${runtime##*.} (once per iOS version, about 3 minutes)" >&2
    udid="$(xcrun simctl create "$name" "$IOS_DEVICE_TYPE" "$runtime")"
    xcrun simctl bootstatus "$udid" -b >/dev/null
    # First-boot setup has finished when the CPU stays calm.
    started=$SECONDS
    sleep 60
    while [ $((SECONDS - started)) -lt 300 ] && [ "$calm" -lt 3 ]; do
      if [ "$(cpu_busy)" -lt 40 ]; then calm=$((calm + 1)); else calm=0; fi
      sleep 5
    done
    xcrun simctl shutdown "$udid"
    echo "$udid" >"$record"
    # Templates for older runtimes.
    for old in "$VERA_CACHE"/ios-template-*; do
      [ "$old" = "$record" ] && continue
      xcrun simctl delete "$(cat "$old")" 2>/dev/null || true
      rm -f "$old"
    done
  fi
  rmdir "$lock"
  trap - EXIT
  echo "$udid"
}

ensure_ios_device() {
  if [ -z "$DEVICE" ] || ! xcrun simctl list devices -j | grep -q "\"$DEVICE\""; then
    DEVICE="$(xcrun simctl clone "$(ios_template)" "SYNQ $(slug)")"
    echo "created simulator SYNQ $(slug) ($DEVICE)"
  fi
  xcrun simctl bootstatus "$DEVICE" -b >/dev/null
}

install_client() {
  xcrun simctl install "$DEVICE" "$CLIENT"
  # No dev menu tour or floating tools button in screenshots; the dev
  # menu still opens with Cmd-Ctrl-Z or a shake.
  xcrun simctl spawn "$DEVICE" defaults write "$BUNDLE_ID" EXDevMenuIsOnboardingFinished -bool YES
  xcrun simctl spawn "$DEVICE" defaults write "$BUNDLE_ID" EXDevMenuShowFloatingActionButton -bool NO
  xcrun simctl spawn "$DEVICE" defaults write "$BUNDLE_ID" EXDevMenuShowsAtLaunch -bool NO
}

# Metro's debugger targets are named after the device (the simulator's
# name). The phone shares this Metro, so this tells the two apart.
target_name() { echo "SYNQ $(slug)"; }

app_eval() {
  SYNQ_DEVICE="$(target_name)" node "$ROOT/scripts/sim-eval.mjs" "$PORT" "$1"
}

# Brings the running app to the front without restarting it. On a fresh
# simulator, SpringBoard can come up over the app after it launches.
front() {
  xcrun simctl launch "$DEVICE" "$BUNDLE_ID" >/dev/null
}

# Moves the app to a route through the dev-only `synqDev` hook over Metro's
# debugger connection. Deep links would work too, but iOS asks "Open in
# SYNQ Dev?" before every `simctl openurl`, which scripts cannot answer.
open_path() {
  local path="/${1#/}"
  front
  app_eval "globalThis.synqDev.open($(node -p 'JSON.stringify(process.argv[1])' "$path"))" >/dev/null
  echo "opened $path"
}

# Copies apps/mobile/dev/sample-library into the app's caches, where the
# dev-only `synqDev.seed()` (src/features/dev/seed.ts) reads it.
seed() {
  local songs=0 reset=false arg
  for arg in "$@"; do
    case "$arg" in
      --reset) reset=true ;;
      *[!0-9]* | "") echo "usage: scripts/sim.sh seed [songs] [--reset]" >&2 && exit 2 ;;
      *) songs="$arg" ;;
    esac
  done
  local container staged
  container="$(xcrun simctl get_app_container "$DEVICE" "$BUNDLE_ID" data)"
  staged="$container/Library/Caches/synq-seed"
  rm -rf "$staged"
  mkdir -p "$staged"
  cp -R "$MOBILE/dev/sample-library/audio" "$MOBILE/dev/sample-library/covers" \
    "$MOBILE/dev/sample-library/manifest.json" "$staged/"
  # Thousands of songs take a while to write.
  SYNQ_EVAL_TIMEOUT_MS=180000 app_eval "globalThis.synqDev.seed({ reset: $reset, songs: $songs })"
}

launch() {
  xcrun simctl terminate "$DEVICE" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl launch "$DEVICE" "$BUNDLE_ID" --initialUrl "http://127.0.0.1:$PORT" >/dev/null
  for _ in $(seq 1 120); do
    if app_eval "typeof globalThis.synqDev" 2>/dev/null | grep -q object; then
      front
      return
    fi
    sleep 1
  done
  echo "the app did not finish loading; see $STATE_DIR/metro.log" >&2
  exit 1
}

up() {
  load
  ensure_client
  rm -f "$STATE_DIR/$PLATFORM.reclaimed"
  "$ROOT/scripts/phone.sh" sweep || true
  queue acquire "$PLATFORM"
  ensure_ios_device
  # Saved before anything else can fail, so the next `up` reuses this device
  # and `down` can reach it.
  save
  install_client
  ensure_metro
  save
  launch
  queue ready "$PLATFORM" --device "$DEVICE" --metro-pid "$METRO_PID"
  status
  echo "watch it in T3 Code: device_open with deviceId $DEVICE, once (device_list shows what's open)"
  echo "when done: device_close, then scripts/sim.sh down, before you end your turn"
}

# A device for this worktree with no app or Metro: the queue slot, the
# clone, and the state `down` reads, as `up` makes them.
boot() {
  load
  rm -f "$STATE_DIR/$PLATFORM.reclaimed"
  queue acquire "$PLATFORM" >&2
  ensure_ios_device >&2
  save
  queue ready "$PLATFORM" --device "$DEVICE" >&2
  echo "$DEVICE"
}

status() {
  load
  echo "ios: ${DEVICE:-none}"
  echo "metro: ${PORT:-none} ($(metro_running && echo running || echo stopped))"
}

shot() {
  require_up
  local file="$EVIDENCE/$1.png"
  xcrun simctl io "$DEVICE" screenshot "$file" >/dev/null 2>&1
  echo "$file"
}

record() {
  require_up
  local name="$1"
  RECORD_PID="$(node - "$DEVICE" "$name" "$EVIDENCE" "$STATE_DIR" <<'JS'
const { spawn } = require("node:child_process");
const { openSync, closeSync } = require("node:fs");
const [device, name, evidence, state] = process.argv.slice(2);
const output = openSync(`${state}/ios.recording.log`, "w");
const args = ["simctl", "io", device, "recordVideo", "--codec", "h264", "--force", `${evidence}/${name}.mp4`];
const child = spawn("xcrun", args, { detached: true, stdio: ["ignore", output, output] });
child.unref();
closeSync(output);
console.log(child.pid);
JS
)"
  echo "$name" >"$STATE_DIR/$PLATFORM.recording"
  save
  sleep 1
  echo "recording $name; scripts/sim.sh stop when done"
}

stop() {
  require_up
  if [ -n "$RECORD_PID" ]; then
    kill -INT "$RECORD_PID" 2>/dev/null || true
    while kill -0 "$RECORD_PID" 2>/dev/null; do sleep 0.2; done
  fi
  RECORD_PID=""
  save
  local name
  name="$(cat "$STATE_DIR/$PLATFORM.recording" 2>/dev/null || true)"
  rm -f "$STATE_DIR/$PLATFORM.recording"
  [ -n "$name" ] && echo "$EVIDENCE/$name.mp4"
}

down() {
  load
  local closed="$DEVICE"
  if [ -n "$RECORD_PID" ]; then kill -INT "$RECORD_PID" 2>/dev/null || true; fi
  if [ -n "$DEVICE" ]; then
    xcrun simctl shutdown "$DEVICE" 2>/dev/null || true
    xcrun simctl delete "$DEVICE" 2>/dev/null || true
  fi
  DEVICE="" RECORD_PID=""
  save
  rm -f "$STATE_DIR/$PLATFORM"
  queue release "$PLATFORM" || true
  echo "ios device stopped"
  [ -n "$closed" ] && echo "close it in T3's Device panel too if it's open there: device_close $closed"
  release_metro
}

command="${1:-status}"
shift || true
# The state file's mtime is when this worktree last used its device; the
# queue shuts down devices unused for a while when others are waiting.
case "$command" in
  up | boot | down | queue) ;;
  *) [ -f "$STATE_DIR/$PLATFORM" ] && touch "$STATE_DIR/$PLATFORM" ;;
esac
case "$command" in
  build) ensure_client && echo "$CLIENT" ;;
  build-release) ensure_release && echo "$RELEASE" ;;
  # Internal: ensure_client and ensure_release run these under the heavy-work lock.
  build-client) (cd "$MOBILE" && build_ios_client "${1:?artifact}") ;;
  build-release-app) (cd "$MOBILE" && build_ios_release "${1:?artifact}") ;;
  up) up ;;
  boot) boot ;;
  open) require_up && open_path "${1:?path}" ;;
  eval) require_up && app_eval "${1:?expression}" ;;
  seed) require_up && seed "$@" ;;
  frames)
    require_up
    case "${1:-}" in
      start)
        queue perf-start "$PLATFORM"
        if app_eval "globalThis.synqDev.frames.start()" >/dev/null; then
          echo "recording frames"
        else
          queue perf-stop "$PLATFORM" || true
          exit 1
        fi
        ;;
      stop)
        report=""
        if app_eval "globalThis.synqDev.frames.stop()" >/dev/null; then
          for _ in $(seq 1 20); do
            report="$(app_eval "globalThis.synqDev.frames.report()")" || break
            [ -n "$report" ] && echo "$report" && break
            sleep 0.25
          done
        fi
        # A crashed app must still release its measurement slot.
        queue perf-stop "$PLATFORM" || true
        [ -n "$report" ] || exit 1
        ;;
      *) echo "usage: scripts/sim.sh frames start|stop" >&2 && exit 2 ;;
    esac
    ;;
  relaunch) require_up && launch && echo "relaunched" ;;
  shot) shot "${1:?name}" ;;
  record) record "${1:?name}" ;;
  stop) stop ;;
  reload) require_up && app_eval "globalThis.synqDev.reload()" ;;
  status) status ;;
  queue) queue status ;;
  down) down ;;
  *)
    sed -n '2,60p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac
