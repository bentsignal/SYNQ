import Animated, { cubicBezier } from "react-native-reanimated";

import type { ArtworkRef } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { useArtworkAnalysis } from "./artwork-analysis";
import { cornerZoom } from "./backdrop-palette";

/** Paused, the artwork eases back a little, like Apple Music's. */
const PAUSED_SCALE = 0.85;
const EASE = cubicBezier(0.2, 0.9, 0.3, 1);
const RADIUS = 12;

/**
 * The player's large artwork, with a soft shadow, scaled down while
 * paused. The player is the one place art sits on a light background, so a
 * cover with its own rounded corners is zoomed until they're past the clip.
 * The shadow has the art's corners; on a square view it would leave a clear
 * notch at each one.
 */
export function PlayerArtwork({
  artwork,
  playing,
  size,
}: {
  artwork: ArtworkRef | null;
  playing: boolean;
  size: number;
}) {
  const analysis = useArtworkAnalysis(artwork);
  // While the next cover is read, the last one's corners don't apply.
  const inset = analysis.isPlaceholderData
    ? 0
    : (analysis.data?.cornerInset ?? 0);
  return (
    <Animated.View
      style={{
        borderRadius: RADIUS,
        boxShadow: "0 16px 28px rgba(0, 0, 0, 0.4)",
        transform: [{ scale: playing ? 1 : PAUSED_SCALE }],
        transitionDuration: 420,
        transitionProperty: "transform",
        transitionTimingFunction: EASE,
      }}
    >
      <Artwork
        artwork={artwork}
        placeholder="song"
        radius={RADIUS}
        size={size}
        zoom={cornerZoom(inset, size, RADIUS)}
      />
    </Animated.View>
  );
}
