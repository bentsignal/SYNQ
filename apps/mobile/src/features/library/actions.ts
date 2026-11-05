import { Alert } from "react-native";
import { router } from "expo-router";

import type { HomeRef, LibraryDb, WriteResult } from "@synq/db";
import {
  addSongsToPlaylist,
  deleteAlbum,
  deleteAlbumAndSongs,
  deleteArtist,
  deletePlaylist,
  deleteSongs,
  LibraryError,
  removeSongsFromAlbum,
  removeSongsFromPlaylist,
  setPinned,
  setSongLiked,
  written,
} from "@synq/db";

import type { MenuAction } from "~/components/menu";
import { forgetSongs } from "~/features/player/actions";
import { selectionTick } from "~/lib/haptics";
import { emptyAlbumPrompt } from "./empty-album-prompt";
import { deleteLibraryFolders } from "./files";
import { writeLibrary } from "./queries";

/** The app's one failure alert: "Couldn't Delete Song", "Try again." */
export function failed(title: string, message = "Try again.") {
  Alert.alert(title, message);
}

/**
 * Runs a library write, reporting a failure with an alert instead of
 * throwing. A name clash gets its own message. Returns the write's value,
 * or undefined when it failed.
 */
export function tryWrite<Value>(
  title: string,
  write: (db: LibraryDb) => WriteResult<Value>,
) {
  try {
    return writeLibrary(write);
  } catch (error) {
    failed(
      title,
      error instanceof LibraryError && error.code === "duplicate-name"
        ? "That name is already taken."
        : undefined,
    );
    return undefined;
  }
}

export function setLiked(songId: number, liked: boolean) {
  selectionTick();
  tryWrite(
    liked ? "Couldn't Add to Liked" : "Couldn't Remove from Liked",
    (db) => setSongLiked(db, songId, liked),
  );
}

function setItemPinned(item: HomeRef, pinned: boolean) {
  selectionTick();
  tryWrite(pinned ? "Couldn't Pin" : "Couldn't Unpin", (db) =>
    setPinned(db, item, pinned),
  );
}

/** Pin or Unpin for a playlist, album, artist, or song's menu. */
export function pinAction(item: HomeRef, pinnedAt: number | null) {
  const pinned = pinnedAt !== null;
  return {
    icon: pinned ? "pin.slash" : "pin",
    key: "pin",
    label: pinned ? "Unpin" : "Pin",
    onPress: () => setItemPinned(item, !pinned),
  } satisfies MenuAction;
}

export function addToPlaylist(playlistId: number, songIds: readonly number[]) {
  selectionTick();
  tryWrite("Couldn't Add to Playlist", (db) =>
    addSongsToPlaylist(db, playlistId, songIds),
  );
}

export function removeFromPlaylist(
  playlistId: number,
  songIds: readonly number[],
) {
  tryWrite("Couldn't Remove from Playlist", (db) =>
    removeSongsFromPlaylist(db, playlistId, songIds),
  );
}

export function removeFromAlbum(albumId: number, songIds: readonly number[]) {
  const removed = tryWrite("Couldn't Remove from Album", (db) =>
    removeSongsFromAlbum(db, albumId, songIds),
  );
  if (removed !== undefined) offerToDeleteEmptyAlbums(removed.emptied);
}

/**
 * Asks before anything is deleted: Cancel first, the destructive action
 * second (docs/ui.md), then runs `remove`.
 */
function confirm({
  title,
  message,
  action,
  remove,
}: {
  title: string;
  message: string;
  action: string;
  remove: () => void;
}) {
  Alert.alert(title, message, [
    { style: "cancel", text: "Cancel" },
    { onPress: remove, style: "destructive", text: action },
  ]);
}

/**
 * Deletes songs from the library after a confirmation: their rows, then
 * their folders (audio and artwork), and drops them from the queue.
 */
export function confirmDeleteSongs(
  songs: readonly { id: number; title: string }[],
  onDeleted?: () => void,
) {
  const [first] = songs;
  if (first === undefined) return;
  confirm({
    action: songs.length === 1 ? "Delete Song" : "Delete Songs",
    message:
      songs.length === 1
        ? `“${first.title}” will be removed from your library and this iPhone.`
        : `${songs.length} songs will be removed from your library and this iPhone.`,
    remove: () => {
      const deleted = tryWrite("Couldn't Delete Song", (db) =>
        deleteSongs(
          db,
          songs.map((song) => song.id),
        ),
      );
      if (deleted === undefined) return;
      forgetSongs(deleted.ids);
      deleteLibraryFolders(deleted.deletePaths);
      onDeleted?.();
      offerToDeleteEmptyAlbums(deleted.emptied);
    },
    title: songs.length === 1 ? "Delete Song?" : "Delete Songs?",
  });
}

export function confirmDeletePlaylist(
  playlist: { id: number; name: string },
  onDeleted?: () => void,
) {
  confirm({
    action: "Delete Playlist",
    message: `“${playlist.name}” will be deleted. Its songs stay in your library.`,
    remove: () => {
      const deleted = tryWrite("Couldn't Delete Playlist", (db) =>
        deletePlaylist(db, playlist.id),
      );
      if (deleted === undefined) return;
      onDeleted?.();
      deleteLibraryFolders(deleted.deletePaths);
    },
    title: "Delete Playlist?",
  });
}

/**
 * Asks before deleting an album. One with songs opens a sheet, since an alert
 * can't hold the choice to delete them too; an empty one has nothing to choose.
 */
export function confirmDeleteAlbum(album: {
  id: number;
  name: string;
  songCount: number;
}) {
  if (album.songCount > 0) {
    router.push({
      params: {
        id: String(album.id),
        name: album.name,
        songs: String(album.songCount),
      },
      pathname: "/delete-album/[id]",
    });
    return;
  }
  confirm({
    action: "Delete Album",
    message: `“${album.name}” will be deleted.`,
    remove: () => {
      removeAlbum(album.id, { withSongs: false });
    },
    title: "Delete Album?",
  });
}

/**
 * Deletes an album, and its songs when asked: their rows, then their folders,
 * and drops them from the queue. Returns whether it worked.
 */
export function removeAlbum(
  albumId: number,
  { withSongs }: { withSongs: boolean },
) {
  if (withSongs) {
    const deleted = tryWrite("Couldn't Delete Album", (db) =>
      deleteAlbumAndSongs(db, albumId),
    );
    if (deleted === undefined) return false;
    forgetSongs(deleted.ids);
    deleteLibraryFolders(deleted.deletePaths);
    return true;
  }
  const deleted = tryWrite("Couldn't Delete Album", (db) =>
    deleteAlbum(db, albumId),
  );
  if (deleted === undefined) return false;
  deleteLibraryFolders(deleted.deletePaths);
  return true;
}

/**
 * Offers to delete albums an edit just left with no songs (docs/ui.md →
 * Editing). Keep is the default answer: empty albums stay, as they did in
 * 2.5.2, so this runs only at the moment an edit empties one and never for
 * older empty albums. Their songs stay in the library either way.
 */
export function offerToDeleteEmptyAlbums(
  albums: readonly { id: number; name: string }[],
  onDeleted?: () => void,
) {
  if (albums.length === 0) return;
  const { title, message } = emptyAlbumPrompt(
    albums.map((album) => album.name),
  );
  Alert.alert(title, message, [
    { style: "cancel", text: "Keep" },
    {
      onPress: () => {
        const deleted = tryWrite(
          albums.length === 1
            ? "Couldn't Delete Album"
            : "Couldn't Delete Albums",
          (db) =>
            db.transaction((tx) =>
              written(
                albums.flatMap(
                  (album) => deleteAlbum(tx, album.id).value.deletePaths,
                ),
                ["albums", "album_songs", "album_artists"],
              ),
            ),
        );
        if (deleted === undefined) return;
        onDeleted?.();
        deleteLibraryFolders(deleted);
      },
      style: "destructive",
      text: "Delete",
    },
  ]);
}

export function confirmDeleteArtist(
  artist: { id: number; name: string },
  onDeleted?: () => void,
) {
  confirm({
    action: "Delete Artist",
    message: `“${artist.name}” will be deleted. Their songs and albums stay in your library.`,
    remove: () => {
      const deleted = tryWrite("Couldn't Delete Artist", (db) =>
        deleteArtist(db, artist.id),
      );
      if (deleted === undefined) return;
      onDeleted?.();
      deleteLibraryFolders(deleted.deletePaths);
    },
    title: "Delete Artist?",
  });
}
