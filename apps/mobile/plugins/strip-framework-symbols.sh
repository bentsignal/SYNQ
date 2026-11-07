#!/bin/sh
# Strips local symbols from the frameworks embedded in a Release build, then
# signs each one again. React Native, Hermes, and the Expo modules arrive as
# prebuilt frameworks with their symbol tables, which Xcode strips only from
# binaries it builds itself; this takes about 13 MB off the installed app.
# Exported symbols stay, as `strip -x` keeps them (Xcode's own style for
# dynamic libraries), and the archive's dSYMs still match by UUID.
#
# Runs as the app target's last build phase, after CocoaPods' "[CP] Embed
# Pods Frameworks" (with-stripped-frameworks.cjs).
set -eu

[ "$CONFIGURATION" = "Release" ] || exit 0
frameworks="$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH"
[ -d "$frameworks" ] || exit 0

for framework in "$frameworks"/*.framework; do
  [ -d "$framework" ] || continue
  binary="$framework/$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$framework/Info.plist")"
  before="$(stat -f%z "$binary")"
  xcrun strip -x -no_code_signature_warning "$binary"
  if [ -n "${EXPANDED_CODE_SIGN_IDENTITY:-}" ] && [ "${CODE_SIGNING_REQUIRED:-}" != "NO" ] &&
    [ "${CODE_SIGNING_ALLOWED:-}" != "NO" ]; then
    # shellcheck disable=SC2086 # OTHER_CODE_SIGN_FLAGS is a list of flags
    /usr/bin/codesign --force --sign "$EXPANDED_CODE_SIGN_IDENTITY" ${OTHER_CODE_SIGN_FLAGS:-} \
      --preserve-metadata=identifier,entitlements "$framework"
  fi
  echo "$(basename "$framework"): $before -> $(stat -f%z "$binary") bytes"
done
