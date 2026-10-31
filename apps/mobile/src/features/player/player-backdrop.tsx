import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
// eslint-disable-next-line no-restricted-imports -- The colors come from an async native read of the cover, not the library; the previous song's gradient stays up until the next one's is ready.
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ArtworkRef } from "@synq/db";
import { artworkPath } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import { synqMedia, synqMediaAvailable } from "~/features/media/native";
import { backdropColors } from "./backdrop-colors";

/** A cover's dimmed average colors, top and bottom (null: no art, or a build without the reader). */
function useBackdropColors(artwork: ArtworkRef | null) {
  return useQuery({
    enabled: artwork !== null && synqMediaAvailable(),
    gcTime: Infinity,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (artwork === null) return null;
      // A 2.5.2 cover may exist in only one size.
      const small = documentFile(artworkPath(artwork, "small"));
      const image = small.exists
        ? small
        : documentFile(artworkPath(artwork, "full"));
      const averages = await synqMedia().artworkColors?.(image.uri);
      return averages === undefined ? null : backdropColors(averages);
    },
    queryKey: ["artwork-colors", artwork?.kind, artwork?.id, artwork?.version],
    select: (colors) => colors,
    staleTime: Infinity,
  }).data;
}

/**
 * Behind the whole player: a gradient in the artwork's own colors, dimmed
 * so white text reads over it (2.5.2's signature look), crossfading as
 * songs change. Songs without art get the plain background.
 */
export function PlayerBackdrop({ artwork }: { artwork: ArtworkRef | null }) {
  const colors = useBackdropColors(artwork);
  const shown = artwork === null ? null : colors;
  return (
    <View className="bg-background absolute inset-0" pointerEvents="none">
      {shown != null && (
        <Animated.View
          key={shown.join()}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          className="absolute inset-0"
        >
          <LinearGradient
            colors={shown}
            style={{ flex: 1 }}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          />
        </Animated.View>
      )}
    </View>
  );
}
