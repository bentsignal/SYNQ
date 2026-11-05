import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { Pick } from "./pick.ts";
import { artworkAlbum, changesArtworkTarget } from "./song-artwork.ts";

const plain = { artworkVersion: null, id: 1, name: "Plain" };
const covered = { artworkVersion: 5, id: 2, name: "Covered" };
const other = { artworkVersion: 6, id: 3, name: "Other" };
const brandNew = { name: "New" };

void describe("artworkAlbum", () => {
  void test("is the first album with a cover, as the library shows it", () => {
    const album = artworkAlbum({
      albums: [plain, covered],
      useAlbumArtwork: true,
    });
    assert.equal(album?.name, "Covered");
    assert.deepEqual(album.cover, { id: 2, kind: "album", version: 5 });
  });

  void test("is the primary album when none has one", () => {
    const album = artworkAlbum({
      albums: [brandNew, plain],
      useAlbumArtwork: true,
    });
    assert.equal(album?.name, "New");
    assert.equal(album.cover, null);
  });

  void test("is none with the switch off, or with no albums", () => {
    assert.equal(
      artworkAlbum({ albums: [covered], useAlbumArtwork: false }),
      undefined,
    );
    assert.equal(
      artworkAlbum({ albums: [], useAlbumArtwork: true }),
      undefined,
    );
  });
});

void describe("changesArtworkTarget", () => {
  function on(...albums: Pick[]) {
    return { albums, useAlbumArtwork: true };
  }

  void test("catches a Remove Photo on a song about to join an album", () => {
    // The song's own photo was removed; Done must not remove the album's cover.
    assert.equal(changesArtworkTarget(on(), on(covered)), true);
  });

  void test("catches the cover moving to another album", () => {
    assert.equal(changesArtworkTarget(on(covered), on(other)), true);
  });

  void test("leaves an album added behind the one in use", () => {
    assert.equal(changesArtworkTarget(on(covered), on(covered, other)), false);
  });

  void test("leaves the song's own while the switch is off", () => {
    assert.equal(
      changesArtworkTarget(
        { albums: [covered], useAlbumArtwork: false },
        { albums: [other], useAlbumArtwork: false },
      ),
      false,
    );
  });
});
