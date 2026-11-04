import { router } from "expo-router";

import type { AlbumListItem } from "@synq/db";
import { createAlbum, setAlbumTracks, updateAlbum, written } from "@synq/db";

import type { PickFor } from "./pick-created";
import { offerToDeleteEmptyAlbums, tryWrite } from "~/features/library/actions";
import { copyCoverToAlbum } from "~/features/library/files";
import { openLibraryScreen } from "~/features/library/links";
import { coverFromTracks, draft, parseYear, trackIds } from "./album-draft";
import { saveArtworkChange } from "./artwork-change";
import { artistIds } from "./pick";
import { pickNewAlbum } from "./pick-created";

/** Saves the sheet: fields and tracks together, then covers. */
export function saveEdits(album: AlbumListItem, saved: ReadonlySet<string>) {
  const edits = draft.get();
  const cover = coverFromTracks(edits, album.artwork !== null, saved);
  const updated = tryWrite("Couldn't Save Album", (db) =>
    db.transaction((tx) => {
      const result = updateAlbum(tx, album.id, {
        artistIds: artistIds(tx, edits.artists),
        name: edits.name,
        year: parseYear(edits.year),
      });
      const { emptied } = setAlbumTracks(tx, album.id, trackIds(edits)).value;
      return written({ emptied, id: result.value.id }, [
        "albums",
        "album_songs",
        "songs",
      ]);
    }),
  );
  if (updated === undefined) return;
  if (cover !== null) copyCoverToAlbum(album.id, cover);
  router.back();
  saveArtworkChange(edits.artwork, "album", album.id);
  offerToDeleteEmptyAlbums(updated.emptied);
}

/**
 * Creates the album with its songs, then covers, and opens it, or chooses it
 * on the song whose list opened this sheet. False keeps the sheet up.
 */
export function saveNew(pickFor: PickFor | undefined) {
  const edits = draft.get();
  const cover = coverFromTracks(edits, false, new Set());
  const created = tryWrite("Couldn't Create Album", (db) =>
    db.transaction((tx) => {
      const album = createAlbum(tx, {
        artistIds: artistIds(tx, edits.artists),
        name: edits.name,
        year: parseYear(edits.year),
      }).value;
      const { emptied } = setAlbumTracks(tx, album.id, trackIds(edits)).value;
      return written({ emptied, id: album.id, name: album.name }, [
        "albums",
        "album_songs",
        "album_artists",
      ]);
    }),
  );
  if (created === undefined) return false;
  if (cover !== null) copyCoverToAlbum(created.id, cover);
  router.back();
  if (pickFor === undefined) {
    openLibraryScreen({ id: created.id, screen: "album" });
  } else {
    pickNewAlbum(created);
  }
  saveArtworkChange(edits.artwork, "album", created.id);
  offerToDeleteEmptyAlbums(created.emptied);
  return true;
}
