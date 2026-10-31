import { router } from "expo-router";

import { createArtist } from "@synq/db";

import { NameSheet } from "~/features/editing/name-sheet";
import { tryWrite } from "~/features/library/actions";
import { openLibraryScreen } from "~/features/library/links";

/** Names a new artist and opens their page. */
export default function NewArtistScreen() {
  return (
    <NameSheet
      title="New Artist"
      placeholder="Artist Name"
      onCancel={() => router.back()}
      onSave={(name) => {
        const artist = tryWrite("Couldn't Create Artist", (db) =>
          createArtist(db, name),
        );
        if (artist === undefined) return false;
        router.back();
        openLibraryScreen({ id: artist.id, screen: "artist" });
        return true;
      }}
    />
  );
}
