import { View } from "react-native";
import type { PlaybackPlayerActionState } from "../services/playback-player-action-state-service";
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
      <View className="flex-row flex-wrap gap-3">
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

      <View className="flex-row flex-wrap gap-3">
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

      <View className="flex-row flex-wrap gap-3">
        <PlaybackPlayerControlButton
          label={actionState.shuffleLabel}
          onPress={onToggleShuffleMode}
          selected={actionState.shuffleActive}
        />
        <PlaybackPlayerControlButton
          label={actionState.loopLabel}
          onPress={onToggleLoopMode}
          selected={actionState.loopActive}
        />
      </View>
    </>
  );
}
