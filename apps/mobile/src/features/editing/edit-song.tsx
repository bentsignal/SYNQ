import { useState } from "react";
import { router, Stack } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { SongDetail } from "@synq/db";
import { editSong, getSong, listAlbums } from "@synq/db";

import type { ArtworkChange } from "./artwork-field";
import type { Pick } from "./choice-list";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { tryWrite } from "~/features/library/actions";
import { dotted, names } from "~/features/library/format";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { ArtworkField, KEEP_ARTWORK, saveArtworkChange } from "./artwork-field";
import { ChoiceList } from "./choice-list";
import { createDraft } from "./draft";
import { useArtistOptions } from "./edit-album";
import { LinkRow } from "./link-row";
import { SheetToolbar } from "./sheet-toolbar";

interface SongDraft {
  title: string;
  artists: readonly Pick[];
  /** In album order: the first is the song's primary album. */
  albums: readonly Pick[];
  artwork: ArtworkChange;
}

const draft = createDraft<SongDraft>("song");

function refOf(pick: Pick) {
  return "id" in pick ? { id: pick.id } : { name: pick.name };
}

/**
 * Saves the song's tags, then its artwork: on its primary album when it
 * has one (2.5.2 set the album's cover from a song), else on the song.
 */
function save(song: SongDetail) {
  const edits = draft.get();
  const edited = tryWrite("Couldn't Save Song", (db) =>
    editSong(db, song.id, {
      albums: edits.albums.map((pick) => ({ album: refOf(pick) })),
      artists: edits.artists.map(refOf),
      title: edits.title,
    }),
  );
  if (edited === undefined) return;
  router.back();
  const [album] = edited.albums;
  if (album === undefined) saveArtworkChange(edits.artwork, "song", song.id);
  else saveArtworkChange(edits.artwork, "album", album.id);
}

function Form({ song }: { song: SongDetail }) {
  useState(() =>
    draft.begin({
      albums: song.albums,
      artists: song.artists,
      artwork: KEEP_ARTWORK,
      title: song.title,
    }),
  );
  const edits = draft.useValue();
  return (
    <>
      <SheetToolbar
        title="Edit Info"
        canSave={edits.title.trim() !== ""}
        onCancel={() => router.back()}
        onDone={() => save(song)}
      />
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            <ArtworkField
              artwork={song.artwork}
              change={edits.artwork}
              placeholder="song"
              onChange={(artwork) => draft.update(() => ({ artwork }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section title="Title">
            <TextInput
              defaultValue={song.title}
              placeholder="Title"
              autoCapitalize="words"
              onChangeText={(title) => draft.update(() => ({ title }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section>
            <LinkRow
              label="Artists"
              value={names(edits.artists) || "None"}
              onPress={() =>
                router.push({
                  params: { id: String(song.id) },
                  pathname: "/edit-song/[id]/artists",
                })
              }
            />
            <LinkRow
              label="Albums"
              value={names(edits.albums) || "None"}
              onPress={() =>
                router.push({
                  params: { id: String(song.id) },
                  pathname: "/edit-song/[id]/albums",
                })
              }
            />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}

/** Edit Info: artwork, title, artists, and albums. */
export function EditSongScreen() {
  const id = useIdParam();
  const song = useLibraryQuery({
    key: ["song", id],
    read: (db) => getSong(db, id),
    select: (found) => found,
  });
  if (song === null) return null;
  return <Form song={song} />;
}

export function EditSongArtistsScreen() {
  const edits = draft.useValue();
  const artists = useArtistOptions();
  return (
    <>
      <Stack.Screen options={{ title: "Artists" }} />
      <ChoiceList
        noun="Artist"
        options={artists}
        picked={edits.artists}
        onChange={(picked) => draft.update(() => ({ artists: picked }))}
      />
    </>
  );
}

export function EditSongAlbumsScreen() {
  const edits = draft.useValue();
  const albums = useLibraryQuery({
    key: ["albums", "name", "asc"],
    read: (db) => listAlbums(db, { order: "asc", sort: "name" }),
    select: (items) =>
      items.map((album) => ({
        detail: dotted(names(album.artists), album.year),
        id: album.id,
        name: album.name,
      })),
  });
  return (
    <>
      <Stack.Screen options={{ title: "Albums" }} />
      <ChoiceList
        noun="Album"
        options={albums}
        picked={edits.albums}
        onChange={(picked) => draft.update(() => ({ albums: picked }))}
      />
    </>
  );
}
