import { Text } from "react-native";
import { router, Stack } from "expo-router";

import type { AlbumListItem, AlbumTrack } from "@synq/db";
import { getAlbum, listAlbumTracks } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { exportAlbum } from "~/features/export/export";
import { playSongs } from "~/features/player/actions";
import { confirmDeleteAlbum, failed } from "../actions";
import {
  ArtistLinks,
  CollectionHeader,
  DetailTitle,
  HeaderLine,
  useHeaderTitle,
} from "../collection-header";
import { collectionSummary, dotted, names } from "../format";
import { useIdParam } from "../params";
import { PlayShuffleButtons } from "../play-shuffle-buttons";
import { useLibraryQuery } from "../queries";
import { SONG_ROW_HEIGHT, SongRow } from "../song-row";

/**
 * A track's line under its title: only what differs from the album (a
 * featured artist); the album's own artists go without saying.
 */
function trackSubtitle(track: AlbumTrack, album: AlbumListItem) {
  const albumArtists = new Set(album.artists.map((artist) => artist.id));
  return track.artists.every((artist) => albumArtists.has(artist.id))
    ? null
    : names(track.artists);
}

function AlbumMenu({ album }: { album: AlbumListItem }) {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="More">
        <Stack.Toolbar.MenuAction
          icon="pencil"
          onPress={() =>
            router.push({
              params: { id: String(album.id) },
              pathname: "/edit-album/[id]",
            })
          }
        >
          Edit
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="square.and.arrow.up"
          onPress={() =>
            exportAlbum(album.id).catch(() => failed("Couldn't Export Album"))
          }
        >
          Export
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="trash"
          destructive
          onPress={() => confirmDeleteAlbum(album, () => router.back())}
        >
          Delete Album
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

function Album({ album }: { album: AlbumListItem }) {
  const tracks = useLibraryQuery({
    key: ["album-tracks", album.id],
    read: (db) => listAlbumTracks(db, album.id),
    select: (items) => items,
  });
  const header = useHeaderTitle(album.name, "album");
  const bare = tracks.length === 0 && album.artwork === null;
  const source = { id: album.id, kind: "album" } as const;
  function ids() {
    return tracks.map((song) => song.id);
  }
  return (
    <>
      <DetailTitle title={bare ? album.name : header.title} />
      <AlbumMenu album={album} />
      <ScreenList
        data={tracks}
        keyExtractor={(song) => String(song.id)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        scrollEventThrottle={32}
        onScroll={header.onScroll}
        ListHeaderComponent={
          bare ? null : (
            <CollectionHeader
              artwork={album.artwork}
              placeholder="album"
              name={album.name}
              lines={
                <>
                  <ArtistLinks artists={album.artists} />
                  <HeaderLine>{dotted("Album", album.year)}</HeaderLine>
                </>
              }
            >
              {tracks.length > 0 && (
                <PlayShuffleButtons songIds={ids} source={source} />
              )}
            </CollectionHeader>
          )
        }
        ListEmptyComponent={
          <EmptyState
            compact={!bare}
            icon="square.stack"
            title="No Songs Yet"
          />
        }
        ListFooterComponent={
          tracks.length > 0 ? (
            <Text className="text-footnote text-muted px-4 pt-4 pb-8 tabular-nums">
              {collectionSummary(album.songCount, album.durationMs)}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            track={item.track}
            subtitle={trackSubtitle(item, album)}
            place={{ albumId: album.id }}
            onPress={() => playSongs(ids(), { source, startIndex: index })}
          />
        )}
      />
    </>
  );
}

/** An album: its header, its tracks in order, and their total. */
export default function AlbumScreen() {
  const id = useIdParam();
  const album = useLibraryQuery({
    key: ["album", id],
    read: (db) => getAlbum(db, id),
    select: (found) => found,
  });
  if (album === null) return null;
  return <Album album={album} />;
}
