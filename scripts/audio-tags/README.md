# Audio tag cross-check

`run.sh` builds real audio files, runs SYNQ's own tag writers over them, and
checks every copy with tools that aren't SYNQ's. `pnpm test` covers the same
code in CI with small fixtures; this is the heavier check to run when
`apps/mobile/src/features/media` changes. What it found, and the formats, are in
[docs/audio-tags.md](../../docs/audio-tags.md).

```sh
scripts/audio-tags/run.sh
```

It needs a Mac with `ffmpeg`, `ffprobe`, `afconvert`, `afinfo`, `swiftc`, Python 3,
and Node 24. `mutagen` goes in a virtualenv in `.cache/audio-tags`, along with
everything it generates. Nothing is committed or installed globally.

| Step | What it does |
| --- | --- |
| `make-corpus.py` | 53 files: audio from ffmpeg and afconvert, tags assembled by hand in Python (MP3 in every ID3 shape, M4A, FLAC, WAV, AAC, AIFF, Ogg, Opus, misnamed files) |
| `export-corpus.ts` | SYNQ's `planRetag` on each, with Node standing in for `spliceFile` and the file handle |
| `verify.py` | Per copy: decodes to the same samples, no decode errors, afinfo opens it, the same audio bytes (by hand) and packets (ffmpeg), tags and cover read back in ffprobe and mutagen, every other frame survives, no stale ID3v1 |
| `verify-apple.sh` | The app's own `AudioMetadata.swift` reads each copy, and AVAssetReader decodes every sample |

## Apple's MP3 sample counts

`verify-apple.sh` compares MP3 sample counts within about a frame, since Apple's
count moves with the size of the tag ahead of the audio. That isn't SYNQ: the
same audio with tags written by ffmpeg, at different sizes, gave 133585, 133056,
and 132300 samples. `verify.py` checks those audio bytes are identical.
