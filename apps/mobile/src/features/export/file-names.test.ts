import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cleanName,
  splitExtension,
  titleFileName,
  trackFileName,
} from "./file-names.ts";

void test("keeps a readable title as it is", () => {
  assert.equal(
    cleanName("Señorita (feat. Kestrel)"),
    "Señorita (feat. Kestrel)",
  );
});

void test("replaces what a file system refuses", () => {
  assert.equal(cleanName("AC/DC: Live?"), "AC_DC_ Live_");
  assert.equal(cleanName('a\\b*c"d<e>f|g\0h'), "a_b_c_d_e_f_g_h");
});

void test("never makes a hidden or empty name", () => {
  assert.equal(cleanName(".hidden"), "hidden");
  assert.equal(cleanName("..."), "Untitled");
  assert.equal(cleanName("   "), "Untitled");
  assert.equal(cleanName(""), "Untitled");
  assert.equal(cleanName("Wait..."), "Wait");
});

void test("shortens a very long title without splitting a character", () => {
  const name = cleanName("🎵".repeat(300));
  assert.equal(Array.from(name).length, 120);
  assert.equal(Array.from(name).at(-1), "🎵");
});

void test("splits extensions", () => {
  assert.deepEqual(splitExtension("a.b.mp3"), {
    extension: ".mp3",
    stem: "a.b",
  });
  assert.deepEqual(splitExtension("noext"), { extension: "", stem: "noext" });
  assert.deepEqual(splitExtension(".m4a"), { extension: "", stem: ".m4a" });
});

void test("names a file by its title, with the audio's extension", () => {
  assert.equal(titleFileName("My Song", "imported 1.m4a"), "My Song.m4a");
  assert.equal(titleFileName("Dr. Who", "x.flac"), "Dr. Who.flac");
});

void test("numbers tracks so names sort in order", () => {
  assert.equal(trackFileName("A", "x.mp3", 0, 9), "01 A.mp3");
  assert.equal(trackFileName("B", "x.mp3", 11, 14), "12 B.mp3");
  assert.equal(trackFileName("C", "x.mp3", 4, 1204), "0005 C.mp3");
  const names = Array.from({ length: 120 }, (_, index) =>
    trackFileName("Z", "x.mp3", index, 120),
  );
  assert.deepEqual([...names].sort(), names);
});
