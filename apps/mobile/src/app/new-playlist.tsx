import { router, useLocalSearchParams } from "expo-router";

import { addSongsToPlaylist, createPlaylist } from "@synq/db";

import { NameSheet } from "~/features/editing/name-sheet";
import { tryWrite } from "~/features/library/actions";
import { openLibraryScreen } from "~/features/library/links";
import { songIdsParam } from "~/features/library/params";

/**
 * Names a new playlist and opens it; from Add to Playlist (`songs`), adds
 * those songs to it and closes both sheets instead.
 */
export default function NewPlaylistScreen() {
  const { songs } = useLocalSearchParams<{ songs?: string }>();
  const songIds = songIdsParam(songs);
  return (
    <NameSheet
      title="New Playlist"
      placeholder="Playlist Name"
      onCancel={() => router.back()}
      onSave={(name) => {
        const playlist = tryWrite("Couldn't Create Playlist", (db) =>
          createPlaylist(db, name),
        );
        if (playlist === undefined) return false;
        if (songIds.length > 0) {
          tryWrite("Couldn't Add to Playlist", (db) =>
            addSongsToPlaylist(db, playlist.id, songIds),
          );
          router.dismiss(2);
          return true;
        }
        router.back();
        openLibraryScreen({ id: playlist.id, screen: "playlist" });
        return true;
      }}
    />
  );
}
