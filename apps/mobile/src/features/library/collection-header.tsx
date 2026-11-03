import type { ReactNode } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Stack } from "expo-router";
import { HStack, Image, Menu, Text as SwiftUIText } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  frame,
  menuIndicator,
  multilineTextAlignment,
} from "@expo/ui/swift-ui/modifiers";
import { LegendList } from "@legendapp/list/react-native";

import type { AlbumListItem, ArtworkRef } from "@synq/db";

import type { ArtworkPlaceholder } from "~/components/artwork";
import type { MenuAction } from "~/components/menu";
import { Artwork } from "~/components/artwork";
import { MenuItems } from "~/components/menu-items";
import { NativeRow } from "~/components/native-row";
import { usePreference } from "~/features/preferences/store";
import { themeAccent } from "~/features/preferences/themes";
import { FormHost } from "~/features/settings/form";
import { albumMenu } from "./collection-menu";
import { dotted, names } from "./format";
import { openLibraryScreen } from "./links";

/** Header artwork: 240 pt, or a 180 pt circle for artists. */
const ARTWORK_SIZE = 240;
const ARTIST_ARTWORK_SIZE = 180;
const TOP_PADDING = 12;
const TITLE_FADE = { duration: 220 };
/** Leaves the bar's buttons their room, however long the name. */
const TITLE_MAX_WIDTH = 220;

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
 * The bar's title for a page whose header shows the name: clear while the name
 * is on screen, fading in once it scrolls under the bar, as in Apple Music.
 * Pass `onScroll` to the list and `opacity` to `DetailTitle`. Nothing
 * re-renders: the fade runs on the UI thread.
 */
export function useHeaderTitle(placeholder: ArtworkPlaceholder) {
  const opacity = useSharedValue(0);
  const titled = useRef(false);
  return {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentInset, contentOffset } = event.nativeEvent;
      const past = contentOffset.y + contentInset.top > nameOffset(placeholder);
      if (past === titled.current) return;
      titled.current = past;
      opacity.set(withTiming(past ? 1 : 0, TITLE_FADE));
    },
    opacity,
  };
}

function FadingName({
  name,
  opacity,
}: {
  name: string;
  opacity: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.Text
      numberOfLines={1}
      className="text-headline text-foreground font-semibold"
      style={[{ maxWidth: TITLE_MAX_WIDTH }, style]}
    >
      {name}
    </Animated.Text>
  );
}

/**
 * A detail page's bar: no large title (the header has the name). With `opacity`,
 * the title fades with the scroll (`useHeaderTitle`); without it, it's the
 * system's title, for a page with no header to scroll past.
 */
export function DetailTitle({
  title,
  opacity,
}: {
  title: string;
  opacity?: SharedValue<number>;
}) {
  return (
    <Stack.Screen
      options={{
        headerLargeTitleEnabled: false,
        headerTitle:
          opacity === undefined
            ? title
            : () => <FadingName name={title} opacity={opacity} />,
        title,
      }}
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
        <View className="mt-1 items-center gap-0.5 self-stretch">{lines}</View>
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

/**
 * The album's artist in the accent, opening their page. Several are one link
 * that opens a native menu of them, since names side by side are hard to hit.
 */
export function ArtistLinks({
  artists,
}: {
  artists: readonly { id: number; name: string }[];
}) {
  const accent = themeAccent(usePreference("theme"));
  const [only] = artists;
  if (only === undefined) return null;
  if (artists.length === 1) {
    return (
      <Pressable
        accessibilityRole="link"
        hitSlop={6}
        className="active:opacity-60"
        onPress={() => openLibraryScreen({ id: only.id, screen: "artist" })}
      >
        <Text className="text-body text-accent text-center font-medium">
          {only.name}
        </Text>
      </Pressable>
    );
  }
  const menu = [
    artists.map(
      (artist) =>
        ({
          icon: "music.microphone",
          key: `artist-${artist.id}`,
          label: artist.name,
          onPress: () => openLibraryScreen({ id: artist.id, screen: "artist" }),
        }) satisfies MenuAction,
    ),
  ];
  return (
    <FormHost
      matchContents={{ vertical: true }}
      style={{ alignSelf: "stretch" }}
    >
      <Menu
        label={
          <HStack spacing={4}>
            <SwiftUIText
              modifiers={[
                font({ size: 17, weight: "medium" }),
                foregroundStyle(accent),
                multilineTextAlignment("center"),
              ]}
            >
              {names(artists)}
            </SwiftUIText>
            <Image systemName="chevron.down" size={11} color={accent} />
          </HStack>
        }
        modifiers={[menuIndicator("hidden"), frame({ maxWidth: Infinity })]}
      >
        <MenuItems groups={menu} />
      </Menu>
    </FormHost>
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
