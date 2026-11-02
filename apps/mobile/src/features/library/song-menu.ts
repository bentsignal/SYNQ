import { router } from "expo-router";

import type { SongListItem } from "@synq/db";

import type {
  MenuAction,
  MenuGroups,
  MenuItem,
  MenuSubmenu,
} from "~/components/menu";
import { exportFailed, exportSongs } from "~/features/export/export";
import { addToQueue, playNext } from "~/features/player/actions";
import { showQueueToast } from "~/features/player/queue-toast-store";
import {
  confirmDeleteSongs,
  removeFromAlbum,
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
  /** The album page the row is on: drops Go to Album, adds Remove from Album. */
  albumId?: number;
  /** The artist page the row is on: drops Go to Artist for them. */
  artistId?: number;
}

/** Shares the song with the library's current tags written in (features/export). */
function shareSong(song: SongListItem) {
  exportSongs([song.id]).catch(exportFailed("Couldn't Share Song"));
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

/** Taking the song off where it is, then out of the library. */
function removeGroup(
  song: SongListItem,
  { albumId, playlistId }: SongMenuPlace,
) {
  return [
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
    ...(albumId === undefined
      ? []
      : [
          {
            icon: "minus.circle",
            key: "remove-album",
            label: "Remove from Album",
            onPress: () => removeFromAlbum(albumId, [song.id]),
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
      onPress: () => {
        playNext([song.id]);
        showQueueToast("Playing Next");
      },
    },
    {
      icon: "text.line.last.and.arrowtriangle.forward",
      key: "queue",
      label: "Add to Queue",
      onPress: () => {
        addToQueue([song.id]);
        showQueueToast("Added to Queue");
      },
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
      onPress: () => shareSong(song),
    },
  ] satisfies MenuItem[];
  return [queue, keep, go, edit, removeGroup(song, place)].filter(
    (group) => group.length > 0,
  ) satisfies MenuGroups;
}
