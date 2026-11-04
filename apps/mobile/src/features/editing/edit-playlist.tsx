import type { Href } from "expo-router";
import { useRef, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { PlaylistListItem, SongListItem } from "@synq/db";
import {
  createPlaylist,
  getPlaylist,
  getSongItems,
  listPlaylistSongs,
  renamePlaylist,
  setPlaylistSongs,
  written,
} from "@synq/db";

import type { ArtworkChange } from "./artwork-change";
import type { ReorderRow } from "./reorder-list";
import type { ArtworkPlaceholder } from "~/components/artwork";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { tryWrite } from "~/features/library/actions";
import { libraryDb } from "~/features/library/database";
import { songCount, songDetail } from "~/features/library/format";
import { openLibraryScreen } from "~/features/library/links";
import { songIdsParam, useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { KEEP_ARTWORK, saveArtworkChange } from "./artwork-change";
import { ArtworkField } from "./artwork-field";
import { createDraft } from "./draft";
import { LinkRow } from "./link-row";
import { moveItems } from "./reorder";
import { ReorderList } from "./reorder-list";
import { SheetToolbar } from "./sheet-toolbar";
import { SongPicker } from "./song-picker";
import { applySongPick } from "./song-selection";

interface PlaylistDraft {
  name: string;
  artwork: ArtworkChange;
  /** The songs in their new order, with added ones and without removed ones. */
  songs: readonly ReorderRow[];
  /** Whether Done should write the songs. */
  songsChanged: boolean;
  /** Where this sheet's lists live. */
  routes: PlaylistRoutes;
}

interface PlaylistRoutes {
  songs: Href;
  addSongs: Href;
}

const NEW_PLAYLIST_ROUTES = {
  addSongs: "/new-playlist/add-songs",
  songs: "/new-playlist/songs",
} satisfies PlaylistRoutes;

function editRoutes(id: number) {
  const params = { id: String(id) };
  return {
    addSongs: { params, pathname: "/edit-playlist/[id]/add-songs" },
    songs: { params, pathname: "/edit-playlist/[id]/songs" },
  } satisfies PlaylistRoutes;
}

const draft = createDraft<PlaylistDraft>("playlist");

function toRow(song: SongListItem) {
  return {
    artwork: song.artwork,
    key: String(song.id),
    subtitle: songDetail(song),
    title: song.title,
  } satisfies ReorderRow;
}

/** Songs by id, in the order given (`getSongItems` returns them by id). */
function songsInOrder(ids: readonly number[]) {
  const order = new Map(ids.map((id, index) => [id, index]));
  return getSongItems(libraryDb(), ids).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}

function songIds(edits: PlaylistDraft) {
  return edits.songs.map((row) => Number(row.key));
}

/** Saves the sheet: name and songs together, then (after it closes) artwork. */
function saveEdits(playlist: PlaylistListItem) {
  const edits = draft.get();
  const updated = tryWrite("Couldn't Save Playlist", (db) =>
    db.transaction((tx) => {
      if (edits.name !== playlist.name) {
        renamePlaylist(tx, playlist.id, edits.name);
      }
      if (edits.songsChanged) {
        setPlaylistSongs(tx, playlist.id, songIds(edits));
      }
      return written(true, ["playlists", "playlist_songs"]);
    }),
  );
  if (updated === undefined) return;
  router.back();
  saveArtworkChange(edits.artwork, "playlist", playlist.id);
}

/**
 * Creates the playlist with its songs, then its artwork. Coming from Add to
 * Playlist closes both sheets; otherwise it opens the new playlist. False
 * keeps the sheet up.
 */
function saveNew(fromAddToPlaylist: boolean) {
  const edits = draft.get();
  const created = tryWrite("Couldn't Create Playlist", (db) =>
    db.transaction((tx) => {
      const playlist = createPlaylist(tx, edits.name).value;
      setPlaylistSongs(tx, playlist.id, songIds(edits));
      return written(playlist, ["playlists", "playlist_songs"]);
    }),
  );
  if (created === undefined) return false;
  if (fromAddToPlaylist) {
    router.dismiss(2);
  } else {
    router.back();
    openLibraryScreen({ id: created.id, screen: "playlist" });
  }
  saveArtworkChange(edits.artwork, "playlist", created.id);
  return true;
}

function PlaylistFields({
  artwork,
  placeholder,
}: {
  artwork: PlaylistListItem["artwork"];
  placeholder: ArtworkPlaceholder;
}) {
  const edits = draft.useValue();
  return (
    <NativeHost style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section>
          <ArtworkField
            artwork={artwork}
            change={edits.artwork}
            placeholder={placeholder}
            onChange={(change) => draft.update(() => ({ artwork: change }))}
          />
        </FieldGroup.Section>
        <FieldGroup.Section title="Name">
          <TextInput
            defaultValue={edits.name}
            placeholder="Playlist Name"
            autoCapitalize="words"
            onChangeText={(name) => draft.update(() => ({ name }))}
          />
        </FieldGroup.Section>
        <FieldGroup.Section>
          <LinkRow
            label={edits.songs.length === 0 ? "Add Songs" : "Songs"}
            value={
              edits.songs.length === 0
                ? undefined
                : songCount(edits.songs.length)
            }
            onPress={() => router.push(edits.routes.addSongs)}
          />
          {edits.songs.length > 1 && (
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

function EditForm({ playlist }: { playlist: PlaylistListItem }) {
  const songs = useLibraryQuery({
    key: ["playlist-songs", playlist.id, "position", "asc"],
    read: (db) => listPlaylistSongs(db, playlist.id),
    select: (items) => items,
  });
  useState(() =>
    draft.begin({
      artwork: KEEP_ARTWORK,
      name: playlist.name,
      routes: editRoutes(playlist.id),
      songs: songs.map(toRow),
      songsChanged: false,
    }),
  );
  const edits = draft.useValue();
  return (
    <>
      <SheetToolbar
        title="Edit Playlist"
        canSave={edits.name.trim() !== ""}
        onCancel={() => router.back()}
        onDone={() => saveEdits(playlist)}
      />
      <PlaylistFields
        artwork={playlist.artwork}
        placeholder={playlist.kind === "liked" ? "liked" : "playlist"}
      />
    </>
  );
}

/** Edit Playlist (docs/ui.md → Editing): artwork, name, songs, and their order. */
export function EditPlaylistScreen() {
  const id = useIdParam();
  const playlist = useLibraryQuery({
    key: ["playlist", id],
    read: (db) => getPlaylist(db, id),
    select: (found) => found,
  });
  if (playlist === null) return null;
  return <EditForm playlist={playlist} />;
}

/**
 * New Playlist: the same form as Edit Playlist, so it can start with a
 * picture and songs. From Add to Playlist (`songs`) it starts with those.
 */
export function NewPlaylistScreen() {
  const { songs } = useLocalSearchParams<{ songs?: string }>();
  const fromAddToPlaylist = songs !== undefined;
  useState(() =>
    draft.begin({
      artwork: KEEP_ARTWORK,
      name: "",
      routes: NEW_PLAYLIST_ROUTES,
      songs: songsInOrder(songIdsParam(songs)).map(toRow),
      songsChanged: false,
    }),
  );
  const edits = draft.useValue();
  // Saving closes the sheet; a second tap must not make another.
  const saved = useRef(false);
  return (
    <>
      <SheetToolbar
        title="New Playlist"
        canSave={edits.name.trim() !== ""}
        onCancel={() => router.back()}
        onDone={() => {
          if (saved.current) return;
          saved.current = saveNew(fromAddToPlaylist);
        }}
      />
      <PlaylistFields artwork={null} placeholder="playlist" />
    </>
  );
}

/** Reorder Songs: drag to change the playlist's order. */
export function EditPlaylistSongsScreen() {
  const edits = draft.useValue();
  return (
    <>
      <Stack.Screen options={{ title: "Reorder Songs" }} />
      <ReorderList
        rows={edits.songs}
        onMove={(from, to) =>
          draft.update((current) => ({
            songs: moveItems(current.songs, from, to),
            songsChanged: true,
          }))
        }
      />
    </>
  );
}

/**
 * The checklist of songs: new ones join the end of the sheet's list at once,
 * unchecked ones leave it, and both save with it.
 */
export function AddPlaylistSongsScreen() {
  const edits = draft.useValue();
  return (
    <SongPicker
      present={songIds(edits)}
      onDone={(pick) => {
        draft.update((current) => ({
          songs: applySongPick(current.songs, pick, toRow),
          songsChanged: true,
        }));
        router.back();
        return true;
      }}
    />
  );
}
