import { useRef } from "react";
import { Text, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";

import type {
  AlbumListItem,
  ArtistListItem,
  LibrarySearchResults,
  PlaylistListItem,
  SongListItem,
} from "@synq/db";
import { searchLibrary } from "@synq/db";

import { ScreenList } from "~/components/screen-list";
import { playSongs } from "~/features/player/actions";
import {
  blurNativeSearch,
  focusNativeSearch,
  nativeSearchBarRef,
} from "~/features/search/native-search";
import {
  useSearchQuery,
  useSearchText,
} from "~/features/search/use-search-query";
import { albumMenu, artistMenu, playlistMenu } from "../collection-menu";
import { COLLECTION_ROW_HEIGHT, CollectionRow } from "../collection-row";
import { albumDetail, songCount } from "../format";
import { LibraryLinkRow } from "../library-link-row";
import { LIBRARY_ROWS, openLibraryScreen } from "../links";
import { libraryQueryOptions } from "../queries";
import { NoResults } from "../searchable-list";
import { SONG_ROW_HEIGHT, SongRow } from "../song-row";

const TITLE_HEIGHT = 48;

type SearchItem =
  | { type: "title"; key: string; title: string }
  | {
      type: "song";
      key: string;
      song: SongListItem;
      index: number;
      songIds: readonly number[];
    }
  | { type: "album"; key: string; album: AlbumListItem }
  | { type: "artist"; key: string; artist: ArtistListItem }
  | { type: "playlist"; key: string; playlist: PlaylistListItem };

/** Results as one list: each kind under its title (docs/ui.md → Search). */
function resultItems(results: LibrarySearchResults) {
  const items = new Array<SearchItem>();
  const songIds = results.songs.map((song) => song.id);
  if (results.songs.length > 0) {
    items.push({ key: "t-songs", title: "Songs", type: "title" });
    results.songs.forEach((song, index) => {
      items.push({ index, key: `s${song.id}`, song, songIds, type: "song" });
    });
  }
  if (results.albums.length > 0) {
    items.push({ key: "t-albums", title: "Albums", type: "title" });
    for (const album of results.albums) {
      items.push({ album, key: `al${album.id}`, type: "album" });
    }
  }
  if (results.artists.length > 0) {
    items.push({ key: "t-artists", title: "Artists", type: "title" });
    for (const artist of results.artists) {
      items.push({ artist, key: `ar${artist.id}`, type: "artist" });
    }
  }
  if (results.playlists.length > 0) {
    items.push({ key: "t-playlists", title: "Playlists", type: "title" });
    for (const playlist of results.playlists) {
      items.push({ key: `p${playlist.id}`, playlist, type: "playlist" });
    }
  }
  return items;
}

function itemSize(item: SearchItem) {
  if (item.type === "title") return TITLE_HEIGHT;
  return item.type === "song" ? SONG_ROW_HEIGHT : COLLECTION_ROW_HEIGHT;
}

function ResultRow({ item }: { item: SearchItem }) {
  switch (item.type) {
    case "title":
      return (
        <View
          className="justify-end px-4 pb-1.5"
          style={{ height: TITLE_HEIGHT }}
        >
          <Text className="text-foreground text-[22px] font-bold">
            {item.title}
          </Text>
        </View>
      );
    case "song":
      return (
        <SongRow
          song={item.song}
          onPress={() =>
            playSongs(item.songIds, {
              source: { kind: "search" },
              startIndex: item.index,
            })
          }
        />
      );
    case "album":
      return (
        <CollectionRow
          artwork={item.album.artwork}
          placeholder="album"
          name={item.album.name}
          detail={albumDetail(item.album)}
          menu={albumMenu(item.album)}
          onPress={() =>
            openLibraryScreen({ id: item.album.id, screen: "album" })
          }
        />
      );
    case "artist":
      return (
        <CollectionRow
          artwork={item.artist.artwork}
          placeholder="artist"
          name={item.artist.name}
          detail={songCount(item.artist.songCount)}
          menu={artistMenu(item.artist)}
          onPress={() =>
            openLibraryScreen({ id: item.artist.id, screen: "artist" })
          }
        />
      );
    case "playlist":
      return (
        <CollectionRow
          artwork={item.playlist.artwork}
          placeholder={item.playlist.kind === "liked" ? "liked" : "playlist"}
          name={item.playlist.name}
          detail={songCount(item.playlist.songCount)}
          menu={playlistMenu(item.playlist)}
          onPress={() =>
            openLibraryScreen({ id: item.playlist.id, screen: "playlist" })
          }
        />
      );
  }
}

/** Before typing: the library's lists, to browse instead. */
function Browse() {
  return (
    <View className="pt-2">
      {LIBRARY_ROWS.map((row) => (
        <LibraryLinkRow
          key={row.screen}
          icon={row.icon}
          label={row.label}
          onPress={() => openLibraryScreen({ screen: row.screen })}
        />
      ))}
    </View>
  );
}

/**
 * The Search tab: the library's lists until you type, then songs (playable
 * in place), albums, artists, and playlists matching it, in sections.
 */
export default function SearchScreen() {
  const { clear, onChangeText, query } = useSearchText();
  const typed = useRef("");
  const found = useSearchQuery({
    options: {
      ...libraryQueryOptions(["search", query], (db) =>
        searchLibrary(db, query),
      ),
      enabled: query !== "",
      select: resultItems,
    },
    query,
  });

  // Selecting the tab opens the search field over the keyboard. The frame
  // waits for the native search bar to attach on the first visit. Coming
  // back from a result leaves the results up, without the keyboard. This
  // reads a ref, not the query: a focus effect that depends on the query
  // cleans up whenever a search settles, which took the keyboard away
  // mid-typing.
  useFocusEffect(() => {
    const frame =
      typed.current === ""
        ? requestAnimationFrame(focusNativeSearch)
        : undefined;
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      blurNativeSearch();
    };
  });

  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar
        ref={nativeSearchBarRef}
        placeholder="Songs, artists, albums, playlists"
        hideWhenScrolling={false}
        obscureBackground={false}
        placement="automatic"
        onChangeText={(event) => {
          typed.current = event.nativeEvent.text;
          onChangeText(event.nativeEvent.text);
        }}
        onCancelButtonPress={() => {
          typed.current = "";
          clear();
        }}
      />
      {/* The list's own `keyboardDismissMode` only sees drags that start on a
          row: React Native's scroll view doesn't take touches on the blank
          space past its content. Its tap handling can't dismiss this field
          either, since it only knows about its own text inputs. */}
      <View
        className="flex-1"
        onTouchMove={blurNativeSearch}
        onTouchEnd={blurNativeSearch}
      >
        <ScreenList
          data={found.query === "" ? [] : (found.data ?? [])}
          keyExtractor={(item) => item.key}
          getItemType={(item) => item.type}
          getFixedItemSize={itemSize}
          ListEmptyComponent={
            found.query === "" ? <Browse /> : <NoResults query={found.query} />
          }
          renderItem={({ item }) => <ResultRow item={item} />}
        />
      </View>
    </>
  );
}
