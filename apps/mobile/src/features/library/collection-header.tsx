import type { ReactNode } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { LegendList } from "@legendapp/list/react-native";

import type { AlbumListItem, ArtworkRef } from "@synq/db";

import type { ArtworkPlaceholder } from "~/components/artwork";
import { Artwork } from "~/components/artwork";
import { NativeRow } from "~/components/native-row";
import { albumMenu } from "./collection-menu";
import { dotted } from "./format";
import { openLibraryScreen } from "./links";

/** Header artwork: 240 pt, or a 180 pt circle for artists. */
const ARTWORK_SIZE = 240;
const ARTIST_ARTWORK_SIZE = 180;
const TOP_PADDING = 12;

/**
 * The scroll offset (below the bars) at which a header's name has gone
 * under them, so the bar shows it instead.
 */
function nameOffset(placeholder: ArtworkPlaceholder) {
  return (
    TOP_PADDING +
    (placeholder === "artist" ? ARTIST_ARTWORK_SIZE : ARTWORK_SIZE) +
    16 +
    24
  );
}

/**
 * The bar's title for a page whose header shows the name: empty while the
 * name is on screen, the name once it scrolls under the bar, as in Apple
 * Music. Pass `onScroll` to the list; the screen re-renders only when the
 * title comes or goes.
 */
export function useHeaderTitle(name: string, placeholder: ArtworkPlaceholder) {
  const [titled, setTitled] = useState(false);
  return {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentInset, contentOffset } = event.nativeEvent;
      const past = contentOffset.y + contentInset.top > nameOffset(placeholder);
      if (past !== titled) setTitled(past);
    },
    title: titled ? name : "",
  };
}

/** A detail page's bar: no large title (the header has the name). */
export function DetailTitle({ title }: { title: string }) {
  return (
    <Stack.Screen
      options={{ headerLargeTitleEnabled: false, headerTitle: title, title }}
    />
  );
}

/**
 * The top of a playlist, album, or artist page, scrolling with its songs
 * (docs/ui.md → Playlist, Album, Artist): artwork centered, the name, its
 * detail lines, then `children` (Play and Shuffle).
 */
export function CollectionHeader({
  artwork,
  placeholder,
  name,
  children,
  lines,
}: {
  artwork: ArtworkRef | null;
  placeholder: ArtworkPlaceholder;
  name: string;
  /** Detail lines under the name. */
  lines?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View style={{ paddingTop: TOP_PADDING }}>
      <View className="items-center px-6">
        <Artwork
          artwork={artwork}
          placeholder={placeholder}
          size={placeholder === "artist" ? ARTIST_ARTWORK_SIZE : ARTWORK_SIZE}
        />
        <Text
          numberOfLines={2}
          className="text-title text-foreground mt-4 text-center font-bold"
        >
          {name}
        </Text>
        <View className="mt-1 items-center gap-0.5">{lines}</View>
      </View>
      <View className="pt-4">{children}</View>
    </View>
  );
}

/** A muted detail line under a header's name. */
export function HeaderLine({ children }: { children: ReactNode }) {
  return (
    <Text numberOfLines={1} className="text-subhead text-muted tabular-nums">
      {children}
    </Text>
  );
}

/** The album's artists in the accent, each opening their page. */
export function ArtistLinks({
  artists,
}: {
  artists: readonly { id: number; name: string }[];
}) {
  if (artists.length === 0) return null;
  return (
    <View className="flex-row flex-wrap justify-center">
      {artists.map((artist, index) => (
        <Pressable
          key={artist.id}
          accessibilityRole="link"
          hitSlop={6}
          className="active:opacity-60"
          onPress={() => openLibraryScreen({ id: artist.id, screen: "artist" })}
        >
          <Text className="text-body text-accent font-medium">
            {artist.name}
            {index < artists.length - 1 ? ", " : ""}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A section title inside a page, such as an artist's "Albums" and "Songs". */
export function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-title text-foreground px-4 pt-5 pb-2 text-[22px] font-bold">
      {title}
    </Text>
  );
}

const CARD_SIZE = 140;
/** The artwork and two lines of footnote text under it. */
const CARD_HEIGHT = CARD_SIZE + 44;

function AlbumCard({
  album,
  artistId,
}: {
  album: AlbumListItem;
  artistId?: number;
}) {
  return (
    <NativeRow
      card
      height={CARD_HEIGHT}
      label={album.name}
      menu={albumMenu(album, { artistId })}
      menuButton={false}
      onPress={() => openLibraryScreen({ id: album.id, screen: "album" })}
    >
      <View style={{ width: CARD_SIZE }}>
        <Artwork artwork={album.artwork} placeholder="album" size={CARD_SIZE} />
        <Text
          numberOfLines={1}
          className="text-footnote text-foreground mt-1.5 font-medium"
        >
          {album.name}
        </Text>
        <Text numberOfLines={1} className="text-footnote text-muted">
          {dotted(album.year) || " "}
        </Text>
      </View>
    </NativeRow>
  );
}

/** An artist's albums as a horizontal row of 140 pt cards. */
export function AlbumCards({
  albums,
  artistId,
}: {
  albums: readonly AlbumListItem[];
  /** The artist page they're on: their long-press menus skip Go to Artist for them. */
  artistId?: number;
}) {
  return (
    <LegendList
      horizontal
      data={albums}
      keyExtractor={(album) => String(album.id)}
      estimatedItemSize={CARD_SIZE + 12}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
      style={{ height: CARD_HEIGHT }}
      renderItem={({ item }) => (
        <View style={{ width: CARD_SIZE }}>
          <AlbumCard album={item} artistId={artistId} />
        </View>
      )}
    />
  );
}
