import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackPlayerController } from "../hooks/use-playback-player-controller";
import { getPlaybackPlayerScreenState } from "../services/playback-screen-state-service";
import { PlaybackAdBreakPanel } from "./PlaybackAdBreakPanel";
import { PlaybackNowPlayingPanel } from "./PlaybackNowPlayingPanel";
import { PlaybackPlayerControls } from "./PlaybackPlayerControls";
import { PlaybackErrorPanel, PlaybackSessionPanel } from "./PlaybackSessionPanel";

type PlaybackPlayerScreenViewProps = PlaybackPlayerController;

export function PlaybackPlayerScreenView({
  actionState,
  activeTrack,
  adProgressPercent,
  fastForward,
  freeListeningRemainingMs,
  progressPercent,
  rewind,
  skipBack,
  skipForward,
  state,
  toggleLoopMode,
  togglePlayPause,
  toggleShuffleMode,
}: PlaybackPlayerScreenViewProps) {
  const theme = useCustomizationTheme();
  const screenState = getPlaybackPlayerScreenState();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {screenState.header.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {screenState.header.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {screenState.header.subtitle}
        </Text>
      </View>

      {actionState.adBreakActive ? (
        <PlaybackAdBreakPanel
          progressPercent={adProgressPercent}
          state={state}
        />
      ) : null}

      <PlaybackNowPlayingPanel
        activeTrack={activeTrack}
        progressPercent={progressPercent}
        state={state}
      />

      <PlaybackPlayerControls
        actionState={actionState}
        onFastForward={fastForward}
        onRewind={rewind}
        onSkipBack={skipBack}
        onSkipForward={skipForward}
        onToggleLoopMode={toggleLoopMode}
        onTogglePlayPause={togglePlayPause}
        onToggleShuffleMode={toggleShuffleMode}
      />

      <PlaybackSessionPanel
        freeListeningRemainingMs={freeListeningRemainingMs}
        state={state}
      />

      {state.error ? <PlaybackErrorPanel error={state.error} /> : null}

      <Link
        href={screenState.queueLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {screenState.queueLink.label}
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
