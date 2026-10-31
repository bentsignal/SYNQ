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
import { isPlaying } from "./store";

/** Previous, play/pause, next. Skipping is off during the ad. */
export function Transport() {
  const playing = usePlayer((state) => isPlaying(state.status));
  const interstitial = usePlayer((state) => state.interstitial);
  return (
    <View className="flex-row items-center justify-center gap-8">
      <IconButton
        label="Previous"
        symbol="backward.fill"
        size={30}
        disabled={interstitial}
        onPress={skipToPrevious}
      />
      <IconButton
        label={playing ? "Pause" : "Play"}
        symbol={playing ? "pause.fill" : "play.fill"}
        size={44}
        onPress={togglePlayback}
      />
      <IconButton
        label="Next"
        symbol="forward.fill"
        size={30}
        disabled={interstitial}
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
        size={20}
        selected={shuffle}
        tint={shuffle ? "accent-accent" : "accent-muted"}
        onPress={toggleShuffle}
      />
      <IconButton
        label={REPEAT_LABEL[repeat]}
        symbol={repeat === "one" ? "repeat.1" : "repeat"}
        size={20}
        selected={repeat !== "off"}
        tint={repeat === "off" ? "accent-muted" : "accent-accent"}
        onPress={cycleRepeat}
      />
      <RoutePickerButton
        accessibilityLabel="AirPlay"
        color={typeof muted === "string" ? muted : undefined}
        activeColor={typeof accent === "string" ? accent : undefined}
        style={{ height: 36, width: 36 }}
      />
      <IconButton
        label="Queue"
        symbol="list.bullet"
        size={20}
        tint="accent-muted"
        onPress={() => router.push("/queue")}
      />
    </View>
  );
}
