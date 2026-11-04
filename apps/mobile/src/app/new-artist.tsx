import { router, useLocalSearchParams } from "expo-router";

import { createArtist } from "@synq/db";

import type { PickFor } from "~/features/editing/pick-created";
import { NameSheet } from "~/features/editing/name-sheet";
import { pickNewArtist } from "~/features/editing/pick-created";
import { tryWrite } from "~/features/library/actions";
import { openLibraryScreen } from "~/features/library/links";

/**
 * Names a new artist and opens their page, or chooses them on the sheet whose
 * list opened this one.
 */
export default function NewArtistScreen() {
  const { pickFor } = useLocalSearchParams<{ pickFor?: PickFor }>();
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
        if (pickFor === undefined) {
          openLibraryScreen({ id: artist.id, screen: "artist" });
        } else {
          pickNewArtist(pickFor, artist);
        }
        return true;
      }}
    />
  );
}
