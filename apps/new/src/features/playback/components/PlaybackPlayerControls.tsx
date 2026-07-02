import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackPlayerActionState } from "../services/playback-player-state-service";

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
  const theme = useCustomizationTheme();

  return (
    <>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canSkipPrevious}
          onPress={onSkipBack}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canSkipPrevious ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Prev
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPlayPause}
          onPress={onTogglePlayPause}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !actionState.canPlayPause ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryText, { color: theme.onAccent }]}>
            {actionState.playPauseLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canSkipNext}
          onPress={onSkipForward}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canSkipNext ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            Next
          </Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canRewind}
          onPress={onRewind}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canRewind ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            -15s
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canFastForward}
          onPress={onFastForward}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canFastForward ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            +15s
          </Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={onToggleShuffleMode}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            {actionState.shuffleLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onToggleLoopMode}
          style={[
            styles.controlButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.controlText, { color: theme.primaryText }]}>
            {actionState.loopLabel}
          </Text>
        </Pressable>
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
  controlButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  controlText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
