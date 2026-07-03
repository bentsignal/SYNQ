import { StyleSheet, View } from "react-native";
import type { PlaybackPlayerActionState } from "../services/playback-player-state-service";
import { PlaybackPlayerControlButton } from "./PlaybackPlayerControlButton";

type PlaybackPlayerControlsProps = {
  actionState: PlaybackPlayerActionState;
  onFastForward: () => void;
  onRewind: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleLoopMode: () => void;
  onTogglePlayPause: () => void;
  onToggleShuffleMode: () => void;
};

export function PlaybackPlayerControls({
  actionState,
  onFastForward,
  onRewind,
  onSkipBack,
  onSkipForward,
  onToggleLoopMode,
  onTogglePlayPause,
  onToggleShuffleMode,
}: PlaybackPlayerControlsProps) {
  return (
    <>
      <View style={styles.controls}>
        <PlaybackPlayerControlButton
          disabled={!actionState.canSkipPrevious}
          label="Prev"
          onPress={onSkipBack}
        />
        <PlaybackPlayerControlButton
          disabled={!actionState.canPlayPause}
          label={actionState.playPauseLabel}
          onPress={onTogglePlayPause}
          variant="primary"
        />
        <PlaybackPlayerControlButton
          disabled={!actionState.canSkipNext}
          label="Next"
          onPress={onSkipForward}
        />
      </View>

      <View style={styles.controls}>
        <PlaybackPlayerControlButton
          disabled={!actionState.canRewind}
          label="-15s"
          onPress={onRewind}
        />
        <PlaybackPlayerControlButton
          disabled={!actionState.canFastForward}
          label="+15s"
          onPress={onFastForward}
        />
      </View>

      <View style={styles.controls}>
        <PlaybackPlayerControlButton
          label={actionState.shuffleLabel}
          onPress={onToggleShuffleMode}
        />
        <PlaybackPlayerControlButton
          label={actionState.loopLabel}
          onPress={onToggleLoopMode}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
