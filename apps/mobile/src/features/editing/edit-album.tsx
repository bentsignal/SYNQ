import { useRef, useState } from "react";
import { router, Stack, useNavigation } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { AlbumListItem } from "@synq/db";
import {
  createAlbum,
  getAlbum,
  listAlbumTracks,
  listArtists,
  setAlbumTracks,
  updateAlbum,
  written,
} from "@synq/db";

import { afterMenuCloses } from "~/components/menu";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { offerToDeleteEmptyAlbums, tryWrite } from "~/features/library/actions";
import { copyCoverToAlbum } from "~/features/library/files";
import { names, songCount } from "~/features/library/format";
import { openLibraryScreen } from "~/features/library/links";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import {
  coverFromTracks,
  draft,
  editRoutes,
  NEW_ALBUM_ROUTES,
  parseYear,
  toRow,
  trackIds,
} from "./album-draft";
import { KEEP_ARTWORK, saveArtworkChange } from "./artwork-change";
import { ArtworkField } from "./artwork-field";
import { ChoiceList } from "./choice-list";
import { LinkRow } from "./link-row";
import { artistIds } from "./pick";
import { moveItems } from "./reorder";
import { ReorderList } from "./reorder-list";
import { SheetToolbar } from "./sheet-toolbar";
import { SongPicker } from "./song-picker";
import { applySongPick } from "./song-selection";

/** Saves the sheet: fields and tracks together, then covers. */
function saveEdits(album: AlbumListItem, saved: ReadonlySet<string>) {
  const edits = draft.get();
  const cover = coverFromTracks(edits, album.artwork !== null, saved);
  const updated = tryWrite("Couldn't Save Album", (db) =>
    db.transaction((tx) => {
      updateAlbum(tx, album.id, {
        artistIds: artistIds(tx, edits.artists),
        name: edits.name,
        year: parseYear(edits.year),
      });
      setAlbumTracks(tx, album.id, trackIds(edits));
      return written(true, ["albums", "album_songs", "songs"]);
    }),
  );
  if (updated === undefined) return;
  if (cover !== null) copyCoverToAlbum(album.id, cover);
  router.back();
  saveArtworkChange(edits.artwork, "album", album.id);
}

/** Creates the album with its songs, then covers. False keeps the sheet up. */
function saveNew() {
  const edits = draft.get();
  const cover = coverFromTracks(edits, false, new Set());
  const created = tryWrite("Couldn't Create Album", (db) =>
    db.transaction((tx) => {
      const album = createAlbum(tx, {
        artistIds: artistIds(tx, edits.artists),
        name: edits.name,
        year: parseYear(edits.year),
      }).value;
      setAlbumTracks(tx, album.id, trackIds(edits));
      return written(album, ["albums", "album_songs", "album_artists"]);
    }),
  );
  if (created === undefined) return false;
  if (cover !== null) copyCoverToAlbum(created.id, cover);
  router.back();
  openLibraryScreen({ id: created.id, screen: "album" });
  saveArtworkChange(edits.artwork, "album", created.id);
  return true;
}

function AlbumFields({ artwork }: { artwork: AlbumListItem["artwork"] }) {
  const edits = draft.useValue();
  return (
    <NativeHost style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section>
          <ArtworkField
            artwork={artwork}
            change={edits.artwork}
            placeholder="album"
            onChange={(change) => draft.update(() => ({ artwork: change }))}
          />
        </FieldGroup.Section>
        <FieldGroup.Section title="Name">
          <TextInput
            defaultValue={edits.name}
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
            onPress={() => router.push(edits.routes.artists)}
          />
          <LinkRow
            label={edits.tracks.length === 0 ? "Add Songs" : "Add/Remove Songs"}
            value={
              edits.tracks.length === 0
                ? undefined
                : songCount(edits.tracks.length)
            }
            onPress={() => router.push(edits.routes.addSongs)}
          />
          {edits.tracks.length > 1 && (
            <LinkRow
              label="Reorder Songs"
              onPress={() => router.push(edits.routes.songs)}
            />
          )}
        </FieldGroup.Section>
      </FieldGroup>
    </NativeHost>
  );
}

function EditForm({ album }: { album: AlbumListItem }) {
  const tracks = useLibraryQuery({
    key: ["album-tracks", album.id],
    read: (db) => listAlbumTracks(db, album.id),
    select: (items) => items,
  });
  const [saved] = useState(
    () => new Set(tracks.map((song) => String(song.id))),
  );
  useState(() =>
    draft.begin({
      artists: album.artists,
      artwork: KEEP_ARTWORK,
      name: album.name,
      routes: editRoutes(album.id),
      tracks: tracks.map(toRow),
      year: album.year === null ? "" : String(album.year),
    }),
  );
  const edits = draft.useValue();
  return (
    <>
      <SheetToolbar
        title="Edit Album"
        canSave={edits.name.trim() !== ""}
        onCancel={() => router.back()}
        onDone={() => saveEdits(album, saved)}
      />
      <AlbumFields artwork={album.artwork} />
    </>
  );
}

/** Edit Album: artwork, name, year, artists, songs, and their order. */
export function EditAlbumScreen() {
  const id = useIdParam();
  const album = useLibraryQuery({
    key: ["album", id],
    read: (db) => getAlbum(db, id),
    select: (found) => found,
  });
  // Deleting from this sheet closes it; the form stays up as it slides away.
  const [opened] = useState(album);
  const shown = album ?? opened;
  if (shown === null) return null;
  return <EditForm album={shown} />;
}

/** New Album: the same form as Edit Album, so it can start with songs. */
export function NewAlbumScreen() {
  useState(() =>
    draft.begin({
      artists: [],
      artwork: KEEP_ARTWORK,
      name: "",
      routes: NEW_ALBUM_ROUTES,
      tracks: [],
      year: "",
    }),
  );
  const edits = draft.useValue();
  // Saving closes the sheet; a second tap must not make another.
  const saved = useRef(false);
  return (
    <>
      <SheetToolbar
        title="New Album"
        canSave={edits.name.trim() !== ""}
        onCancel={() => router.back()}
        onDone={() => {
          if (saved.current) return;
          saved.current = saveNew();
        }}
      />
      <AlbumFields artwork={null} />
    </>
  );
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

/**
 * Reorder Songs: drag to change the album's order. A new order sets track
 * numbers 1 to n (as 2.5.2 did).
 */
export function EditAlbumTracksScreen() {
  const edits = draft.useValue();
  return (
    <>
      <Stack.Screen options={{ title: "Reorder Songs" }} />
      <ReorderList
        rows={edits.tracks}
        onMove={(from, to) =>
          draft.update((current) => ({
            tracks: moveItems(current.tracks, from, to),
          }))
        }
      />
    </>
  );
}

/**
 * The checklist of songs: new ones join the end of the sheet's tracks at once
 * and join this album, staying on any others, when the sheet saves; unchecked
 * ones leave the sheet's tracks, and stay in the library.
 */
export function AddAlbumSongsScreen() {
  const navigation = useNavigation();
  const edits = draft.useValue();
  const id = useIdParam();
  const album = useLibraryQuery({
    key: ["album", id],
    read: (db) => getAlbum(db, id),
    select: (found) => found,
  });
  const hadSongs = useLibraryQuery({
    key: ["album-tracks", id],
    read: (db) => listAlbumTracks(db, id),
    select: (tracks) => tracks.length > 0,
  });
  /**
   * The last song just came off. Nothing is saved yet, so Delete closes the
   * sheet and Keep carries on with it. An album that opened empty never asks.
   */
  function offerIfEmptied(remaining: number) {
    if (remaining > 0 || !hadSongs || album === null) return;
    // The sheet's own navigator closes it, past the form, once the alert is
    // gone: iOS won't close a sheet while an alert is closing.
    offerToDeleteEmptyAlbums([album], () =>
      afterMenuCloses(() => navigation.getParent()?.goBack()),
    );
  }
  return (
    <SongPicker
      present={trackIds(edits)}
      onDone={(pick) => {
        const tracks = applySongPick(edits.tracks, pick, toRow);
        draft.update(() => ({ tracks }));
        router.back();
        offerIfEmptied(tracks.length);
        return true;
      }}
    />
  );
}
