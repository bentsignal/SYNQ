import { router } from "expo-router";

import { createAlbum } from "@synq/db";

import { NameSheet } from "~/features/editing/name-sheet";
import { tryWrite } from "~/features/library/actions";
import { openLibraryScreen } from "~/features/library/links";

/** Names a new, empty album and opens it. */
export default function NewAlbumScreen() {
  return (
    <NameSheet
      title="New Album"
      placeholder="Album Name"
      onCancel={() => router.back()}
      onSave={(name) => {
        const album = tryWrite("Couldn't Create Album", (db) =>
          createAlbum(db, { name }),
        );
        if (album === undefined) return false;
        router.back();
        openLibraryScreen({ id: album.id, screen: "album" });
        return true;
      }}
    />
  );
}
