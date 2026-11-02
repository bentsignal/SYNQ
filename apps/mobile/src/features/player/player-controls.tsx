import { View } from "react-native";
import { router } from "expo-router";
import { useCSSVariable } from "uniwind";

import { RoutePickerButton } from "@synq/audio";

import {
  cycleRepeat,
  skipToNext,
  skipToPrevious,
  togglePlayback,
  toggleShuffle,
} from "./commands";
import { usePlayer } from "./hooks";
import { IconButton } from "./icon-button";
import {
  OPTION_BOX,
  OPTION_CIRCLE,
  OPTION_SIZE,
  PLAY_SIZE,
  QUEUE_PLAY_SIZE,
  QUEUE_SKIP_SIZE,
  QUEUE_TRANSPORT_BOX,
  QUEUE_TRANSPORT_GAP,
  SKIP_SIZE,
  TRANSPORT_BOX,
  TRANSPORT_GAP,
} from "./player-layout";
import { isPlaying } from "./store";

const FULL = {
  box: TRANSPORT_BOX,
  gap: TRANSPORT_GAP,
  play: PLAY_SIZE,
  skip: SKIP_SIZE,
};
const COMPACT = {
  box: QUEUE_TRANSPORT_BOX,
  gap: QUEUE_TRANSPORT_GAP,
  play: QUEUE_PLAY_SIZE,
  skip: QUEUE_SKIP_SIZE,
};

/** Previous, play/pause, next: `compact` is the queue's smaller row. */
export function Transport({ compact = false }: { compact?: boolean }) {
  const playing = usePlayer((state) => isPlaying(state.status));
  const sizes = compact ? COMPACT : FULL;
  return (
    <View
      className="flex-row items-center justify-center"
      style={{ gap: sizes.gap }}
    >
      <IconButton
        label="Previous"
        symbol="backward.fill"
        size={sizes.skip}
        box={sizes.box}
        onPress={skipToPrevious}
      />
      <IconButton
        label={playing ? "Pause" : "Play"}
        symbol={playing ? "pause.fill" : "play.fill"}
        size={sizes.play}
        box={sizes.box}
        onPress={togglePlayback}
      />
      <IconButton
        label="Next"
        symbol="forward.fill"
        size={sizes.skip}
        box={sizes.box}
        onPress={skipToNext}
      />
    </View>
  );
}

const REPEAT_LABEL = {
  all: "Repeat All",
  off: "Repeat Off",
  one: "Repeat One",
} as const;

/**
 * Shuffle, repeat, AirPlay, and the queue. On, they're white in a quiet circle:
 * nothing in the player wears the theme's accent, which can clash with the
 * song's own colors around it.
 */
export function PlayerOptions() {
  const shuffle = usePlayer((state) => state.shuffle);
  const repeat = usePlayer((state) => state.repeat);
  const [foreground, muted] = useCSSVariable([
    "--color-foreground",
    "--color-muted",
  ]);
  return (
    <View className="flex-row items-center justify-between">
      <IconButton
        label="Shuffle"
        symbol="shuffle"
        size={OPTION_SIZE}
        box={OPTION_BOX}
        selected={shuffle}
        circle={shuffle ? OPTION_CIRCLE : undefined}
        tint={shuffle ? "accent-foreground" : "accent-muted"}
        onPress={toggleShuffle}
      />
      <IconButton
        label={REPEAT_LABEL[repeat]}
        symbol={repeat === "one" ? "repeat.1" : "repeat"}
        size={OPTION_SIZE}
        box={OPTION_BOX}
        selected={repeat !== "off"}
        circle={repeat === "off" ? undefined : OPTION_CIRCLE}
        tint={repeat === "off" ? "accent-muted" : "accent-foreground"}
        onPress={cycleRepeat}
      />
      <RoutePickerButton
        accessibilityLabel="AirPlay"
        color={typeof muted === "string" ? muted : undefined}
        activeColor={typeof foreground === "string" ? foreground : undefined}
        style={{ height: OPTION_BOX, width: OPTION_BOX }}
      />
      <IconButton
        label="Queue"
        symbol="list.bullet"
        size={OPTION_SIZE}
        box={OPTION_BOX}
        tint="accent-muted"
        onPress={() => router.push("/queue")}
      />
    </View>
  );
}
