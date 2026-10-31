import type { SymbolViewProps } from "expo-symbols";
import { View } from "react-native";
import { Paths } from "expo-file-system";
import { Image } from "expo-image";

import type { ArtworkRef, ArtworkSize } from "@synq/db";
import { artworkUri } from "@synq/db";

import { SymbolIcon } from "~/components/symbol-icon";
import { cn } from "~/lib/cn";

/** What the placeholder shows when there's no artwork. */
export type ArtworkPlaceholder =
  | "song"
  | "album"
  | "artist"
  | "playlist"
  | "liked";

const PLACEHOLDER_SYMBOL = {
  album: "music.note",
  artist: "music.microphone",
  liked: "heart.fill",
  playlist: "music.note.list",
  song: "music.note",
} as const satisfies Record<ArtworkPlaceholder, SymbolViewProps["name"]>;

/**
 * Library artwork from the entity's folder (`cover_small.jpg` at row sizes,
 * `cover_full.jpg` above `SMALL_MAX`), keyed by its version so an edit
 * shows at once, or a placeholder symbol on `fill`. Artists are circles.
 * A hairline edge keeps dark covers off the dark background.
 */
export function Artwork({
  artwork,
  placeholder,
  size,
  className,
}: {
  artwork: ArtworkRef | null;
  placeholder: ArtworkPlaceholder;
  size: number;
  className?: string;
}) {
  const round = placeholder === "artist";
  const radius = round ? size / 2 : size >= 120 ? 10 : 6;
  return (
    <View
      className={cn(
        "bg-fill border-hairline items-center justify-center overflow-hidden border-white/10",
        className,
      )}
      style={{ borderRadius: radius, height: size, width: size }}
    >
      {artwork === null ? (
        <SymbolIcon
          name={PLACEHOLDER_SYMBOL[placeholder]}
          size={Math.round(size * (size >= 120 ? 0.3 : 0.4))}
          tintColorClassName={
            placeholder === "liked" ? "accent-accent" : "accent-subtle"
          }
        />
      ) : (
        <Image
          source={{
            uri: artworkUri(Paths.document.uri, artwork, artworkSize(size)),
          }}
          // A 2.5.2 cover may exist in only one size; the other stands in.
          placeholder={{
            uri: artworkUri(Paths.document.uri, artwork, otherSize(size)),
          }}
          placeholderContentFit="cover"
          style={{ height: size, width: size }}
          contentFit="cover"
          transition={120}
          recyclingKey={`${artwork.kind}-${artwork.id}`}
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
}

/** `cover_small.jpg` is 200 px: enough for rows at 3x, not for headers. */
const SMALL_MAX = 66;

function artworkSize(size: number) {
  return (size <= SMALL_MAX ? "small" : "full") satisfies ArtworkSize;
}

function otherSize(size: number) {
  return (
    artworkSize(size) === "small" ? "full" : "small"
  ) satisfies ArtworkSize;
}
