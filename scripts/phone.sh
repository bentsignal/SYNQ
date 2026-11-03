#!/usr/bin/env bash
# SYNQ Dev on Shawn's iPhone: the dev client for this worktree's native
# code, loading JavaScript from this worktree's Metro over the Mac's Wi-Fi
# (the phone has to be on the same network). JavaScript changes hot-reload
# with no build; a native build happens only when this fingerprint has no
# dev client yet.
#
#   scripts/phone.sh <command>
#
#   up       build the dev client if needed, start Metro, print the open
#            links (what Shawn taps to load this worktree, at home and over
#            Tailscale) and the others
#   link     print the links again
#   status   the dev client for this fingerprint, Metro, and the Wi-Fi address
#   down     stop serving the phone; Metro stops unless the simulator uses it
#   main     the install link for main's dev client (building it if needed)
#   list     every cached dev client, marking main's
#   sweep    stop any worktree's phone server the phone hasn't loaded from
#            in a day (up, sim.sh up, and the agents' Stop hook run it)
#
# Dev clients are EAS `development` builds (ad hoc), built locally once per
# fingerprint and cached in ~/Library/Caches/synq, so every worktree reuses
# them. Their install pages are on bunny.net (scripts/install-page.sh).
# Builds run under the heavy-work lock Vera shares (scripts/bench/with-lock.sh).
#
# The phone holds one SYNQ Dev at a time, normally main's dev client, which
# serves every worktree that hasn't changed native code. A worktree that
# has gets its own dev client; once Shawn is done with it, `main` gives him
# main's back. Main's fingerprint comes from a checkout of origin/main kept
# in the cache. Ported from Vera's scripts/phone.sh, iOS only.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
MOBILE="$ROOT/apps/mobile"
STATE_DIR="$ROOT/.cache/sim"
PLATFORM=ios
CACHE="$HOME/Library/Caches/synq/phone-dev-client-ios"
MAIN_CHECKOUT="$HOME/Library/Caches/synq/main-checkout"
RELEASE_XCODE="/Applications/Xcode-27.app/Contents/Developer"
# The App Store Connect API key of Shawn's Apple team, which owns both SYNQ
# and Vera; EAS signs with it, so builds need no Apple ID login.
ASC_ENV="$HOME/.appstoreconnect/vera.env"
CDN="https://vera-evidence.b-cdn.net"
mkdir -p "$STATE_DIR" "$CACHE"
# shellcheck source=lib/metro.sh
. "$ROOT/scripts/lib/metro.sh"

# The runtime the `development` profile builds (eas.json sets the dev
# variant, already exported), for this checkout or the one at $1.
fingerprint() {
  (cd "${1:-$ROOT}/apps/mobile" && pnpm exec expo-updates fingerprint:generate --platform ios </dev/null 2>/dev/null) |
    node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).hash))'
}

# Main's fingerprint, recorded per origin/main commit in $CACHE/main. A new
# commit moves the cached checkout to it and installs its dependencies, which
# the fingerprint reads. Fails while main has no 3.0 app (before the rewrite
# merges). Run it in a subshell: the trap is its own.
main_fingerprint() {
  local commit record="$CACHE/main" lock="$MAIN_CHECKOUT.lock" hash
  git -C "$ROOT" fetch -q origin main
  commit="$(git -C "$ROOT" rev-parse origin/main)"
  if [ -f "$record" ] && [ "$(cut -d' ' -f1 "$record")" = "$commit" ]; then
    cut -d' ' -f2 "$record"
    return
  fi
  git -C "$ROOT" cat-file -e "$commit:apps/mobile/app.config.ts" 2>/dev/null || return 1
  until mkdir "$lock" 2>/dev/null; do
    echo "another worktree is updating main's checkout; waiting" >&2
    sleep 5
  done
  # shellcheck disable=SC2064 # the path now: lock is local
  trap "rmdir '$lock' 2>/dev/null || true" EXIT
  echo "checking main's native fingerprint (${commit:0:9})" >&2
  if [ -d "$MAIN_CHECKOUT" ]; then
    git -C "$MAIN_CHECKOUT" checkout -q --detach "$commit"
  else
    git -C "$ROOT" worktree add -q --detach "$MAIN_CHECKOUT" "$commit"
  fi
  (cd "$MAIN_CHECKOUT" && pnpm install --frozen-lockfile --silent </dev/null) >&2
  hash="$(fingerprint "$MAIN_CHECKOUT")"
  echo "$commit $hash" >"$record"
  echo "$hash"
}

# The Mac's address on the local network: the default route's interface,
# else Wi-Fi. A plain private IP, because iOS's App Transport Security
# allows plain HTTP to local network addresses (NSAllowsLocalNetworking) but
# blocks it to tailnet (100.x) ones.
address() {
  local iface ip
  iface="$(route -n get default 2>/dev/null | awk '/interface:/ { print $2 }')"
  ip="$(ipconfig getifaddr "${iface:-en0}" 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || true)"
  if [ -z "$ip" ]; then
    echo "this Mac has no local network address; connect it to the phone's Wi-Fi" >&2
    exit 1
  fi
  echo "$ip"
}

build_ios() {
  set -a
  # shellcheck disable=SC1090
  . "$ASC_ENV"
  set +a
  (
    cd "$MOBILE"
    # Release Xcode, as store builds use; it compiles the iOS 27 search tab.
    if [ -d "$RELEASE_XCODE" ]; then export DEVELOPER_DIR="$RELEASE_XCODE"; fi
    # CocoaPods comes from rbenv, which only login shells set up.
    PATH="/opt/homebrew/bin:$HOME/.rbenv/shims:$PATH" "$ROOT/scripts/bench/with-lock.sh" \
      eas build -p ios --profile development --local --non-interactive --output "$1" </dev/null
  )
}

# Sets CLIENT_DIR to this fingerprint's dev client, building it unless a
# worktree already did. Sets BUILT when this run made it.
ensure_client() {
  local hash lock artifact
  hash="$(fingerprint)"
  CLIENT_DIR="$CACHE/$hash"
  BUILT=""
  if [ -f "$CLIENT_DIR/install-url" ]; then
    # Install pages over 30 days old are deleted (scripts/install-page.sh);
    # upload the cached build again if this one's is gone.
    if ! curl -fsSI "$(cat "$CLIENT_DIR/install-url")" >/dev/null 2>&1; then
      echo "the install page expired; uploading the cached dev client again"
      "$ROOT/scripts/install-page.sh" "$CLIENT_DIR/synq-dev.ipa" \
        "dev-client/ios/$hash" "Dev client for native fingerprint ${hash:0:12}." >"$CLIENT_DIR/install-url"
    fi
    return
  fi
  lock="$CLIENT_DIR.lock"
  until mkdir "$lock" 2>/dev/null; do
    echo "another worktree is building this dev client; waiting"
    sleep 15
    [ -f "$CLIENT_DIR/install-url" ] && return
  done
  trap 'rmdir "$lock" 2>/dev/null || true' EXIT
  mkdir -p "$CLIENT_DIR.partial"
  artifact="$CLIENT_DIR.partial/synq-dev.ipa"
  # EAS writes the artifact only when the build succeeds, so one left by a
  # failed upload is complete.
  if [ ! -f "$artifact" ]; then
    echo "building the iOS dev client for fingerprint $hash (native code changed, or the first one); about 15 minutes"
    build_ios "$artifact"
  fi
  "$ROOT/scripts/install-page.sh" "$artifact" "dev-client/ios/$hash" \
    "Dev client for native fingerprint ${hash:0:12}." >"$CLIENT_DIR.partial/install-url"
  git -C "$ROOT" rev-parse HEAD >"$CLIENT_DIR.partial/commit"
  rm -rf "$CLIENT_DIR"
  mv "$CLIENT_DIR.partial" "$CLIENT_DIR"
  rmdir "$lock"
  trap - EXIT
  BUILT=1
}

# The https page that opens SYNQ Dev at a server (scripts/lib/open-page.html),
# uploaded once per version of the page. Chat apps only make http(s) links
# tappable, so Shawn gets this instead of a synq-dev:// link.
open_page() {
  local file="$ROOT/scripts/lib/open-page.html" hash path log
  hash="$(shasum -a 256 "$file" | cut -c1-12)"
  path="synq/dev-client/open-$hash.html"
  if [ ! -f "$HOME/Library/Caches/synq/open-page-$hash" ]; then
    log="$(bunny storage files upload "$file" --zone vera-evidence --to "$path" --content-type text/html 2>&1)" || {
      echo "$log" >&2
      exit 1
    }
    touch "$HOME/Library/Caches/synq/open-page-$hash"
  fi
  echo "$CDN/$path"
}

# What Shawn taps to load the server at $1 in SYNQ Dev.
open_url() {
  echo "$(open_page)?url=$(node -p 'encodeURIComponent(process.argv[1])' "$1")"
}

# The Mac's name on the tailnet, or nothing when Tailscale isn't running.
tailnet_host() {
  command -v tailscale >/dev/null || return 0
  tailscale status --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    try{const j=JSON.parse(s);if(j.BackendState==="Running")console.log(j.Self.DNSName.replace(/\.$/,""))}catch{}
  })'
}

# Serves Metro over HTTPS on the tailnet too (tailnet only), so Shawn can
# test away from the Mac's Wi-Fi. iOS blocks plain HTTP to tailnet
# addresses, and Metro answers with bundle URLs on whatever host the phone
# used, so the bundle comes over the same proxy. Prints the server URL.
serve_tailnet() {
  local host
  host="$(tailnet_host)"
  [ -n "$host" ] || return 0
  if tailscale serve --bg --https="$PORT" "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
    echo "https://$host:$PORT"
  else
    echo "couldn't serve Metro over Tailscale; only the Wi-Fi link works" >&2
  fi
}

# Stops serving Metro on the tailnet once the phone doesn't use it. Runs
# before release_metro, which forgets the port.
unserve_tailnet() {
  [ -f "$STATE_DIR/phone-ios" ] && return 0
  load_metro
  if [ -n "$PORT" ] && command -v tailscale >/dev/null; then
    tailscale serve --https="$PORT" off >/dev/null 2>&1 || true
  fi
}

# What to send Shawn, as Markdown he can use in one tap: the open links as
# a list, then each server address in its own code block (T3 gives code
# blocks a copy button). One Metro serves both addresses; Tailscale is a
# proxy in front of it.
links() {
  load_metro
  local install wifi tailnet
  install="$(cat "$CLIENT_DIR/install-url")"
  wifi="http://$(address):$PORT"
  tailnet="$(serve_tailnet)"
  "$ROOT/scripts/qr.sh" "$install" "$STATE_DIR/phone-ios-install.png" >/dev/null
  "$ROOT/scripts/qr.sh" "$(open_url "$wifi")" "$STATE_DIR/phone-ios-open.png" >/dev/null
  echo "---- send Shawn this as it is ----"
  echo "- [Open in SYNQ Dev]($(open_url "$wifi"))"
  [ -z "$tailnet" ] || echo "- [Open in SYNQ Dev over Tailscale]($(open_url "$tailnet"))"
  printf '\nHome Wi-Fi:\n\n```text\n%s\n```\n' "$wifi"
  [ -z "$tailnet" ] || printf '\nTailscale:\n\n```text\n%s\n```\n' "$tailnet"
  echo "---- end ----"
  echo "add when he has to install first:"
  echo "- [Install SYNQ Dev]($install)"
  echo "QR codes: $STATE_DIR/phone-ios-open.png"
  echo "          $STATE_DIR/phone-ios-install.png"
}

# Metro writes to its log whenever the phone loads a bundle, reloads, or
# logs, so a phone server whose log hasn't changed in a day is one Shawn
# stopped testing: usually a thread that ended without `phone.sh down`.
# Stops those in every worktree and leaves a note that the worktree's next
# phone.sh command prints. A simulator using the same Metro keeps it; the
# simulator queue looks after those.
PHONE_IDLE_MINUTES=$((24 * 60))
sweep() {
  local tree state
  git -C "$ROOT" worktree list --porcelain | sed -n 's/^worktree //p' | while read -r tree; do
    state="$tree/.cache/sim"
    [ -f "$state/phone-ios" ] || continue
    grep -Eqs '^DEVICE=.+' "$state/ios" && continue
    [ -n "$(find "$state/metro.log" -mmin +"$PHONE_IDLE_MINUTES" 2>/dev/null)" ] || continue
    (
      STATE_DIR="$state"
      OWN_CLIENT=""
      # shellcheck disable=SC1091
      . "$state/phone-ios"
      {
        echo "Stopped serving the phone: nothing loaded from it for a day. \`scripts/phone.sh up\` serves it again."
        [ -z "$OWN_CLIENT" ] || echo "SYNQ Dev on the phone may still be this worktree's dev client; \`scripts/phone.sh main\` gives Shawn main's back."
      } >"$state/phone-ios.reclaimed"
      rm -f "$state/phone-ios"
      unserve_tailnet
      release_metro >/dev/null
    )
    echo "stopped the idle phone server in $(basename "$tree")"
  done
}

# Prints, once, why this worktree's phone server was stopped.
reclaimed() {
  [ -f "$STATE_DIR/phone-ios.reclaimed" ] || return 0
  cat "$STATE_DIR/phone-ios.reclaimed" >&2
  rm -f "$STATE_DIR/phone-ios.reclaimed"
}

up() {
  local main own=""
  reclaimed
  sweep
  address >/dev/null
  # Offline, mid-conflict, or main without the 3.0 app: serve anyway and
  # say main's is unknown.
  main="$(main_fingerprint)" || main=""
  ensure_client
  ensure_metro
  [ -z "$main" ] || [ "$(basename "$CLIENT_DIR")" = "$main" ] || own=1
  printf 'PLATFORM=ios\nOWN_CLIENT=%s\n' "$own" >"$STATE_DIR/phone-ios"
  if [ -z "$main" ]; then
    echo "couldn't check main's native fingerprint: if SYNQ Dev on the phone isn't this worktree's dev client, install it first"
  elif [ -n "$own" ]; then
    echo "this worktree's native code differs from main's, so it has its own dev client: Shawn installs it from the install link first, and gets main's back afterwards (scripts/phone.sh main)"
  elif [ -n "$BUILT" ]; then
    echo "new dev client for main's native code: Shawn installs it from the install link first; it's main's dev client from now on"
  else
    echo "this worktree uses main's dev client: if SYNQ Dev on the phone is main's current dev client, only the open link is needed; otherwise (an older dev client, or another worktree's) install it first"
  fi
  links
}

# This checkout's dev client and its install link, without Metro (`main`
# runs it in main's checkout).
client() {
  ensure_client
  "$ROOT/scripts/qr.sh" "$(cat "$CLIENT_DIR/install-url")" "$STATE_DIR/phone-ios-install.png" >/dev/null
  echo "- [Install SYNQ Dev]($(cat "$CLIENT_DIR/install-url"))"
  echo "QR code:  $STATE_DIR/phone-ios-install.png"
}

main_client() {
  local main
  main="$(main_fingerprint)" || {
    echo "main has no 3.0 app yet, so there's no main dev client" >&2
    return 1
  }
  echo "main's dev client (fingerprint ${main:0:12}):"
  # From inside it: the script finds its checkout from the working directory.
  (cd "$MAIN_CHECKOUT" && scripts/phone.sh client)
}

list() {
  local main dir
  main="$(main_fingerprint)" || main=""
  for dir in "$CACHE"/*/; do
    dir="${dir%/}"
    [ -f "$dir/install-url" ] || continue
    printf '%s  built from %s  %s%s\n' "$(basename "$dir" | cut -c1-12)" \
      "$(cut -c1-9 "$dir/commit")" "$(cat "$dir/install-url")" \
      "$([ "$(basename "$dir")" = "$main" ] && echo "  (main)")"
  done
}

status() {
  local hash
  hash="$(fingerprint)"
  CLIENT_DIR="$CACHE/$hash"
  echo "fingerprint: $hash"
  if [ -f "$CLIENT_DIR/install-url" ]; then
    echo "dev client: $(cat "$CLIENT_DIR/install-url") (built from $(cut -c1-9 "$CLIENT_DIR/commit"))"
  else
    echo "dev client: none for this fingerprint; up builds one"
  fi
  load_metro
  echo "metro: ${PORT:-none} ($(metro_running && echo running || echo stopped))"
  echo "serving the phone: $([ -f "$STATE_DIR/phone-ios" ] && echo yes || echo no)"
  echo "Wi-Fi address: $(address) (the phone must be on the same network)"
}

down() {
  local OWN_CLIENT=""
  # shellcheck disable=SC1091
  [ -f "$STATE_DIR/phone-ios" ] && . "$STATE_DIR/phone-ios"
  rm -f "$STATE_DIR/phone-ios"
  echo "stopped serving the phone"
  unserve_tailnet
  release_metro
  if [ -n "$OWN_CLIENT" ]; then
    echo "SYNQ Dev on the phone is this worktree's dev client; give Shawn main's back:"
    main_client
  fi
}

command="${1:-status}"
shift || true
case "$command" in
  up) up ;;
  link)
    CLIENT_DIR="$CACHE/$(fingerprint)"
    [ -f "$CLIENT_DIR/install-url" ] || {
      echo "no dev client for this fingerprint; run scripts/phone.sh up" >&2
      exit 1
    }
    load_metro
    metro_running || {
      reclaimed
      echo "Metro is not running; run scripts/phone.sh up" >&2
      exit 1
    }
    links
    ;;
  status)
    reclaimed
    status
    ;;
  down) down ;;
  main) main_client ;;
  client) client ;;
  list) list ;;
  sweep) sweep ;;
  *)
    sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac
