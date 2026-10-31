import { useState } from "react";
import { router, Stack } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { AlbumListItem, AlbumTrack, LibraryDb } from "@synq/db";
import {
  createArtist,
  getAlbum,
  listAlbumTracks,
  listArtists,
  reorderAlbumTracks,
  updateAlbum,
} from "@synq/db";

import type { ArtworkChange } from "./artwork-field";
import type { Pick } from "./choice-list";
import type { ReorderRow } from "./reorder-list";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { tryWrite } from "~/features/library/actions";
import { names, songCount } from "~/features/library/format";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { ArtworkField, KEEP_ARTWORK, saveArtworkChange } from "./artwork-field";
import { ChoiceList } from "./choice-list";
import { createDraft } from "./draft";
import { LinkRow } from "./link-row";
import { moveItems } from "./reorder";
import { ReorderList } from "./reorder-list";
import { SheetToolbar } from "./sheet-toolbar";

interface AlbumDraft {
  name: string;
  year: string;
  artists: readonly Pick[];
  artwork: ArtworkChange;
  tracks: readonly ReorderRow[];
  tracksChanged: boolean;
}

const draft = createDraft<AlbumDraft>("album");

function toRow(track: AlbumTrack) {
  return {
    artwork: track.artwork,
    key: String(track.id),
    subtitle: track.track === null ? names(track.artists) : `Track ${track.track}`,
    title: track.title,
  } satisfies ReorderRow;
}

/** A year as typed, or null when the field is empty or not a year. */
function parseYear(text: string) {
  const year = Number.parseInt(text.trim(), 10);
  return Number.isInteger(year) && year > 0 && year < 10_000 ? year : null;
}

/** Artist ids for picks, creating the new ones (inside the album's write). */
export function artistIds(db: LibraryDb, picks: readonly Pick[]) {
  return picks.map((pick) =>
    "id" in pick ? pick.id : createArtist(db, pick.name).value.id,
  );
}

function save(album: AlbumListItem) {
  const edits = draft.get();
  const updated = tryWrite("Couldn't Save Album", (db) =>
    db.transaction((tx) =>
      updateAlbum(tx, album.id, {
        artistIds: artistIds(tx, edits.artists),
        name: edits.name,
        year: parseYear(edits.year),
      }),
    ),
  );
  if (updated === undefined) return;
  if (edits.tracksChanged) {
    tryWrite("Couldn't Reorder Tracks", (db) =>
      reorderAlbumTracks(
        db,
        album.id,
        edits.tracks.map((row) => Number(row.key)),
      ),
    );
  }
  router.back();
  saveArtworkChange(edits.artwork, "album", album.id);
}

function Form({ album }: { album: AlbumListItem }) {
  const tracks = useLibraryQuery({
    key: ["album-tracks", album.id],
    read: (db) => listAlbumTracks(db, album.id),
    select: (items) => items,
  });
  useState(() =>
    draft.begin({
      artists: album.artists,
      artwork: KEEP_ARTWORK,
      name: album.name,
      tracks: tracks.map(toRow),
      tracksChanged: false,
      year: album.year === null ? "" : String(album.year),
    }),
  );
  const edits = draft.use();
  return (
    <>
      <SheetToolbar
        title="Edit Album"
        canSave={edits.name.trim() !== ""}
        onCancel={() => router.back()}
        onDone={() => save(album)}
      />
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            <ArtworkField
              artwork={album.artwork}
              change={edits.artwork}
              placeholder="album"
              onChange={(artwork) => draft.update(() => ({ artwork }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section title="Name">
            <TextInput
              defaultValue={album.name}
              placeholder="Album Name"
              autoCapitalize="words"
              onChangeText={(name) => draft.update(() => ({ name }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section title="Year">
            <TextInput
              defaultValue={edits.year}
              placeholder="Year"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(year) => draft.update(() => ({ year }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section>
            <LinkRow
              label="Artists"
              value={names(edits.artists) || "None"}
              onPress={() =>
                router.push({
                  params: { id: String(album.id) },
                  pathname: "/edit-album/[id]/artists",
                })
              }
            />
            <LinkRow
              label="Reorder Tracks"
              value={songCount(edits.tracks.length)}
              onPress={() =>
                router.push({
                  params: { id: String(album.id) },
                  pathname: "/edit-album/[id]/tracks",
                })
              }
            />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}

/** Edit Album: artwork, name, year, artists, and Reorder Tracks. */
export function EditAlbumScreen() {
  const id = useIdParam();
  const album = useLibraryQuery({
    key: ["album", id],
    read: (db) => getAlbum(db, id),
    select: (found) => found,
  });
  if (album === null) return null;
  return <Form album={album} />;
}

/** Every artist, for choosing an album's or a song's. */
export function useArtistOptions() {
  return useLibraryQuery({
    key: ["artists", "name", "asc"],
    read: (db) => listArtists(db, { order: "asc", sort: "name" }),
    select: (artists) => artists,
  });
}

export function EditAlbumArtistsScreen() {
  const edits = draft.use();
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

/** Reorder Tracks: the order sets track numbers 1 to n (as 2.5.2 did). */
export function EditAlbumTracksScreen() {
  const edits = draft.use();
  return (
    <>
      <Stack.Screen options={{ title: "Reorder Tracks" }} />
      <ReorderList
        rows={edits.tracks}
        onMove={(from, to) =>
          draft.update((current) => ({
            tracks: moveItems(current.tracks, from, to),
            tracksChanged: true,
          }))
        }
      />
    </>
  );
}
