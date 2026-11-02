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
  OPTION_SIZE,
  PLAY_SIZE,
  SKIP_SIZE,
  TRANSPORT_BOX,
  TRANSPORT_GAP,
} from "./player-layout";
import { isPlaying } from "./store";

/** Previous, play/pause, next. */
export function Transport() {
  const playing = usePlayer((state) => isPlaying(state.status));
  return (
    <View
      className="flex-row items-center justify-center"
      style={{ gap: TRANSPORT_GAP }}
    >
      <IconButton
        label="Previous"
        symbol="backward.fill"
        size={SKIP_SIZE}
        box={TRANSPORT_BOX}
        onPress={skipToPrevious}
      />
      <IconButton
        label={playing ? "Pause" : "Play"}
        symbol={playing ? "pause.fill" : "play.fill"}
        size={PLAY_SIZE}
        box={TRANSPORT_BOX}
        onPress={togglePlayback}
      />
      <IconButton
        label="Next"
        symbol="forward.fill"
        size={SKIP_SIZE}
        box={TRANSPORT_BOX}
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

/** Shuffle, repeat (accent when on), AirPlay, and the queue. */
export function PlayerOptions() {
  const shuffle = usePlayer((state) => state.shuffle);
  const repeat = usePlayer((state) => state.repeat);
  const [accent, muted] = useCSSVariable(["--color-accent", "--color-muted"]);
  return (
    <View className="flex-row items-center justify-between">
      <IconButton
        label="Shuffle"
        symbol="shuffle"
        size={OPTION_SIZE}
        box={OPTION_BOX}
        selected={shuffle}
        tint={shuffle ? "accent-accent" : "accent-muted"}
        onPress={toggleShuffle}
      />
      <IconButton
        label={REPEAT_LABEL[repeat]}
        symbol={repeat === "one" ? "repeat.1" : "repeat"}
        size={OPTION_SIZE}
        box={OPTION_BOX}
        selected={repeat !== "off"}
        tint={repeat === "off" ? "accent-muted" : "accent-accent"}
        onPress={cycleRepeat}
      />
      <RoutePickerButton
        accessibilityLabel="AirPlay"
        color={typeof muted === "string" ? muted : undefined}
        activeColor={typeof accent === "string" ? accent : undefined}
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
