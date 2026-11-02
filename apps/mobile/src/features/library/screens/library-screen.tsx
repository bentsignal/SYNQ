import { Text, useWindowDimensions, View } from "react-native";
import { Stack } from "expo-router";

import type { SongListItem } from "@synq/db";
import { findLikedPlaylistId, listSongs } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { EmptyState } from "~/components/empty-state";
import { NativeRow } from "~/components/native-row";
import { ScreenScroll } from "~/components/screen-scroll";
import { RootTabTitle } from "~/components/tab-title";
import { playSongs } from "~/features/player/actions";
import { names, UNKNOWN_ARTIST } from "../format";
import { LibraryLinkRow } from "../library-link-row";
import {
  IMPORT_ACTIONS,
  LIBRARY_ROWS,
  openImport,
  openLibraryScreen,
  openNewPlaylist,
} from "../links";
import { useLibraryQuery } from "../queries";
import { songMenu } from "../song-menu";
import { useIsLiked } from "../song-row";
import { songSort } from "../sort";

/** How many of the newest songs Recently Added shows. */
const RECENT_COUNT = 12;
const GRID_GAP = 16;
const GRID_PADDING = 16;
/** Two lines of footnote text and the gap above them, under a card's artwork. */
const CARD_TEXT_HEIGHT = 44;

function LikedSongsRow() {
  const likedId = useLibraryQuery({
    key: ["liked-id"],
    read: findLikedPlaylistId,
    select: (id) => id,
  });
  if (likedId === null) return null;
  return (
    <LibraryLinkRow
      icon="heart"
      label="Liked Songs"
      onPress={() => openLibraryScreen({ id: likedId, screen: "playlist" })}
    />
  );
}

function RecentCard({
  song,
  size,
  onPress,
}: {
  song: SongListItem;
  size: number;
  onPress: () => void;
}) {
  const artist = names(song.artists) || UNKNOWN_ARTIST;
  const liked = useIsLiked(song.id);
  return (
    <View style={{ width: size }}>
      <NativeRow
        card
        height={size + CARD_TEXT_HEIGHT}
        label={`${song.title}, ${artist}`}
        menu={songMenu(song, { liked })}
        menuButton={false}
        onPress={onPress}
      >
        <View style={{ width: size }}>
          <Artwork artwork={song.artwork} placeholder="song" size={size} />
          <Text
            numberOfLines={1}
            className="text-footnote text-foreground mt-1.5 font-medium"
          >
            {song.title}
          </Text>
          <Text numberOfLines={1} className="text-footnote text-muted">
            {artist}
          </Text>
        </View>
      </NativeRow>
    </View>
  );
}

/** The newest songs' artwork in two columns; a tap plays from there. */
function RecentlyAdded({ songs }: { songs: readonly SongListItem[] }) {
  const { width } = useWindowDimensions();
  const size = Math.floor((width - GRID_PADDING * 2 - GRID_GAP) / 2);
  const ids = songs.map((song) => song.id);
  return (
    <View className="pt-6">
      <Text className="text-foreground px-4 pb-3 text-[22px] font-bold">
        Recently Added
      </Text>
      <View
        className="flex-row flex-wrap"
        style={{
          columnGap: GRID_GAP,
          paddingHorizontal: GRID_PADDING,
          rowGap: 20,
        }}
      >
        {songs.map((song, index) => (
          <RecentCard
            key={song.id}
            song={song}
            size={size}
            onPress={() =>
              playSongs(ids, { source: { kind: "library" }, startIndex: index })
            }
          />
        ))}
      </View>
    </View>
  );
}

function LibraryToolbar() {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="plus" accessibilityLabel="Add Music">
        <Stack.Toolbar.Menu inline>
          <Stack.Toolbar.MenuAction
            icon="folder"
            onPress={() => openImport("files")}
          >
            Import from Files
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="wifi"
            onPress={() => openImport("wifi")}
          >
            Wi-Fi Transfer
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.MenuAction
          icon="music.note.list"
          onPress={openNewPlaylist}
        >
          New Playlist
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

/**
 * The Library tab (docs/ui.md → Library): Liked Songs and the library's
 * lists, then Recently Added; with no music yet, an invitation to import.
 */
export default function LibraryScreen() {
  const sort = songSort.initial;
  const recent = useLibraryQuery({
    // The Songs list's default read, so the two share one cache entry.
    key: ["songs", sort.key, sort.order],
    read: (db) => listSongs(db, { order: sort.order, sort: sort.key }),
    select: (songs) => songs.slice(0, RECENT_COUNT),
  });
  return (
    <>
      <RootTabTitle title="Library" />
      <LibraryToolbar />
      <ScreenScroll>
        {recent.length === 0 ? (
          <EmptyState
            icon="music.note.house"
            title="No Music Yet"
            actions={IMPORT_ACTIONS}
          />
        ) : (
          <View className="pb-8">
            <View className="pt-2">
              <LikedSongsRow />
              {LIBRARY_ROWS.map((row) => (
                <LibraryLinkRow
                  key={row.screen}
                  icon={row.icon}
                  label={row.label}
                  onPress={() => openLibraryScreen({ screen: row.screen })}
                />
              ))}
            </View>
            <RecentlyAdded songs={recent} />
          </View>
        )}
      </ScreenScroll>
    </>
  );
}
