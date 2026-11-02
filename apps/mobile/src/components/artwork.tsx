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
 * A hairline edge, drawn over the art, keeps dark covers off the dark
 * background. Nothing sits behind the art or around it, so a cover with
 * clear corners shows only what's behind the whole component.
 */
export function Artwork({
  artwork,
  placeholder,
  size,
  radius,
  zoom = 1,
  className,
}: {
  artwork: ArtworkRef | null;
  placeholder: ArtworkPlaceholder;
  size: number;
  /** Overrides the size's usual corner radius. */
  radius?: number;
  /** Scales the art inside its corners, for covers with their own. */
  zoom?: number;
  className?: string;
}) {
  const round = placeholder === "artist";
  const corner = radius ?? (round ? size / 2 : size >= 120 ? 10 : 6);
  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden",
        artwork === null && "bg-fill",
        className,
      )}
      style={{ borderRadius: corner, height: size, width: size }}
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
          style={{ height: size, transform: [{ scale: zoom }], width: size }}
          contentFit="cover"
          transition={120}
          recyclingKey={`${artwork.kind}-${artwork.id}`}
          accessibilityIgnoresInvertColors
        />
      )}
      <View
        className="border-hairline absolute inset-0 border-white/10"
        pointerEvents="none"
        style={{ borderRadius: corner }}
      />
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
