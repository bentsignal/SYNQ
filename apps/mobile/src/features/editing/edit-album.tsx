import { useRef, useState } from "react";
import {
  router,
  Stack,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { AlbumListItem } from "@synq/db";
import { getAlbum, listAlbumTracks } from "@synq/db";

import type { PickFor } from "./pick-created";
import { afterMenuCloses } from "~/components/menu";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { offerToDeleteEmptyAlbums } from "~/features/library/actions";
import { names, songCount } from "~/features/library/format";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import {
  draft,
  editRoutes,
  NEW_ALBUM_ROUTES,
  toRow,
  trackIds,
} from "./album-draft";
import { useArtistOptions } from "./artist-options";
import { KEEP_ARTWORK } from "./artwork-change";
import { ArtworkField } from "./artwork-field";
import { ChoiceList } from "./choice-list";
import { LinkRow } from "./link-row";
import { moveItems } from "./reorder";
import { ReorderList } from "./reorder-list";
import { saveEdits, saveNew } from "./save-album";
import { SheetToolbar } from "./sheet-toolbar";
import { draft as songDraft } from "./song-draft";
import { SongPicker } from "./song-picker";
import { applySongPick } from "./song-selection";

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
  const { pickFor } = useLocalSearchParams<{ pickFor?: PickFor }>();
  useState(() =>
    draft.begin({
      // Opened from a song's Albums: an album made there is by its artists.
      artists: pickFor === "song" ? songDraft.get().artists : [],
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
          saved.current = saveNew(pickFor);
        }}
      />
      <AlbumFields artwork={null} />
    </>
  );
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
        onNew={() =>
          router.push({ params: { pickFor: "album" }, pathname: "/new-artist" })
        }
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
