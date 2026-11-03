#!/usr/bin/env bash
# Runs the app's real AudioMetadata.swift, and an AVAssetReader decode, over the
# original and exported corpus: Apple's parsers read and decode every copy.
# Apple's MP3 sample count moves with the size of the tag ahead of the audio, by
# about a frame, for tags from any tool and with identical audio bytes (README),
# so MP3 counts are compared within that. Usage:
#   verify-apple.sh <corpus> <exported> <work-dir>
set -euo pipefail
corpus=$1 out=$2 work=$3
here="$(cd "$(dirname "$0")" && pwd)"
ios="$here/../../apps/mobile/modules/synq-media/ios"
mkdir -p "$work"
swiftc -O -parse-as-library -o "$work/harness" \
  "$here/AvHarness.swift" "$ios/AudioMetadata.swift" 2>/dev/null
python3 - "$corpus" "$out" "$work" <<'PY'
import json, os, subprocess, sys
corpus, out, work = sys.argv[1:4]
harness = os.path.join(work, "harness")
results = json.load(open(os.path.join(out, "_results.json")))
expected = json.load(open(os.path.join(out, "..", "expected.json")))
def call(*args):
    try:
        done = subprocess.run([harness, *args], capture_output=True, text=True, timeout=30, stdin=subprocess.DEVNULL)
        return json.loads(done.stdout or "{}")
    except subprocess.TimeoutExpired:
        return {"error": "timed out"}
    except json.JSONDecodeError:
        return {"error": "bad output"}
# 1152 samples in a frame, and the decoder delay's 529 on top.
MP3_TOLERANCE = 1152 + 529
problems = 0
checked = 0
for name, result in sorted(results.items()):
    source, copy = os.path.join(corpus, name), os.path.join(out, name)
    before, after = call("decode", source), call("decode", copy)
    if "error" in before:
        continue  # Apple can't decode the original either: it's never importable.
    checked += 1
    close = (
        result["format"] == "mp3"
        and "samples" in after
        and abs(before["samples"] - after["samples"]) <= MP3_TOLERANCE
    )
    if before != after and not close:
        problems += 1
        print(f"  {name}: decode {before} -> {after}")
    read = call("read", copy, os.path.join(work, "art"))
    if result["tagged"] and result["format"] in ("mp3", "mp4", "adts", "wav"):
        for key in ("title", "album"):
            if read.get(key) != expected[key]:
                problems += 1
                print(f"  {name}: AVFoundation {key} {read.get(key)!r}")
        if not read.get("hasArtwork"):
            problems += 1
            print(f"  {name}: AVFoundation sees no artwork")
print(f"Apple: decoded {checked} exports, {problems} problems")
sys.exit(1 if problems else 0)
PY
