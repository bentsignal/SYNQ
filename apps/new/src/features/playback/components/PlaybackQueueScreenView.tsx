import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueController } from "../hooks/use-playback-queue-controller";
import { getPlaybackQueueScreenState } from "../services/playback-screen-state-service";
import { PlaybackQueueAdBreakPanel } from "./PlaybackQueueAdBreakPanel";
import { PlaybackQueueList } from "./PlaybackQueueList";

type PlaybackQueueScreenViewProps = PlaybackQueueController;

export function PlaybackQueueScreenView({
  actionState,
  activeTrack,
  adBreakActive,
  clearQueuedSongs,
  moveQueuedSong,
  playQueuedSong,
  removeQueuedSong,
  state,
}: PlaybackQueueScreenViewProps) {
  const theme = useCustomizationTheme();
  const screenState = getPlaybackQueueScreenState();

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

      {adBreakActive ? (
        <PlaybackQueueAdBreakPanel panelState={screenState.adBreakPanel} />
      ) : null}

      <PlaybackQueueList
        activeTrackId={activeTrack?.id ?? null}
        adBreakActive={adBreakActive}
        onMoveSong={moveQueuedSong}
        onPlaySong={playQueuedSong}
        onRemoveSong={removeQueuedSong}
        songs={state.queue}
      />

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canClearQueue}
          onPress={clearQueuedSongs}
          style={[
            styles.clearButton,
            { borderColor: theme.border },
            !actionState.canClearQueue ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.removeText, { color: theme.danger }]}>
            {screenState.clearQueueLabel}
          </Text>
        </Pressable>
      </View>

      <Link
        href={screenState.backLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {screenState.backLink.label}
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
  disabled: {
    opacity: 0.45,
  },
  removeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  clearButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 12,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
