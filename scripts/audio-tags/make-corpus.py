#!/usr/bin/env python3
"""Builds the audio-tag test corpus: real audio from ffmpeg and afconvert, with
tags assembled by hand here (not by SYNQ's code), so the verifier isn't
checking our writers against themselves. See scripts/audio-tags/README.md."""
import os
import struct
import subprocess
import sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
WORK = os.path.join(OUT, "_work")
os.makedirs(WORK, exist_ok=True)


def run(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


TONE = ["-f", "lavfi", "-i", "sine=frequency=440:duration=3:sample_rate=44100", "-ac", "2"]


def ff(name, *args):
    path = os.path.join(WORK, name)
    run("ffmpeg", "-y", "-v", "error", *TONE, *args, path)
    return path


def read(path):
    with open(path, "rb") as f:
        return f.read()


def out(name, *parts):
    with open(os.path.join(OUT, name), "wb") as f:
        for part in parts:
            f.write(part)


# ---- artwork -------------------------------------------------------------
def jpeg(name, color, size="300x300", extra=()):
    path = os.path.join(WORK, name)
    run(
        "ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color={color}:size={size}",
        *extra, "-frames:v", "1", "-update", "1", path,
    )
    return read(path)


FRONT = jpeg("front.jpg", "red")
BACK = jpeg("back.jpg", "blue")
HUGE_PATH = os.path.join(WORK, "huge.jpg")
run(
    "ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=4000x4000,geq=random(1)*255:128:128",
    "-frames:v", "1", "-q:v", "1", "-update", "1", HUGE_PATH,
)
HUGE = read(HUGE_PATH)
out("_cover.jpg", jpeg("cover.jpg", "green"))


# ---- ID3 -----------------------------------------------------------------
def syncsafe(n):
    return bytes([(n >> 21) & 0x7F, (n >> 14) & 0x7F, (n >> 7) & 0x7F, n & 0x7F])


def enc(text, encoding):
    if encoding == 0:
        return b"\0" + text.encode("latin-1")
    if encoding == 1:
        return b"\x01" + text.encode("utf-16")
    if encoding == 2:
        return b"\x02" + text.encode("utf-16-be")
    return b"\x03" + text.encode("utf-8")


def frame23(fid, body, flags=b"\0\0"):
    return fid.encode() + struct.pack(">I", len(body)) + flags + body


def frame24(fid, body, flags=b"\0\0"):
    return fid.encode() + syncsafe(len(body)) + flags + body


def frame22(fid, body):
    return fid.encode() + struct.pack(">I", len(body))[1:] + body


def apic(data, picture_type=3, desc="", mime=b"image/jpeg", encoding=0):
    return (
        bytes([encoding]) + mime + b"\0" + bytes([picture_type])
        + desc.encode("latin-1") + b"\0" + data
    )


def tag(version, frames, padding=0, flags=0, extended=b""):
    body = extended + b"".join(frames) + b"\0" * padding
    return b"ID3" + bytes([version, 0, flags]) + syncsafe(len(body)) + body


def unsync(data):
    result = bytearray()
    for index, byte in enumerate(data):
        result.append(byte)
        if byte == 0xFF:
            following = data[index + 1] if index + 1 < len(data) else 0
            if following >= 0xE0 or following == 0:
                result.append(0)
    return bytes(result)


def v1(title, artist, album, year, track, genre=17, comment="v1 comment"):
    return (
        b"TAG" + title.encode("latin-1").ljust(30, b"\0")[:30]
        + artist.encode("latin-1").ljust(30, b"\0")[:30]
        + album.encode("latin-1").ljust(30, b"\0")[:30]
        + year.encode().ljust(4, b"\0")[:4]
        + comment.encode("latin-1").ljust(28, b"\0")[:28]
        + b"\0" + bytes([track, genre])
    )


def common23(encoding=1, cover=FRONT):
    return [
        frame23("TIT2", enc("Old Title", encoding)),
        frame23("TPE1", enc("Old Artist", encoding)),
        frame23("TPE2", enc("Old Album Artist", encoding)),
        frame23("TALB", enc("Old Album", encoding)),
        frame23("TRCK", enc("3/12", encoding)),
        frame23("TYER", enc("2019", encoding)),
        frame23("TCON", enc("Jazz", encoding)),
        frame23("USLT", b"\x00eng\x00These are the lyrics"),
        frame23("COMM", b"\x00eng\x00A comment"),
        frame23("TXXX", b"\x00replaygain_track_gain\x00-3.21 dB"),
        frame23("APIC", apic(cover)),
    ]


mp3 = ff("bare.mp3", "-c:a", "libmp3lame", "-b:a", "128k", "-id3v2_version", "0", "-write_id3v1", "0")
BARE = read(mp3)

out("mp3-no-tag.mp3", BARE)
out(
    "mp3-v22.mp3",
    tag(2, [
        frame22("TT2", enc("Old Title", 0)), frame22("TP1", enc("Old Artist", 1)),
        frame22("TP2", enc("Old Album Artist", 0)), frame22("TAL", enc("Old Album", 0)),
        frame22("TRK", enc("3/12", 0)), frame22("TYE", enc("2019", 0)),
        frame22("TCO", enc("Jazz", 0)), frame22("TCP", enc("1", 0)),
        frame22("ULT", b"\x00eng\x00These are the lyrics"),
        frame22("COM", b"\x00eng\x00A comment"),
        frame22("TXX", b"\x00replaygain_track_gain\x00-3.21 dB"),
        frame22("PIC", b"\x00JPG\x03\x00" + FRONT),
    ], padding=64),
    BARE,
)
out("mp3-v23.mp3", tag(3, common23(), padding=256), BARE)
out(
    "mp3-v24.mp3",
    tag(4, [
        frame24("TIT2", enc("Old Title", 3)), frame24("TPE1", enc("Old Artist", 3)),
        frame24("TPE2", enc("Old Album Artist", 3)), frame24("TALB", enc("Old Album", 3)),
        frame24("TRCK", enc("3/12", 3)), frame24("TDRC", enc("2021-05-04", 3)),
        frame24("TCON", enc("Jazz", 3)), frame24("TCMP", enc("1", 3)),
        frame24("USLT", b"\x00eng\x00These are the lyrics"),
        frame24("COMM", b"\x00eng\x00A comment"),
        frame24("TXXX", b"\x03replaygain_track_gain\x00-3.21 dB"),
        frame24("APIC", apic(FRONT)),
    ], padding=256),
    BARE,
)
out(
    "mp3-v24-footer.mp3",
    (lambda body: b"ID3\x04\x00\x10" + syncsafe(len(body)) + body + b"3DI\x04\x00\x10" + syncsafe(len(body)))(
        frame24("TIT2", enc("Old Title", 3)) + frame24("USLT", b"\x00eng\x00These are the lyrics")
    ),
    BARE,
)
out(
    "mp3-v24-itunes-sizes.mp3",
    # iTunes' bug: a 2.4 tag whose frame sizes aren't syncsafe.
    tag(4, [
        b"TIT2" + struct.pack(">I", len(enc("Old Title", 3))) + b"\0\0" + enc("Old Title", 3),
        b"USLT" + struct.pack(">I", 300) + b"\0\0" + b"\x00eng\x00" + b"L" * 295,
        b"COMM" + struct.pack(">I", 200) + b"\0\0" + b"\x00eng\x00" + b"C" * 195,
    ], padding=32),
    BARE,
)
out("mp3-v1-only.mp3", BARE, v1("V1 Title", "V1 Artist", "V1 Album", "2001", 7))
out("mp3-v1-v2.mp3", tag(3, common23(), padding=64), BARE, v1("V1 Title", "V1 Artist", "V1 Album", "2001", 7))
ext23 = struct.pack(">I", 6) + b"\0\0" + struct.pack(">I", 0)
out("mp3-v23-extended.mp3", tag(3, common23(), padding=32, flags=0x40, extended=ext23), BARE)
ext24 = syncsafe(6) + b"\x01\x00"
out(
    "mp3-v24-extended.mp3",
    tag(4, [frame24("TIT2", enc("Old Title", 3)), frame24("USLT", b"\x00eng\x00These are the lyrics")],
        padding=32, flags=0x40, extended=ext24),
    BARE,
)
plain23 = b"".join(common23())
unsynced = unsync(plain23)
out("mp3-v23-unsync.mp3", b"ID3\x03\x00\x80" + syncsafe(len(unsynced)) + unsynced, BARE)
frames24 = [
    (lambda body: frame24(fid, body, b"\0\x02"))(unsync(raw))
    for fid, raw in [("TIT2", enc("Old Title", 3)), ("APIC", apic(FRONT)), ("USLT", b"\x00eng\x00These are the lyrics")]
]
out("mp3-v24-unsync.mp3", tag(4, frames24, flags=0x80), BARE)
out("mp3-padding-100k.mp3", tag(3, common23(), padding=100_000), BARE)
out("mp3-multi-pictures.mp3", tag(3, [
    frame23("TIT2", enc("Old Title", 1)),
    frame23("APIC", apic(BACK, 4, "back")),
    frame23("APIC", apic(FRONT, 3, "front")),
    frame23("APIC", apic(BACK, 0, "other")),
    frame23("USLT", b"\x00eng\x00These are the lyrics"),
]), BARE)
out("mp3-text-latin1.mp3", tag(3, [frame23("TIT2", enc("Señor Olé", 0)), frame23("TPE1", enc("Björk", 0))]), BARE)
out("mp3-text-utf16be.mp3", tag(4, [frame24("TIT2", enc("東京 🎵", 2)), frame24("TPE1", enc("Beyoncé", 2))]), BARE)
out("mp3-text-utf8.mp3", tag(4, [frame24("TIT2", enc("مرحبا 東京 🎵", 3)), frame24("TPE1", enc("A\0B", 3))]), BARE)
out("mp3-huge-artwork.mp3", tag(3, common23(cover=HUGE)), BARE)
short = BARE[: 417 * 4]
out("mp3-tag-bigger-than-audio.mp3", tag(3, common23(), padding=4096), short)
out("mp3-false-sync-garbage.mp3", tag(3, common23()), b"\xff\xfb\x00\x00junk\xff\xe0" + b"\0" * 64, BARE)
out("mp3-false-sync-in-tag.mp3", tag(3, [
    frame23("TIT2", enc("Old Title", 1)),
    frame23("PRIV", b"owner\0" + b"\xff\xfb\x90\x00" * 64),
]), BARE)
out("mp3-zero-size-frame.mp3", tag(3, [
    frame23("TIT2", enc("Old Title", 1)),
    frame23("TCOM", b""),
    frame23("USLT", b"\x00eng\x00These are the lyrics"),
], padding=16), BARE)
out("mp3-not-really-id3.mp3", b"ID3\xff\xff\xff\xff\xff\xff\xff", BARE)
out("mp3-long-values.mp3", tag(3, [frame23("TIT2", enc("Long " * 2000, 1))]), BARE)

# ---- FLAC ----------------------------------------------------------------
flac = read(ff("bare.flac", "-c:a", "flac", "-compression_level", "5"))
offset = 4
stream_info = None
while True:
    header = flac[offset]
    length = int.from_bytes(flac[offset + 1 : offset + 4], "big")
    if header & 0x7F == 0:
        stream_info = flac[offset + 4 : offset + 4 + length]
    offset += 4 + length
    if header & 0x80:
        break
FLAC_AUDIO = flac[offset:]


def block(kind, body, last=False):
    return bytes([kind | (0x80 if last else 0)]) + len(body).to_bytes(3, "big") + body


def vorbis(fields, vendor=b"reference libFLAC 1.4.3"):
    encoded = [f.encode("utf-8") if isinstance(f, str) else f for f in fields]
    return (
        struct.pack("<I", len(vendor)) + vendor + struct.pack("<I", len(encoded))
        + b"".join(struct.pack("<I", len(f)) + f for f in encoded)
    )


def picture(data, kind=3, desc=b""):
    mime = b"image/jpeg"
    return (
        struct.pack(">I", kind) + struct.pack(">I", len(mime)) + mime + struct.pack(">I", len(desc))
        + desc + struct.pack(">IIII", 300, 300, 24, 0) + struct.pack(">I", len(data)) + data
    )


def flac_file(*blocks):
    last = len(blocks) - 1
    return (
        b"fLaC" + block(0, stream_info, not blocks)
        + b"".join(block(kind, body, index == last) for index, (kind, body) in enumerate(blocks))
    )


COMMENTS = [
    "TITLE=Old Title", "artist=Old Artist", "ARTIST=Second Artist", "ALBUMARTIST=Old Album Artist",
    "ALBUM=Old Album", "DATE=2021-05-04", "TRACKNUMBER=3/12", "GENRE=Jazz", "COMPILATION=1",
    "LYRICS=These are the lyrics", "REPLAYGAIN_TRACK_GAIN=-3.21 dB",
]
out("flac-no-comment.flac", flac_file(), FLAC_AUDIO)
out("flac-comments.flac", flac_file((4, vorbis(COMMENTS)), (6, picture(FRONT))), FLAC_AUDIO)
out("flac-two-pictures.flac", flac_file((6, picture(BACK, 4)), (4, vorbis(COMMENTS)), (6, picture(FRONT, 3))), FLAC_AUDIO)
out("flac-padding-1m.flac", flac_file((4, vorbis(COMMENTS)), (1, b"\0" * 1_000_000)), FLAC_AUDIO)
out("flac-leading-id3.flac", tag(3, [frame23("TIT2", enc("ID3 Title", 1))]), flac_file((4, vorbis(COMMENTS))), FLAC_AUDIO)
out("flac-latin1-kept.flac", flac_file((4, vorbis(["TITLE=Old", b"COMMENT=caf\xe9"]))), FLAC_AUDIO)
out("flac-application-block.flac", flac_file((2, b"TEST" + b"\x01\x02"), (4, vorbis(COMMENTS)), (1, b"\0" * 16)), FLAC_AUDIO)


# ---- M4A -----------------------------------------------------------------
wav = ff("bare.wav", "-c:a", "pcm_s16le", "-bitexact", "-map_metadata", "-1")
meta = [
    "-metadata", "title=Old Title", "-metadata", "artist=Old Artist",
    "-metadata", "album_artist=Old Album Artist", "-metadata", "album=Old Album",
    "-metadata", "track=3/12", "-metadata", "date=2021-05-04", "-metadata", "genre=Jazz",
    "-metadata", "lyrics=These are the lyrics", "-metadata", "compilation=1",
]
out_path = lambda name: os.path.join(OUT, name)
run("afconvert", "-f", "m4af", "-d", "aac", wav, out_path("m4a-aac-no-tags-apple.m4a"))
run("afconvert", "-f", "m4af", "-d", "alac", wav, out_path("m4a-alac-no-tags-apple.m4a"))
front_jpg = os.path.join(WORK, "front.jpg")
for codec, name in (("aac", "aac"), ("alac", "alac")):
    run("ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", codec, "-map_metadata", "-1", out_path(f"m4a-{name}-no-tags-ffmpeg.m4a"))
    run(
        "ffmpeg", "-y", "-v", "error", "-i", wav, "-i", front_jpg, "-map", "0:a", "-map", "1:v",
        "-c:a", codec, "-c:v", "copy", "-disposition:v", "attached_pic", *meta,
        out_path(f"m4a-{name}-tags-cover.m4a"),
    )
run(
    "ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", "aac", *meta, out_path("m4a-aac-tags-no-cover.m4a"),
)

# ---- Others --------------------------------------------------------------
pcm = read(wav)
data_at = pcm.index(b"data")
data_len = struct.unpack("<I", pcm[data_at + 4 : data_at + 8])[0]
FMT_CHUNKS = pcm[12:data_at]
DATA = pcm[data_at : data_at + 8 + data_len]


def chunk(fourcc, body):
    return fourcc + struct.pack("<I", len(body)) + body + (b"\0" if len(body) % 2 else b"")


def riff(*chunks):
    body = b"WAVE" + b"".join(chunks)
    return b"RIFF" + struct.pack("<I", len(body)) + body


info = b"INFO" + chunk(b"INAM", b"Old Title\0") + chunk(b"IART", b"Old Artist\0") + chunk(b"ISFT", b"Some Tool\0") + chunk(b"ICMT", b"Keep me\0")
id3_chunk = tag(3, common23(), padding=8)
out("wav-plain.wav", riff(FMT_CHUNKS, DATA))
out("wav-list-info.wav", riff(FMT_CHUNKS, chunk(b"LIST", info), DATA))
out("wav-id3-after.wav", riff(FMT_CHUNKS, DATA, chunk(b"id3 ", id3_chunk)))
out("wav-both-after.wav", riff(FMT_CHUNKS, DATA, chunk(b"LIST", info), chunk(b"ID3 ", id3_chunk), chunk(b"cue ", struct.pack("<I", 0))))
run("ffmpeg", "-y", "-v", "error", "-i", wav, "-metadata", "title=Old Title", "-write_id3v2", "1", out_path("aiff-tagged.aiff"))
run("ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", "aac", "-f", "adts", out_path("aac-adts.aac"))
out("aac-adts-id3.aac", tag(3, common23(), padding=64), read(out_path("aac-adts.aac")))
run("ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", "libopus", "-metadata", "title=Old Title", out_path("opus-tagged.opus"))
run("ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", "vorbis", "-strict", "-2", "-metadata", "title=Old Title", out_path("ogg-vorbis.ogg"))

# Misnamed: the extension lies about the contents.
out("misnamed-m4a-as.mp3", read(out_path("m4a-aac-tags-cover.m4a")))
out("misnamed-flac-as.mp3", read(out_path("flac-comments.flac")))
out("misnamed-mp3-as.m4a", tag(3, common23()), BARE)
out("misnamed-wav-as.mp3", read(out_path("wav-plain.wav")))
out("misnamed-ogg-as.mp3", read(out_path("ogg-vorbis.ogg")))
out("nfd-Beyoncé #2 & co.mp3", tag(3, common23()), BARE)
print(f"corpus: {len([n for n in os.listdir(OUT) if not n.startswith('_')])} files in {OUT}")
