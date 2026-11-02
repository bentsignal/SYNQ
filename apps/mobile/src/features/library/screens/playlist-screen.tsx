import { Stack } from "expo-router";

import type { PlaylistListItem } from "@synq/db";
import { getPlaylist, listPlaylistSongs } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { toolbarMenuItems } from "~/components/toolbar-menu-items";
import { playSongs } from "~/features/player/actions";
import {
  CollectionHeader,
  DetailTitle,
  HeaderLine,
  useHeaderTitle,
} from "../collection-header";
import { playlistMenu } from "../collection-menu";
import { collectionSummary } from "../format";
import { openLibraryScreen } from "../links";
import { useIdParam } from "../params";
import { PlayShuffleButtons } from "../play-shuffle-buttons";
import { useLibraryQuery } from "../queries";
import { SONG_ROW_HEIGHT, SongRow } from "../song-row";
import { playlistSongSort } from "../sort";
import { sortMenuItems } from "../sort-menu";

function PlaylistMenu({ playlist }: { playlist: PlaylistListItem }) {
  const sort = playlistSongSort.useValue(playlist.id);
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="More">
        {sortMenuItems({
          id: playlist.id,
          sort,
          store: playlistSongSort,
          submenu: true,
        })}
        {toolbarMenuItems(playlistMenu(playlist, { onPage: true }))}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

function Playlist({ playlist }: { playlist: PlaylistListItem }) {
  const sort = playlistSongSort.useValue(playlist.id);
  const songs = useLibraryQuery({
    key: ["playlist-songs", playlist.id, sort.key, sort.order],
    read: (db) =>
      listPlaylistSongs(db, playlist.id, { order: sort.order, sort: sort.key }),
    select: (items) => items,
  });
  const liked = playlist.kind === "liked";
  const placeholder = liked ? "liked" : "playlist";
  const header = useHeaderTitle(placeholder);
  const bare = songs.length === 0 && playlist.artwork === null;
  const source = liked
    ? ({ kind: "liked" } as const)
    : ({ id: playlist.id, kind: "playlist" } as const);
  function ids() {
    return songs.map((song) => song.id);
  }
  return (
    <>
      <DetailTitle
        title={playlist.name}
        opacity={bare ? undefined : header.opacity}
      />
      <PlaylistMenu playlist={playlist} />
      <ScreenList
        data={songs}
        keyExtractor={(song) => String(song.entryId)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        scrollEventThrottle={32}
        onScroll={header.onScroll}
        ListHeaderComponent={
          bare ? null : (
            <CollectionHeader
              artwork={playlist.artwork}
              placeholder={placeholder}
              name={playlist.name}
              lines={
                // An empty playlist says so below, in its empty state.
                playlist.songCount > 0 && (
                  <HeaderLine>
                    {collectionSummary(playlist.songCount, playlist.durationMs)}
                  </HeaderLine>
                )
              }
            >
              {songs.length > 0 && (
                <PlayShuffleButtons songIds={ids} source={source} />
              )}
            </CollectionHeader>
          )
        }
        ListEmptyComponent={
          <EmptyState
            compact={!bare}
            icon={liked ? "heart" : "music.note.list"}
            title={liked ? "No Liked Songs" : "No Songs Yet"}
            actions={[
              {
                label: "Browse Songs",
                onPress: () => openLibraryScreen({ screen: "songs" }),
              },
            ]}
          />
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            place={liked ? undefined : { playlistId: playlist.id }}
            onPress={() => playSongs(ids(), { source, startIndex: index })}
          />
        )}
      />
    </>
  );
}

/** A playlist, or Liked Songs: its header, then its songs in its order. */
export default function PlaylistScreen() {
  const id = useIdParam();
  const playlist = useLibraryQuery({
    key: ["playlist", id],
    read: (db) => getPlaylist(db, id),
    select: (found) => found,
  });
  // Gone (just deleted): the screen is on its way back.
  if (playlist === null) return null;
  return <Playlist playlist={playlist} />;
}
