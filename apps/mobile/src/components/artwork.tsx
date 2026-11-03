import type { SymbolViewProps } from "expo-symbols";
import { useState } from "react";
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
        <PlaceholderSymbol placeholder={placeholder} size={size} />
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

/**
 * Artwork that changes in place, for what's playing: the current image stays
 * up until the next one is ready, and the swap is one frame, with no fade and
 * no gap. List rows clear on `recyclingKey` so a recycled row never shows
 * another song's cover; here it's what caused the flicker on every skip.
 *
 * The player prefetches the covers around the current song into the memory
 * cache this reads (`features/player/artwork-prefetch.ts`). Nothing resizes
 * them on the way, which would cost the main thread a frame.
 */
export function SeamlessArtwork({
  artwork,
  placeholder,
  size,
  radius,
  zoom = 1,
}: {
  artwork: ArtworkRef | null;
  placeholder: ArtworkPlaceholder;
  size: number;
  radius?: number;
  zoom?: number;
}) {
  const corner = radius ?? (size >= 120 ? 10 : 6);
  const { source, standIn, onError } = useFallingBackSource(artwork, size);
  const { placeholderShown, onDisplay } = useHeldPlaceholder(source);
  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden",
        placeholderShown && "bg-fill",
      )}
      style={{ borderRadius: corner, height: size, width: size }}
    >
      {placeholderShown && (
        <PlaceholderSymbol placeholder={placeholder} size={size} />
      )}
      {source !== null && (
        <Image
          source={{ uri: source }}
          placeholder={standIn === null ? null : { uri: standIn }}
          placeholderContentFit="cover"
          style={{
            height: size,
            position: "absolute",
            transform: [{ scale: zoom }],
            width: size,
          }}
          contentFit="cover"
          cachePolicy="memory"
          allowDownscaling={false}
          onDisplay={onDisplay}
          onError={onError}
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

/**
 * A song without art going to one with it: the placeholder stays until the
 * image is drawn. Going the other way, it shows at once.
 */
function useHeldPlaceholder(source: string | null) {
  const [holding, setHolding] = useState(false);
  if (source === null && !holding) setHolding(true);
  return {
    onDisplay: () => setHolding(false),
    placeholderShown: source === null || holding,
  };
}

/**
 * A 2.5.2 cover may exist in only one size, so a file that fails moves on to
 * the other one. It has to say so here: with the previous image still up, the
 * last song's cover would otherwise stay. Null when there's nothing to show.
 */
function useFallingBackSource(artwork: ArtworkRef | null, size: number) {
  const primary =
    artwork === null
      ? null
      : artworkUri(Paths.document.uri, artwork, artworkSize(size));
  const standIn =
    artwork === null
      ? null
      : artworkUri(Paths.document.uri, artwork, otherSize(size));
  const [failure, setFailure] = useState({ count: 0, uri: primary });
  const failures = failure.uri === primary ? failure.count : 0;
  const candidates = [primary, standIn];
  return {
    onError: () => setFailure({ count: failures + 1, uri: primary }),
    source: candidates[failures] ?? null,
    standIn,
  };
}

function PlaceholderSymbol({
  placeholder,
  size,
}: {
  placeholder: ArtworkPlaceholder;
  size: number;
}) {
  return (
    <SymbolIcon
      name={PLACEHOLDER_SYMBOL[placeholder]}
      size={Math.round(size * (size >= 120 ? 0.3 : 0.4))}
      tintColorClassName={
        placeholder === "liked" ? "accent-accent" : "accent-subtle"
      }
    />
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
