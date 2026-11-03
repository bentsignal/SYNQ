# Audio tags

SYNQ reads and writes audio tags with its own code. No third-party tag library
is in the app (2.5.2's node-id3 and `@missingcore/audio-metadata` are gone), and
this is what's checked to back that up.

## What editing does

**An edit changes the database and nothing else.** Audio files stay exactly as
they were imported, under `Documents/library/{id}/`, which is what the 2.5.2
rule asks and what lets a restore recognize a song by its bytes. Editing a song
marks it `modified_since_export`. Editing a cover replaces the library's
`cover_full.jpg`, not anything in the audio file.

**Export is where tags reach a file.** It makes a copy in the cache, writes the
library's current title, artists, album, album artists, year, track, and cover
into the copy, shares it, and deletes it. It opens the library's file read-only.
`features/export/export.ts` is the whole of it.

## Formats

| Format | Import reads | Export writes | How |
| --- | --- | --- | --- |
| MP3 | ID3v2.2, 2.3, 2.4, and ID3v1 | ID3v2 in the file's version (2.2 becomes 2.3), and rewrites any ID3v1 | Spliced: a new tag replaces the old, then the rest of the file |
| M4A (AAC, ALAC) | iTunes atoms | iTunes atoms | `moov` is rewritten, and the audio never moves (below) |
| FLAC | Vorbis comments, PICTURE | Vorbis comments, PICTURE | Spliced: new metadata blocks replace the old |
| WAV | `id3 ` chunk, else `LIST INFO` | Both, ahead of the audio | Spliced, with old tag chunks after the audio renamed `JUNK` |
| AAC (ADTS) | ID3v2 | ID3v2 | Spliced. Apple and ffmpeg both read it; there's no other place for tags |
| AIFF, Ogg, Opus | Not imported | Not exported | The picker and Wi-Fi Transfer don't offer them. One misnamed as `.mp3` that iOS can play imports, and is shared as it is |

The code is in `apps/mobile/src/features/media`: `retag.ts` chooses by format,
`id3.ts`, `flac.ts`, `mp4.ts`, and `wav.ts` do the work, all pure TypeScript over
a `ByteSource`. The native side only copies: `spliceFile` streams the audio.
AVFoundation still gets the duration, says whether a file plays, and reads what
the TypeScript has no reader for (ID3v1). `Mp4Tagger.swift` is only a fallback
now, for the M4A files below that the TypeScript leaves alone.

### Rules every writer follows

- **The bytes decide the format, not the name.** A file whose bytes and
  extension disagree is shared as it is. An ID3 tag ahead of a misnamed M4A would
  break it, and even a correct tag can stop Apple reading a misnamed WAV.
- **The audio is never read into memory or changed.** Only the tags move.
- **Everything SYNQ doesn't own stays**, byte for byte: lyrics, comments, replay
  gain, genre, other pictures (a back cover), MusicBrainz ids, gapless info.
- **A number that still matches isn't touched.** A date of `2021-05-04` or a
  track of `3/12` stays that way while the library says 2021 and 3, so changing a
  title doesn't lose the month or the total.
- **The new cover comes first**, ahead of anything kept, since players show the
  first. It replaces the front cover and any "other" picture (ffmpeg's default).
  With no cover in SYNQ, the file's own stay.
- **A value SYNQ has cleared is removed from the file.**
- **Anything that goes wrong shares the file as it was.** The music matters more
  than the tags.

### M4A

AVFoundation's passthrough export remuxes the whole file. Running the corpus
through it lost track totals and full dates, added things that weren't there,
and made some files decode 1024 samples longer in ffmpeg. `mp4.ts` only rewrites
`moov/udta/meta/ilst`, so sample offsets, edit lists, chapters, and gapless info
can't change:

- If the new `moov` fits where the old one was (with a `free` atom after it), it
  goes there, and a `free` atom fills what's left.
- If not, the old one is renamed `free` where it is and the new one goes at the
  end of the file. The file is a little larger than it needs to be, and every
  reader finds `moov` wherever it is. The file can't be cut shorter without a
  native change, and a copy being shared doesn't need to be.

Fragmented files, ones whose atoms don't reach the end of the file, and ones with
an atom running to the end of the file go to `Mp4Tagger.swift`. If that fails,
they're shared as they are. That fallback doesn't write album artists.

## What's verified

`pnpm test` (`features/media/*.test.ts`) needs nothing but Node. It tags small
real files in `features/media/fixtures` (made with ffmpeg) and tags assembled by
hand, checks the audio is byte-identical, and reads the tags back. Every bug
below has a regression test there.

`scripts/audio-tags/run.sh` is the heavier check, for when this code changes. It
builds a corpus of 53 real files, tags assembled independently in Python, runs
the real writers over them, and checks every copy with other people's tools. See
[its README](../scripts/audio-tags/README.md). The last run: 53 exports with no
problems in ffprobe, ffmpeg, or mutagen, and no decode or read problems in
AVFoundation.

## Bugs this found

Export, in the code as it was:

- ID3v2.2 and whole-tag unsynchronised 2.3 and 2.4: every other frame was lost.
- ID3v1 was left in the file, saying the old title.
- A frame with nothing in it ended the tag, losing what came after it.
- iTunes' plain frame sizes in 2.4 tags scrambled or lost frames.
- Any picture but the new cover was lost, in MP3 and FLAC.
- `.mp3` files holding M4A or WAV got an ID3 tag on the front and stopped opening.
- Bytes starting `ID3` with an impossible header were treated as a tag.
- A second Vorbis comment block's fields were lost; fields that weren't UTF-8 were
  rewritten as U+FFFD; a cover over 16 MB would have overflowed its FLAC block.
- M4A: track totals and full dates were lost, a file's cover was lost when SYNQ had
  none, and an album artist was left stale. AAC and WAV carried no tags at all.

Import, where AVFoundation falls short:

- ID3v2.2 and tags with extended headers read as no tags at all.
- Only the first of several values in a frame was read.
- With several pictures, the first was taken as the cover, even a back cover.
- WAV's `LIST INFO`, album artists, and the compilation flag weren't read.
- A FLAC's leading ID3 tag beat its Vorbis comments, and a misnamed FLAC's weren't read.

## Limits

- APEv2 tags at the end of an MP3 are left as they are, and go stale. A second
  ID3v2 tag right after the first likewise, though players read the first.
- Disc numbers aren't in the library. The file's own stay on export, and album
  matching can't use them (docs/rewrite.md → Same-named albums).
- Apple's MP3 sample count moves by about a frame with the size of the tag ahead
  of the audio, for tags from any tool (see the README). The audio bytes are the
  same.
