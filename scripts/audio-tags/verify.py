#!/usr/bin/env python3
"""Checks every exported file with tools that aren't SYNQ's: ffprobe and ffmpeg
(tags, packets, a full decode) and mutagen (tags, artwork). Prints one line per
problem and exits non-zero if there are any. See README.md.

  verify.py <corpus-dir> <exported-dir> <expected.json>
"""
import json
import os
import struct
import subprocess
import sys
import unicodedata

from mutagen.flac import FLAC
from mutagen.id3 import ID3, ID3NoHeaderError
from mutagen.mp4 import MP4
from mutagen.wave import WAVE

CORPUS, EXPORTED, EXPECTED_PATH = sys.argv[1:4]
with open(EXPECTED_PATH) as f:
    EXPECTED = json.load(f)
with open(os.path.join(CORPUS, "_cover.jpg"), "rb") as f:
    COVER = f.read()
problems = []
checked = 0


def problem(name, text):
    problems.append(f"{name}: {text}")


def run(*args):
    return subprocess.run(args, capture_output=True, stdin=subprocess.DEVNULL, timeout=120)


def probe_tags(path):
    result = run("ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path)
    if result.returncode != 0:
        return None
    data = json.loads(result.stdout)
    tags = {}
    for stream in data.get("streams", []):
        if stream.get("codec_type") == "audio":
            tags.update({k.lower(): v for k, v in stream.get("tags", {}).items()})
    tags.update({k.lower(): v for k, v in data.get("format", {}).get("tags", {}).items()})
    return tags


def packets_md5(path):
    return run("ffmpeg", "-nostdin", "-v", "error", "-i", path, "-map", "0:a:0", "-c", "copy", "-f", "md5", "-").stdout.strip()


def decoded_md5(path):
    result = run("ffmpeg", "-nostdin", "-v", "error", "-i", path, "-map", "0:a:0", "-f", "md5", "-")
    return result.stdout.strip(), result.stderr.decode(errors="replace").strip()


def afinfo_ok(path):
    """Whether Apple's parser opens it; None if it hangs (it does on some junk)."""
    try:
        return subprocess.run(
            ["afinfo", path], capture_output=True, stdin=subprocess.DEVNULL, timeout=5
        ).returncode == 0
    except subprocess.TimeoutExpired:
        return None


def read(path):
    with open(path, "rb") as f:
        return f.read()


def syncsafe(data):
    return (data[0] << 21) | (data[1] << 14) | (data[2] << 7) | data[3]


def id3v2_length(data):
    if data[:3] != b"ID3" or data[3] == 0xFF or any(b >= 0x80 for b in data[6:10]):
        return 0
    return 10 + syncsafe(data[6:10]) + (10 if data[3] == 4 and data[5] & 0x10 else 0)


def payload(data):
    """The audio bytes: the file without its tags, per format, by hand."""
    if data[:4] == b"RIFF":
        at = 12
        while at + 8 <= len(data):
            size = struct.unpack("<I", data[at + 4 : at + 8])[0]
            if data[at : at + 4] == b"data":
                return data[at + 8 : at + 8 + size]
            at += 8 + size + (size & 1)
        return b""
    start = id3v2_length(data)
    if data[start : start + 4] == b"fLaC":
        at = start + 4
        while True:
            header = data[at]
            at += 4 + int.from_bytes(data[at + 1 : at + 4], "big")
            if header & 0x80:
                return data[at:]
    end = len(data) - 128 if data[-128:-125] == b"TAG" else len(data)
    return data[start:end]


def want(name, tool, field, actual, expected):
    if actual != expected:
        problem(name, f"{tool} {field}: {actual!r}, expected {expected!r}")


def id3_text(tags, frame):
    found = tags.get(frame)
    return None if found is None else " / ".join(str(v) for v in found.text)


def check_id3(name, tags, source_tags):
    want(name, "mutagen", "TIT2", id3_text(tags, "TIT2"), EXPECTED["title"])
    want(name, "mutagen", "TPE1", id3_text(tags, "TPE1"), EXPECTED["artist"])
    want(name, "mutagen", "TPE2", id3_text(tags, "TPE2"), EXPECTED["albumArtist"])
    want(name, "mutagen", "TALB", id3_text(tags, "TALB"), EXPECTED["album"])
    track = id3_text(tags, "TRCK") or ""
    want(name, "mutagen", "TRCK", track.split("/")[0], str(EXPECTED["track"]))
    year = str(tags.get("TDRC").text[0]) if tags.get("TDRC") else id3_text(tags, "TYER")
    want(name, "mutagen", "year", (year or "")[:4], str(EXPECTED["year"]))
    pictures = tags.getall("APIC")
    if not pictures or pictures[0].data != COVER:
        problem(name, f"mutagen: first picture isn't the new cover ({len(pictures)} pictures)")
    if source_tags is None:
        return
    # Everything else in the source survives.
    for key in ("USLT", "COMM", "TXXX", "TCON", "TCMP", "PRIV"):
        before = source_tags.getall(key)
        after = tags.getall(key)
        if len(after) < len(before):
            problem(name, f"mutagen: lost {key} ({len(before)} -> {len(after)})")
        else:
            for old, new in zip(before, after):
                if key != "TCON" and str(old) != str(new):
                    problem(name, f"mutagen: {key} changed: {old!r} -> {new!r}")
    other = [p.type for p in source_tags.getall("APIC") if p.type not in (0, 3)]
    kept = [p.type for p in pictures]
    for kind in other:
        if kind not in kept:
            problem(name, f"mutagen: lost picture type {int(kind)}")


def check_flac(name, path, source):
    tags = FLAC(path)
    want(name, "mutagen", "TITLE", tags.get("title"), [EXPECTED["title"]])
    want(name, "mutagen", "ARTIST", tags.get("artist"), [EXPECTED["artist"]])
    want(name, "mutagen", "ALBUMARTIST", tags.get("albumartist"), [EXPECTED["albumArtist"]])
    want(name, "mutagen", "ALBUM", tags.get("album"), [EXPECTED["album"]])
    want(name, "mutagen", "TRACKNUMBER", (tags.get("tracknumber") or [""])[0].split("/")[0], str(EXPECTED["track"]))
    want(name, "mutagen", "DATE", (tags.get("date") or [""])[0][:4], str(EXPECTED["year"]))
    if not tags.pictures or tags.pictures[0].data != COVER:
        problem(name, f"mutagen: first picture isn't the new cover ({len(tags.pictures)} pictures)")
    try:
        before = FLAC(source)
    except Exception:
        return
    for key in ("genre", "lyrics", "replaygain_track_gain", "compilation"):
        if before.get(key) and before.get(key) != tags.get(key):
            problem(name, f"mutagen: lost {key}: {before.get(key)} -> {tags.get(key)}")
    other = [p.type for p in before.pictures if p.type not in (0, 3)]
    for kind in other:
        if kind not in [p.type for p in tags.pictures]:
            problem(name, f"mutagen: lost picture type {kind}")
    if before.info.md5_signature != tags.info.md5_signature:
        problem(name, "STREAMINFO changed")
    apps = [b for b in before.metadata_blocks if b.code == 2]
    if apps and not [b for b in tags.metadata_blocks if b.code == 2]:
        problem(name, "lost APPLICATION block")


def check_mp4(name, path, source):
    tags = MP4(path).tags or {}
    want(name, "mutagen", "©nam", tags.get("\xa9nam"), [EXPECTED["title"]])
    want(name, "mutagen", "©ART", tags.get("\xa9ART"), [EXPECTED["artist"]])
    want(name, "mutagen", "aART", tags.get("aART"), [EXPECTED["albumArtist"]])
    want(name, "mutagen", "©alb", tags.get("\xa9alb"), [EXPECTED["album"]])
    want(name, "mutagen", "©day", (tags.get("\xa9day") or [""])[0][:4], str(EXPECTED["year"]))
    want(name, "mutagen", "trkn", (tags.get("trkn") or [(0, 0)])[0][0], EXPECTED["track"])
    covers = tags.get("covr") or []
    if len(covers) != 1 or bytes(covers[0]) != COVER:
        problem(name, f"mutagen: covr isn't just the new cover ({len(covers)})")
    before = MP4(source).tags or {}
    for key in ("\xa9gen", "\xa9lyr", "cpil"):
        if key in before and tags.get(key) != before[key]:
            problem(name, f"mutagen: lost {key}: {before[key]} -> {tags.get(key)}")
    source_info = MP4(source).info
    info = MP4(path).info
    if source_info.codec != info.codec:
        problem(name, f"codec changed: {source_info.codec} -> {info.codec}")
    if abs(source_info.length - info.length) > 0.06:
        problem(name, f"length changed: {source_info.length} -> {info.length}")


def check_wav(name, path, source):
    wave = WAVE(path)
    if wave.tags is None:
        problem(name, "mutagen: no id3 chunk")
    else:
        check_id3(name, wave.tags, WAVE(source).tags)


with open(os.path.join(EXPORTED, "_results.json")) as f:
    RESULTS = json.load(f)

for name, result in sorted(RESULTS.items()):
    checked += 1
    source = os.path.join(CORPUS, name)
    path = os.path.join(EXPORTED, name)
    if not os.path.exists(path):
        problem(name, f"no export: {result}")
        continue
    data = read(path)
    before = read(source)
    tagged = result.get("tagged")

    # 1. Plays: decodes fully, without an error, to the same samples.
    if result.get("format") != "unknown" or tagged:
        decoded, errors = decoded_md5(path)
        expected_decoded, source_errors = decoded_md5(source)
        if decoded != expected_decoded:
            problem(name, f"decoded audio differs ({decoded!r} vs {expected_decoded!r})")
        if errors and not source_errors:
            problem(name, f"decode errors: {errors[:200]}")
        if afinfo_ok(path) is False and afinfo_ok(source) is True:
            problem(name, "afinfo can't open it")

    # 2. The audio itself: same bytes (by hand) and same packets (ffmpeg).
    if not tagged:
        if data != before:
            problem(name, "shared as-is, but the bytes differ")
        continue
    kind = result["format"]
    if kind == "mp4":
        if packets_md5(path) != packets_md5(source):
            problem(name, "ffmpeg: packets differ")
    else:
        if payload(data) != payload(before):
            problem(name, "audio payload bytes differ")
        if packets_md5(path) != packets_md5(source):
            problem(name, "ffmpeg: packets differ")

    # 3. Tags and artwork, read back by mutagen and ffprobe.
    tags = probe_tags(path)
    if tags is None:
        # Fine only if ffmpeg couldn't read the original either.
        if probe_tags(source) is not None:
            problem(name, "ffprobe can't read it")
            continue
    else:
        if tags.get("title") != EXPECTED["title"]:
            problem(name, f"ffprobe title: {tags.get('title')!r}")
        if tags.get("album") != EXPECTED["album"]:
            problem(name, f"ffprobe album: {tags.get('album')!r}")
    if kind == "mp3" or kind == "adts":
        try:
            source_id3 = ID3(source)
        except ID3NoHeaderError:
            source_id3 = None
        except Exception:
            source_id3 = None
        check_id3(name, ID3(path), source_id3)
    elif kind == "flac":
        check_flac(name, path, source)
    elif kind == "mp4":
        check_mp4(name, path, source)
    elif kind == "wav":
        check_wav(name, path, source)

    # 4. No stale ID3v1.
    if data[-128:-125] == b"TAG":
        title = data[-125:-95].rstrip(b"\0 ").decode("latin-1")
        expected_v1 = unicodedata.normalize("NFC", EXPECTED["title"]).encode("latin-1", "ignore").decode("latin-1")[:30].rstrip()
        if title != expected_v1:
            problem(name, f"stale ID3v1 title {title!r}, expected {expected_v1!r}")

print(f"checked {checked} exports, {len(problems)} problems")
for line in problems:
    print("  " + line)
sys.exit(1 if problems else 0)
