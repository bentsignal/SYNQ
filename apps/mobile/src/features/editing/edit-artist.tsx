import { useState } from "react";
import { router } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { ArtistListItem } from "@synq/db";
import { getArtist, renameArtist } from "@synq/db";

import type { ArtworkChange } from "./artwork-change";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { tryWrite } from "~/features/library/actions";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { KEEP_ARTWORK, saveArtworkChange } from "./artwork-change";
import { ArtworkField } from "./artwork-field";
import { SheetToolbar } from "./sheet-toolbar";

function Form({ artist }: { artist: ArtistListItem }) {
  // The typed name; undefined until the field changes.
  const [typed, setTyped] = useState<string>();
  const name = typed ?? artist.name;
  const [artwork, setArtwork] = useState<ArtworkChange>(KEEP_ARTWORK);
  function save() {
    if (name.trim() !== artist.name) {
      const renamed = tryWrite("Couldn't Rename Artist", (db) =>
        renameArtist(db, artist.id, name),
      );
      if (renamed === undefined) return;
    }
    router.back();
    saveArtworkChange(artwork, "artist", artist.id);
  }
  return (
    <>
      <SheetToolbar
        title="Edit Artist"
        canSave={name.trim() !== ""}
        onCancel={() => router.back()}
        onDone={save}
      />
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            <ArtworkField
              artwork={artist.artwork}
              change={artwork}
              placeholder="artist"
              onChange={setArtwork}
            />
          </FieldGroup.Section>
          <FieldGroup.Section title="Name">
            <TextInput
              defaultValue={artist.name}
              placeholder="Artist Name"
              autoCapitalize="words"
              onChangeText={setTyped}
            />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}

/** Edit Artist: artwork and name. */
export function EditArtistScreen() {
  const id = useIdParam();
  const artist = useLibraryQuery({
    key: ["artist-item", id],
    read: (db) => getArtist(db, id),
    select: (found) => found,
  });
  if (artist === null) return null;
  return <Form artist={artist} />;
}
