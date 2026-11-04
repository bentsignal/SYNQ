import { Text, View } from "react-native";

import type { HomeItem } from "@synq/db";
import { listSongs } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { NativeRow } from "~/components/native-row";
import { playSongs } from "~/features/player/actions";
import { albumMenu, artistMenu, playlistMenu } from "./collection-menu";
import { libraryDb } from "./database";
import { names, UNKNOWN_ARTIST } from "./format";
import { cardHeight } from "./home-layout";
import { openLibraryScreen } from "./links";
import { songMenu } from "./song-menu";
import { useIsLiked } from "./song-row";
import { songSort } from "./sort";

/** Plays the whole library from this song, as a tap in Songs does. */
function playFromLibrary(songId: number) {
  const { key, order } = songSort.initial;
  const ids = listSongs(libraryDb(), { order, sort: key }).map(
    (song) => song.id,
  );
  playSongs(ids, {
    source: { kind: "library" },
    startIndex: ids.indexOf(songId),
  });
}

/** What a card shows and does for each kind of item. */
function cardFor(item: HomeItem, liked: boolean) {
  switch (item.kind) {
    case "album":
      return {
        artwork: item.album.artwork,
        detail: names(item.album.artists) || "Album",
        menu: albumMenu(item.album),
        onPress: () => openLibraryScreen({ id: item.id, screen: "album" }),
        placeholder: "album",
        title: item.album.name,
      } as const;
    case "artist":
      return {
        artwork: item.artist.artwork,
        detail: "Artist",
        menu: artistMenu(item.artist),
        onPress: () => openLibraryScreen({ id: item.id, screen: "artist" }),
        placeholder: "artist",
        title: item.artist.name,
      } as const;
    case "playlist":
      return {
        artwork: item.playlist.artwork,
        detail: "Playlist",
        menu: playlistMenu(item.playlist),
        onPress: () => openLibraryScreen({ id: item.id, screen: "playlist" }),
        placeholder: item.playlist.kind === "liked" ? "liked" : "playlist",
        title: item.playlist.name,
      } as const;
    case "song":
      return {
        artwork: item.song.artwork,
        detail: names(item.song.artists) || UNKNOWN_ARTIST,
        menu: songMenu(item.song, { liked }),
        onPress: () => playFromLibrary(item.id),
        placeholder: "song",
        title: item.song.title,
      } as const;
  }
}

/**
 * A playlist, album, artist, or song on the Library tab: artwork with two lines
 * under it. A tap opens a collection and plays a song. One component for every
 * kind, so a recycled card keeps its native views whatever it shows next.
 */
export function HomeCard({ item, size }: { item: HomeItem; size: number }) {
  const liked = useIsLiked(item.kind === "song" ? item.id : -1);
  const { artwork, detail, menu, onPress, placeholder, title } = cardFor(
    item,
    liked,
  );
  return (
    // Not flattened: with the card directly among the list's views, removing a
    // section's heading after a menu closed crashed React Native, which found
    // the heading one place off. With its own parent, the card shifts nothing.
    <View collapsable={false} style={{ width: size }}>
      <NativeRow
        card
        height={cardHeight(size)}
        label={`${title}, ${detail}`}
        menu={menu}
        menuButton={false}
        onPress={onPress}
      >
        <View style={{ width: size }}>
          <Artwork artwork={artwork} placeholder={placeholder} size={size} />
          <Text
            numberOfLines={1}
            className="text-footnote text-foreground mt-1.5 font-medium"
          >
            {title}
          </Text>
          <Text numberOfLines={1} className="text-footnote text-muted">
            {detail}
          </Text>
        </View>
      </NativeRow>
    </View>
  );
}
