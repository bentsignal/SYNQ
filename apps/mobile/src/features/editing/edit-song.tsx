import { useState } from "react";
import { router, Stack } from "expo-router";
import { FieldGroup, Switch } from "@expo/ui";

import type { SongDetail } from "@synq/db";
import {
  canAddAlbumNamed,
  coverAlbum,
  editSong,
  getSong,
  listAlbums,
  listEmptyAlbums,
} from "@synq/db";

import type { Pick } from "./pick";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { offerToDeleteEmptyAlbums, tryWrite } from "~/features/library/actions";
import { libraryDb } from "~/features/library/database";
import { dotted, names } from "~/features/library/format";
import { useIdParam } from "~/features/library/params";
import { useLibraryQuery } from "~/features/library/queries";
import { useArtistOptions } from "./artist-options";
import { KEEP_ARTWORK, saveArtworkChange } from "./artwork-change";
import { ArtworkField } from "./artwork-field";
import { ChoiceList } from "./choice-list";
import { LinkRow } from "./link-row";
import { SheetToolbar } from "./sheet-toolbar";
import { artworkAlbum } from "./song-artwork";
import { chooseAlbums, draft } from "./song-draft";

function refOf(pick: Pick) {
  return "id" in pick ? { id: pick.id } : { name: pick.name };
}

/**
 * Saves the song's tags, then its artwork: on the album it's using when the
 * switch is on, else on the song. Removing the song's artwork never touches an
 * album's cover.
 */
function save(song: SongDetail) {
  const edits = draft.get();
  const edited = tryWrite("Couldn't Save Song", (db) =>
    editSong(db, song.id, {
      albums: edits.albums.map((pick) => ({ album: refOf(pick) })),
      artists: edits.artists.map(refOf),
      title: edits.title,
      useAlbumArtwork: edits.useAlbumArtwork,
    }),
  );
  if (edited === undefined) return;
  router.back();
  const album = edits.useAlbumArtwork ? coverAlbum(edited.albums) : undefined;
  if (album === undefined) saveArtworkChange(edits.artwork, "song", song.id);
  else saveArtworkChange(edits.artwork, "album", album.id);
  const kept = new Set(edited.albums.map((item) => item.id));
  offerToDeleteEmptyAlbums(
    listEmptyAlbums(
      libraryDb(),
      song.albums.map((item) => item.id).filter((id) => !kept.has(id)),
    ),
  );
}

function Form({ song }: { song: SongDetail }) {
  useState(() =>
    draft.begin({
      albums: song.albums,
      artists: song.artists,
      artwork: KEEP_ARTWORK,
      title: song.title,
      useAlbumArtwork: song.useAlbumArtwork,
    }),
  );
  const edits = draft.useValue();
  const album = artworkAlbum(edits);
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
              artwork={album?.cover ?? song.ownArtwork}
              change={edits.artwork}
              placeholder="song"
              sharedWith={
                album && {
                  albumName: album.name,
                  onChooseForSong: (change) =>
                    draft.update(() => ({
                      artwork: change,
                      useAlbumArtwork: false,
                    })),
                }
              }
              onChange={(change) => draft.update(() => ({ artwork: change }))}
            />
          </FieldGroup.Section>
          {edits.albums.length > 0 && (
            <FieldGroup.Section>
              <Switch
                label="Use Album Artwork"
                value={edits.useAlbumArtwork}
                onValueChange={(useAlbumArtwork) =>
                  draft.update(() => ({
                    artwork: KEEP_ARTWORK,
                    useAlbumArtwork,
                  }))
                }
              />
            </FieldGroup.Section>
          )}
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
              label="Album"
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

/** Edit Info: artwork, title, artists, and album. */
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
        onNew={() =>
          router.push({ params: { pickFor: "song" }, pathname: "/new-artist" })
        }
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
        artists: album.artists,
        detail: dotted(names(album.artists), album.year),
        artworkVersion: album.artwork?.version ?? null,
        id: album.id,
        name: album.name,
      })),
  });
  const artistNames = edits.artists.map((artist) => artist.name);
  return (
    <>
      <Stack.Screen options={{ title: "Album" }} />
      <ChoiceList
        noun="Album"
        options={albums}
        picked={edits.albums}
        single
        canAddNamed={(name) => canAddAlbumNamed(name, albums, artistNames)}
        onChange={chooseAlbums}
        onNew={() =>
          router.push({ params: { pickFor: "song" }, pathname: "/new-album" })
        }
      />
    </>
  );
}
