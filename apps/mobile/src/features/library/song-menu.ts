import { router } from "expo-router";
import { isAvailableAsync, shareAsync } from "expo-sharing";

import type { SongListItem } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import type {
  MenuAction,
  MenuGroups,
  MenuItem,
  MenuSubmenu,
} from "~/components/menu";
import { addToQueue, playNext } from "~/features/player/actions";
import {
  confirmDeleteSongs,
  failed,
  removeFromPlaylist,
  setLiked,
} from "./actions";
import { openLibraryScreen } from "./links";

/** Where a song row is, which changes what its menu offers. */
export interface SongMenuPlace {
  /** The song is in Liked Songs. */
  liked: boolean;
  /** The user playlist the row is in: adds Remove from Playlist. */
  playlistId?: number;
  /** The album page the row is on: drops Go to Album. */
  albumId?: number;
  /** The artist page the row is on: drops Go to Artist for them. */
  artistId?: number;
}

/**
 * Shares the song's file. TODO(export): write the library's current tags
 * into a copy first (docs/ui.md → Export / Share), once tag writing exists.
 */
async function shareSong(song: SongListItem) {
  if (song.filePath === null || !(await isAvailableAsync())) {
    failed("Couldn't Share Song");
    return;
  }
  await shareAsync(documentFile(song.filePath).uri, {
    dialogTitle: song.title,
    mimeType: song.mimeType ?? undefined,
  }).catch(() => failed("Couldn't Share Song"));
}

function goToArtist(song: SongListItem, place: SongMenuPlace) {
  const artists = song.artists.filter((artist) => artist.id !== place.artistId);
  const [only] = artists;
  if (only === undefined) return [];
  if (artists.length === 1) {
    return [
      {
        icon: "music.microphone",
        key: "artist",
        label: "Go to Artist",
        onPress: () => openLibraryScreen({ id: only.id, screen: "artist" }),
      } satisfies MenuAction,
    ];
  }
  return [
    {
      icon: "music.microphone",
      items: artists.map(
        (artist) =>
          ({
            icon: "music.microphone",
            key: `artist-${artist.id}`,
            label: artist.name,
            onPress: () =>
              openLibraryScreen({ id: artist.id, screen: "artist" }),
          }) satisfies MenuAction,
      ),
      key: "artists",
      label: "Go to Artist",
    } satisfies MenuSubmenu,
  ];
}

/**
 * A song's actions (docs/ui.md → Song menu), as one definition for the
 * row's ellipsis menu and its long-press menu.
 */
export function songMenu(song: SongListItem, place: SongMenuPlace) {
  const album = song.albums.find((credit) => credit.id !== place.albumId);
  const queue = [
    {
      icon: "text.line.first.and.arrowtriangle.forward",
      key: "next",
      label: "Play Next",
      onPress: () => playNext([song.id]),
    },
    {
      icon: "text.line.last.and.arrowtriangle.forward",
      key: "queue",
      label: "Add to Queue",
      onPress: () => addToQueue([song.id]),
    },
  ] satisfies MenuItem[];
  const keep = [
    {
      icon: "text.badge.plus",
      key: "add",
      label: "Add to Playlist…",
      onPress: () =>
        router.push({
          params: { songs: String(song.id) },
          pathname: "/add-to-playlist",
        }),
    },
    place.liked
      ? {
          icon: "heart.slash",
          key: "unlike",
          label: "Remove from Liked",
          onPress: () => setLiked(song.id, false),
        }
      : {
          icon: "heart",
          key: "like",
          label: "Love",
          onPress: () => setLiked(song.id, true),
        },
  ] satisfies MenuItem[];
  const go = [
    ...(album === undefined
      ? []
      : [
          {
            icon: "square.stack",
            key: "album",
            label: "Go to Album",
            onPress: () => openLibraryScreen({ id: album.id, screen: "album" }),
          } satisfies MenuAction,
        ]),
    ...goToArtist(song, place),
  ] satisfies MenuItem[];
  const edit = [
    {
      icon: "pencil",
      key: "edit",
      label: "Edit Info",
      onPress: () =>
        router.push({
          params: { id: String(song.id) },
          pathname: "/edit-song/[id]",
        }),
    },
    {
      icon: "square.and.arrow.up",
      key: "share",
      label: "Share",
      onPress: () => void shareSong(song),
    },
  ] satisfies MenuItem[];
  const { playlistId } = place;
  const remove = [
    ...(playlistId === undefined
      ? []
      : [
          {
            icon: "minus.circle",
            key: "remove",
            label: "Remove from Playlist",
            onPress: () => removeFromPlaylist(playlistId, [song.id]),
          } satisfies MenuAction,
        ]),
    {
      destructive: true,
      icon: "trash",
      key: "delete",
      label: "Delete from Library",
      onPress: () => confirmDeleteSongs([song]),
    },
  ] satisfies MenuItem[];
  return [queue, keep, go, edit, remove].filter(
    (group) => group.length > 0,
  ) satisfies MenuGroups;
}
