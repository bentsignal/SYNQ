import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { FolderEntry } from "./folder-songs.ts";
import { audioExtension, isVideo } from "./clean-tags.ts";
import { findFolderSongs } from "./folder-songs.ts";

/** A folder in a test: file names, and folders by name. */
interface Tree {
  [name: string]: Tree | null;
}

function list(tree: Tree, path: string) {
  return Object.entries(tree).map(
    ([name, inner]): FolderEntry<{ tree: Tree; path: string }, string> => ({
      entry:
        inner === null
          ? { file: `${path}/${name}` }
          : { folder: { path: `${path}/${name}`, tree: inner } },
      name,
    }),
  );
}

/** `deep.mp3`, `depth` folders down. */
function nested(depth: number) {
  return Array.from({ length: depth }).reduce<Tree>((inner) => ({ inner }), {
    "deep.mp3": null,
  });
}

function find(tree: Tree, imports?: (name: string) => boolean) {
  return findFolderSongs(
    { path: "", tree },
    (folder) => list(folder.tree, folder.path),
    imports,
  );
}

void describe("findFolderSongs", () => {
  void test("finds audio in the folder and the folders inside it", () => {
    const found = find({
      "Album A": { "01 One.mp3": null, "cover.jpg": null },
      "Album B": { Disc: { "01 Deep.flac": null } },
      "notes.txt": null,
      "single.m4a": null,
    });
    assert.deepEqual(
      found.songs.map((song) => song.file),
      ["/single.m4a", "/Album A/01 One.mp3", "/Album B/Disc/01 Deep.flac"],
    );
    assert.equal(found.notDownloaded, 0);
  });

  void test("takes videos only when asked to", () => {
    const tree = {
      ".Clip.mov.icloud": null,
      "Leak.MOV": null,
      "song.mp3": null,
    };
    assert.deepEqual(
      find(tree).songs.map((song) => song.name),
      ["song.mp3"],
    );
    assert.equal(find(tree).notDownloaded, 0);
    const withVideos = find(
      tree,
      (name) => audioExtension(name) !== null || isVideo(name),
    );
    assert.deepEqual(
      withVideos.songs.map((song) => song.name),
      ["Leak.MOV", "song.mp3"],
    );
    assert.equal(withVideos.notDownloaded, 1);
  });

  void test("lists songs in the order Files shows them", () => {
    const found = find({
      "10 Ten.mp3": null,
      "2 Two.mp3": null,
      "a.MP3": null,
      "B.wav": null,
    });
    assert.deepEqual(
      found.songs.map((song) => song.name),
      ["2 Two.mp3", "10 Ten.mp3", "a.MP3", "B.wav"],
    );
  });

  void test("counts iCloud files that aren't downloaded, and skips hidden ones", () => {
    const found = find({
      ".DS_Store": null,
      ".Hidden": { "secret.mp3": null },
      ".Later.mp3.icloud": null,
      ".cover.jpg.icloud": null,
      "._Here.mp3": null,
      "Here.mp3": null,
    });
    assert.deepEqual(
      found.songs.map((song) => song.name),
      ["Here.mp3"],
    );
    assert.equal(found.notDownloaded, 1);
  });

  void test("stops at a depth no music library needs", () => {
    assert.deepEqual(find(nested(20)).songs, []);
    assert.equal(find(nested(3)).songs.length, 1);
  });
});
