import { router } from "expo-router";

import {
  getAlbum,
  listAlbumTracks,
  listPlaylistSongs,
  setAlbumTracks,
  setPlaylistSongs,
  written,
} from "@synq/db";

import { offerToDeleteEmptyAlbums, tryWrite } from "~/features/library/actions";
import { copyCoverToAlbum } from "~/features/library/files";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { coverFromTracks, toRow } from "./album-draft";
import { KEEP_ARTWORK } from "./artwork-change";
import { SongPicker } from "./song-picker";

function close() {
  router.back();
}

/**
 * A playlist's songs, from its page: the picker as its own sheet, saving at
 * Done without going through Edit Playlist.
 */
export function PlaylistSongsScreen() {
  const id = useIdParam();
  const present = useLibraryQuery({
    key: ["playlist-songs", id, "position", "asc"],
    read: (db) => listPlaylistSongs(db, id),
    select: (songs) => songs.map((song) => song.id),
  });
  return (
    <SongPicker
      present={present}
      onCancel={close}
      onDone={({ kept, added }) => {
        const saved = tryWrite("Couldn't Save Playlist", (db) =>
          db.transaction((tx) => {
            setPlaylistSongs(tx, id, [
              ...kept,
              ...added.map((song) => song.id),
            ]);
            return written(true, ["playlists", "playlist_songs"]);
          }),
        );
        if (saved === undefined) return false;
        close();
        return true;
      }}
    />
  );
}

/**
 * An album's songs, from its page. Saving does what Edit Album's Done does for
 * its songs: adds songs here, leaving them on their other albums, and gives a
 * coverless album a cover. Taking the last song off offers to delete the album.
 */
export function AlbumSongsScreen() {
  const id = useIdParam();
  const album = useLibraryQuery({
    key: ["album", id],
    read: (db) => getAlbum(db, id),
    select: (found) => found,
  });
  const present = useLibraryQuery({
    key: ["album-tracks", id],
    read: (db) => listAlbumTracks(db, id),
    select: (tracks) => tracks.map((track) => track.id),
  });
  if (album === null) return null;
  return (
    <SongPicker
      present={present}
      onCancel={close}
      onDone={({ kept, added }) => {
        const wanted = [...kept, ...added.map((song) => song.id)];
        const updated = tryWrite("Couldn't Save Album", (db) =>
          db.transaction((tx) => {
            setAlbumTracks(tx, id, wanted);
            return written(true, ["album_songs", "album_artists", "songs"]);
          }),
        );
        if (updated === undefined) return false;
        const cover = coverFromTracks(
          { artwork: KEEP_ARTWORK, tracks: added.map(toRow) },
          album.artwork !== null,
          new Set(),
        );
        if (cover !== null) copyCoverToAlbum(id, cover);
        close();
        if (wanted.length === 0) offerToDeleteEmptyAlbums([album]);
        return true;
      }}
    />
  );
}
