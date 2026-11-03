import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "expo-router";
// eslint-disable-next-line no-restricted-imports -- The colors come from an async native read of the cover, not the library; the previous song's gradient stays up until the next one's is ready.
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ArtworkRef } from "@synq/db";

import { synqMedia, synqMediaAvailable } from "~/features/media/native";
import { coverFileUri, useArtworkAnalysis } from "./artwork-analysis";
import { backdropColors } from "./backdrop-colors";
import { backdropPalette, CHARCOAL } from "./backdrop-palette";
import { BackdropView } from "./native-backdrop";

/** A cover's dimmed average colors, top and bottom (null: no art, or a build without the reader). */
function useBackdropColors(artwork: ArtworkRef | null) {
  return useQuery({
    enabled: artwork !== null && synqMediaAvailable(),
    gcTime: Infinity,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (artwork === null) return null;
      const averages = await synqMedia().artworkColors?.(coverFileUri(artwork));
      return averages === undefined ? null : backdropColors(averages);
    },
    queryKey: ["artwork-colors", artwork?.kind, artwork?.id, artwork?.version],
    select: (colors) => colors,
    staleTime: Infinity,
  }).data;
}

/**
 * Behind the whole player: colors from the cover, drifting slowly (see
 * modules/synq-backdrop), crossfading as songs change. It holds still while
 * something covers the player. Songs without art get a slow charcoal.
 */
export function PlayerBackdrop({ artwork }: { artwork: ArtworkRef | null }) {
  return BackdropView === null ? (
    <GradientBackdrop artwork={artwork} />
  ) : (
    <MovingBackdrop artwork={artwork} View={BackdropView} />
  );
}

function MovingBackdrop({
  artwork,
  View: NativeBackdrop,
}: {
  artwork: ArtworkRef | null;
  View: NonNullable<typeof BackdropView>;
}) {
  const clusters = useArtworkAnalysis(artwork).data?.clusters;
  const animating = useIsFocused();
  return (
    <View className="bg-background absolute inset-0" pointerEvents="none">
      <NativeBackdrop
        animating={animating}
        style={{ flex: 1 }}
        swatches={
          artwork === null || clusters === undefined
            ? CHARCOAL
            : backdropPalette(clusters)
        }
      />
    </View>
  );
}

/**
 * For a binary built before the moving backdrop: a gradient in the artwork's
 * own colors, dimmed so white text reads over it (2.5.2's signature look),
 * crossfading as songs change. Songs without art get the plain background.
 */
function GradientBackdrop({ artwork }: { artwork: ArtworkRef | null }) {
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
