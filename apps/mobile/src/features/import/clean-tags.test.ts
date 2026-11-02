import assert from "node:assert/strict";
import { test } from "node:test";

import {
  audioExtension,
  audioMimeType,
  cleanTags,
  parseTrack,
  parseYear,
  splitTrackPrefix,
} from "./clean-tags.ts";

const NO_TAGS = {
  albumArtist: null,
  compilation: false,
  title: null,
  artist: null,
  album: null,
  year: null,
  track: null,
};

void test("strips 2.5.2's two-digit track prefix", () => {
  assert.deepEqual(splitTrackPrefix("03 Song"), { track: 3, rest: "Song" });
  assert.deepEqual(splitTrackPrefix("Song"), { track: null, rest: "Song" });
  assert.deepEqual(splitTrackPrefix("3 Song"), { track: null, rest: "3 Song" });
});

void test("parses years and track numbers loosely", () => {
  assert.equal(parseYear("2019-05-01T07:00:00Z"), 2019);
  assert.equal(parseYear("0"), null);
  assert.equal(parseYear(null), null);
  assert.equal(parseTrack("3/12"), 3);
  assert.equal(parseTrack("07"), 7);
  assert.equal(parseTrack("0"), null);
});

void test("tags win; the title loses a track prefix", () => {
  assert.deepEqual(
    cleanTags("01 file.mp3", {
      title: "05 Real Title ",
      artist: " Tyler, The Creator ",
      album: "Igor",
      albumArtist: " Tyler, The Creator ",
      compilation: false,
      year: "2019",
      track: null,
    }),
    {
      title: "Real Title",
      artists: "Tyler, The Creator",
      album: "Igor",
      albumArtists: "Tyler, The Creator",
      compilation: false,
      year: 2019,
      track: 5,
    },
  );
  assert.equal(
    cleanTags("01 file.mp3", { ...NO_TAGS, title: "05 Song", track: "9/10" })
      .track,
    9,
  );
});

void test("without tags, the file name is the title and gives the track", () => {
  assert.deepEqual(cleanTags("04 Home.m4a", NO_TAGS), {
    title: "Home",
    artists: null,
    album: null,
    albumArtists: null,
    compilation: false,
    year: null,
    track: 4,
  });
});

void test("knows the audio types by extension", () => {
  assert.equal(audioExtension("Song.FLAC"), "flac");
  assert.equal(audioExtension("notes.txt"), null);
  assert.equal(audioMimeType("a.m4a", "audio/x-m4a"), "audio/mp4");
  assert.equal(audioMimeType("a.ogg", "audio/ogg"), "audio/ogg");
});
