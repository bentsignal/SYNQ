import { useState } from "react";
import { router, Stack } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { PlaylistListItem, PlaylistSongItem } from "@synq/db";
import {
  getPlaylist,
  listPlaylistSongs,
  removeSongsFromPlaylist,
  renamePlaylist,
  setPlaylistOrder,
} from "@synq/db";

import type { ArtworkChange } from "./artwork-change";
import type { ReorderRow } from "./reorder-list";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { tryWrite } from "~/features/library/actions";
import { songCount, songDetail } from "~/features/library/format";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { KEEP_ARTWORK, saveArtworkChange } from "./artwork-change";
import { ArtworkField } from "./artwork-field";
import { createDraft } from "./draft";
import { LinkRow } from "./link-row";
import { moveItems, removeItems } from "./reorder";
import { ReorderList } from "./reorder-list";
import { SheetToolbar } from "./sheet-toolbar";

interface PlaylistDraft {
  id: number;
  name: string;
  artwork: ArtworkChange;
  /** The songs in their new order, without the removed ones. */
  songs: readonly ReorderRow[];
  songsChanged: boolean;
}

const draft = createDraft<PlaylistDraft>("playlist");

function toRow(song: PlaylistSongItem) {
  return {
    artwork: song.artwork,
    key: String(song.id),
    subtitle: songDetail(song),
    title: song.title,
  } satisfies ReorderRow;
}

/** Saves the sheet: name, then songs, then (after it closes) artwork. */
function save(playlist: PlaylistListItem, saved: readonly number[]) {
  const edits = draft.get();
  if (edits.name !== playlist.name) {
    const renamed = tryWrite("Couldn't Rename Playlist", (db) =>
      renamePlaylist(db, playlist.id, edits.name),
    );
    if (renamed === undefined) return;
  }
  if (edits.songsChanged) {
    const kept = edits.songs.map((row) => Number(row.key));
    const keptIds = new Set(kept);
    const removed = saved.filter((id) => !keptIds.has(id));
    tryWrite("Couldn't Save Songs", (db) =>
      removeSongsFromPlaylist(db, playlist.id, removed),
    );
    tryWrite("Couldn't Save Songs", (db) =>
      setPlaylistOrder(db, playlist.id, kept),
    );
  }
  router.back();
  saveArtworkChange(edits.artwork, "playlist", playlist.id);
}

function Form({ playlist }: { playlist: PlaylistListItem }) {
  const songs = useLibraryQuery({
    key: ["playlist-songs", playlist.id, "position", "asc"],
    read: (db) => listPlaylistSongs(db, playlist.id),
    select: (items) => items,
  });
  const [saved] = useState(() => songs.map((song) => song.id));
  useState(() =>
    draft.begin({
      artwork: KEEP_ARTWORK,
      id: playlist.id,
      name: playlist.name,
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
        onDone={() => save(playlist, saved)}
      />
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            <ArtworkField
              artwork={playlist.artwork}
              change={edits.artwork}
              placeholder={playlist.kind === "liked" ? "liked" : "playlist"}
              onChange={(artwork) => draft.update(() => ({ artwork }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section title="Name">
            <TextInput
              defaultValue={playlist.name}
              placeholder="Playlist Name"
              autoCapitalize="words"
              onChangeText={(name) => draft.update(() => ({ name }))}
            />
          </FieldGroup.Section>
          <FieldGroup.Section>
            <LinkRow
              label="Edit Songs"
              value={songCount(edits.songs.length)}
              onPress={() =>
                router.push({
                  params: { id: String(playlist.id) },
                  pathname: "/edit-playlist/[id]/songs",
                })
              }
            />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}

/** Edit Playlist (docs/ui.md → Editing): artwork, name, and Edit Songs. */
export function EditPlaylistScreen() {
  const id = useIdParam();
  const playlist = useLibraryQuery({
    key: ["playlist", id],
    read: (db) => getPlaylist(db, id),
    select: (found) => found,
  });
  if (playlist === null) return null;
  return <Form playlist={playlist} />;
}

/** Edit Songs: drag to reorder, swipe or tap the red control to remove. */
export function EditPlaylistSongsScreen() {
  const edits = draft.useValue();
  return (
    <>
      <Stack.Screen options={{ title: "Edit Songs" }} />
      <ReorderList
        rows={edits.songs}
        onMove={(from, to) =>
          draft.update((current) => ({
            songs: moveItems(current.songs, from, to),
            songsChanged: true,
          }))
        }
        onDelete={(indices) =>
          draft.update((current) => ({
            songs: removeItems(current.songs, indices),
            songsChanged: true,
          }))
        }
      />
    </>
  );
}
