import { Text } from "react-native";
import { router, Stack } from "expo-router";

import type { AlbumListItem, AlbumTrack } from "@synq/db";
import { getAlbum, listAlbumTracks } from "@synq/db";

import { ScreenList } from "~/components/screen-list";
import { playSongs } from "~/features/player/actions";
import { confirmDeleteAlbum } from "../actions";
import {
  ArtistLinks,
  CollectionHeader,
  DetailTitle,
  HeaderLine,
  useHeaderTitle,
} from "../collection-header";
import { collectionSummary, dotted, names } from "../format";
import { PlayShuffleButtons } from "../play-shuffle-buttons";
import { useIdParam } from "../params";
import { useLibraryQuery } from "../queries";
import { SONG_ROW_HEIGHT, SongRow } from "../song-row";

/**
 * A track's line under its title: only what differs from the album (a
 * featured artist); the album's own artists go without saying.
 */
function trackSubtitle(track: AlbumTrack, album: AlbumListItem) {
  const credited = names(track.artists);
  return credited === "" || credited === names(album.artists) ? null : credited;
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
  const source = { id: album.id, kind: "album" } as const;
  function ids() {
    return tracks.map((song) => song.id);
  }
  return (
    <>
      <DetailTitle title={header.title} />
      <AlbumMenu album={album} />
      <ScreenList
        data={tracks}
        keyExtractor={(song) => String(song.id)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        scrollEventThrottle={32}
        onScroll={header.onScroll}
        ListHeaderComponent={
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
        }
        ListFooterComponent={
          <Text className="text-footnote text-muted px-4 pt-4 pb-8 tabular-nums">
            {collectionSummary(album.songCount, album.durationMs)}
          </Text>
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
