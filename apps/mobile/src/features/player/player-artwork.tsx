import type { ArtworkRef } from "@synq/db";
import { View } from "react-native";
import Animated, { cubicBezier } from "react-native-reanimated";

import { Artwork } from "~/components/artwork";
import { AdCard } from "./ad-card";

/** Paused, the artwork eases back a little, like Apple Music's. */
const PAUSED_SCALE = 0.85;
const EASE = cubicBezier(0.2, 0.9, 0.3, 1);

/**
 * The player's large artwork (or the ad card during the ad), with a soft
 * shadow, scaled down while paused.
 */
export function PlayerArtwork({
  artwork,
  interstitial,
  playing,
  size,
}: {
  artwork: ArtworkRef | null;
  interstitial: boolean;
  playing: boolean;
  size: number;
}) {
  return (
    <Animated.View
      style={{
        shadowColor: "#000000",
        shadowOffset: { height: 16, width: 0 },
        shadowOpacity: playing ? 0.45 : 0.25,
        shadowRadius: 28,
        transform: [{ scale: playing || interstitial ? 1 : PAUSED_SCALE }],
        transitionDuration: 420,
        transitionProperty: ["transform", "shadowOpacity"],
        transitionTimingFunction: EASE,
      }}
    >
      {interstitial ? (
        <AdCard size={size} />
      ) : (
        <View className="overflow-hidden rounded-xl">
          <Artwork artwork={artwork} placeholder="song" size={size} />
        </View>
      )}
    </Animated.View>
  );
}
