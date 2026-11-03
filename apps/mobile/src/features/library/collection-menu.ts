import { router } from "expo-router";

import type {
  AlbumListItem,
  ArtistListItem,
  PlaylistListItem,
  SongListItem,
} from "@synq/db";
import { getArtistDetail, listAlbumTracks, listPlaylistSongs } from "@synq/db";

import type {
  MenuAction,
  MenuGroups,
  MenuItem,
  MenuSubmenu,
} from "~/components/menu";
import type { PlaybackSource } from "~/features/player/actions";
import {
  exportAlbum,
  exportArtist,
  exportFailed,
  exportPlaylist,
} from "~/features/export/export";
import { addToQueue, playNext, playSongs } from "~/features/player/actions";
import { showQueueToast } from "~/features/player/queue-toast-store";
import {
  confirmDeleteAlbum,
  confirmDeleteArtist,
  confirmDeletePlaylist,
} from "./actions";
import { libraryDb } from "./database";
import { openLibraryScreen } from "./links";
import { playlistSongSort } from "./sort";

/** Whether a menu is on a row in a list or on the collection's own page. */
export interface CollectionMenuPlace {
  /**
   * The collection's own page, which has Play and Shuffle buttons already
   * and goes back after a delete.
   */
  onPage?: boolean;
  /** The artist page the row is on: drops Go to Artist for them. */
  artistId?: number;
}

function back() {
  router.back();
}

function idsOf(songs: readonly SongListItem[]) {
  return songs.map((song) => song.id);
}

/**
 * The actions every song collection shares, in the song menu's order
 * (docs/ui.md → Collection menu): play, queue, keep, go, edit, delete.
 * `songIds` is read when an action runs, so a row's menu costs nothing
 * until it's used.
 */
function collectionMenu({
  place,
  songCount,
  songIds,
  source,
  go = [],
  edit,
  share,
  remove,
}: {
  place: CollectionMenuPlace;
  songCount: number;
  songIds: () => readonly number[];
  source: PlaybackSource;
  go?: readonly MenuItem[];
  edit: () => void;
  share: () => void;
  remove?: MenuAction;
}) {
  const hasSongs = songCount > 0;
  const play = [
    {
      icon: "play",
      key: "play",
      label: "Play",
      onPress: () => playSongs(songIds(), { source }),
    },
    {
      icon: "shuffle",
      key: "shuffle",
      label: "Shuffle",
      onPress: () => playSongs(songIds(), { shuffle: true, source }),
    },
  ] satisfies MenuItem[];
  const queue = [
    {
      icon: "text.line.first.and.arrowtriangle.forward",
      key: "next",
      label: "Play Next",
      onPress: () => {
        playNext(songIds());
        showQueueToast("Playing Next");
      },
    },
    {
      icon: "text.line.last.and.arrowtriangle.forward",
      key: "queue",
      label: "Add to Queue",
      onPress: () => {
        addToQueue(songIds());
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
          params: { songs: songIds().join(",") },
          pathname: "/add-to-playlist",
        }),
    },
  ] satisfies MenuItem[];
  const manage = [
    { icon: "pencil", key: "edit", label: "Edit", onPress: edit },
    ...(hasSongs
      ? [
          {
            icon: "square.and.arrow.up",
            key: "export",
            label: "Export",
            onPress: share,
          } satisfies MenuAction,
        ]
      : []),
  ] satisfies MenuItem[];
  return [
    hasSongs && place.onPage !== true ? play : [],
    hasSongs ? queue : [],
    hasSongs ? keep : [],
    go,
    manage,
    remove === undefined ? [] : [remove],
  ].filter((group) => group.length > 0) satisfies MenuGroups;
}

export function albumMenu(
  album: AlbumListItem,
  place: CollectionMenuPlace = {},
) {
  const artists = album.artists.filter(
    (artist) => artist.id !== place.artistId,
  );
  return collectionMenu({
    edit: () =>
      router.push({
        params: { id: String(album.id) },
        pathname: "/edit-album/[id]",
      }),
    go: goToArtists(artists, place),
    place,
    remove: {
      destructive: true,
      icon: "trash",
      key: "delete",
      label: "Delete Album",
      // Its own page goes back by itself once the album is gone.
      onPress: () => confirmDeleteAlbum(album),
    },
    share: () => {
      exportAlbum(album.id).catch(exportFailed("Couldn't Export Album"));
    },
    songCount: album.songCount,
    songIds: () => idsOf(listAlbumTracks(libraryDb(), album.id)),
    source: { id: album.id, kind: "album" },
  });
}

function goToArtists(
  artists: readonly { id: number; name: string }[],
  place: CollectionMenuPlace,
) {
  // The page's header links to its artists already.
  if (place.onPage === true) return [];
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

export function playlistMenu(
  playlist: PlaylistListItem,
  place: CollectionMenuPlace = {},
) {
  const liked = playlist.kind === "liked";
  return collectionMenu({
    edit: () =>
      router.push({
        params: { id: String(playlist.id) },
        pathname: "/edit-playlist/[id]",
      }),
    place,
    remove: liked
      ? undefined
      : {
          destructive: true,
          icon: "trash",
          key: "delete",
          label: "Delete Playlist",
          onPress: () =>
            confirmDeletePlaylist(
              playlist,
              place.onPage === true ? back : undefined,
            ),
        },
    share: () => {
      exportPlaylist(playlist.id).catch(
        exportFailed("Couldn't Export Playlist"),
      );
    },
    songCount: playlist.songCount,
    songIds: () => {
      const sort = playlistSongSort.get(playlist.id);
      return idsOf(
        listPlaylistSongs(libraryDb(), playlist.id, {
          order: sort.order,
          sort: sort.key,
        }),
      );
    },
    source: liked ? { kind: "liked" } : { id: playlist.id, kind: "playlist" },
  });
}

export function artistMenu(
  artist: ArtistListItem,
  place: CollectionMenuPlace = {},
) {
  return collectionMenu({
    edit: () =>
      router.push({
        params: { id: String(artist.id) },
        pathname: "/edit-artist/[id]",
      }),
    place,
    remove: {
      destructive: true,
      icon: "trash",
      key: "delete",
      label: "Delete Artist",
      onPress: () =>
        confirmDeleteArtist(artist, place.onPage === true ? back : undefined),
    },
    share: () => {
      exportArtist(artist.id).catch(exportFailed("Couldn't Export Artist"));
    },
    songCount: artist.songCount,
    songIds: () => idsOf(getArtistDetail(libraryDb(), artist.id)?.songs ?? []),
    source: { id: artist.id, kind: "artist" },
  });
}
