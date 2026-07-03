import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueController } from "../hooks/use-playback-queue-controller";
import { getPlaybackQueueScreenState } from "../services/playback-screen-state-service";
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
        <View style={styles.adPanel}>
          <Text style={styles.panelLabel}>{screenState.adBreakPanel.kicker}</Text>
          <Text style={styles.adTitle}>{screenState.adBreakPanel.title}</Text>
          <Text style={[styles.panelText, { color: theme.secondaryText }]}>
            {screenState.adBreakPanel.body}
          </Text>
          <View style={styles.adActions}>
            <Link asChild href={screenState.adBreakPanel.action.href}>
              <Pressable
                accessibilityRole="button"
                style={[
                  styles.premiumButton,
                  { backgroundColor: theme.surface },
                ]}
              >
                <Text style={styles.premiumText}>
                  {screenState.adBreakPanel.action.label}
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
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
  adPanel: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  adTitle: {
    color: "#9a3412",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  adActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  premiumButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  premiumText: {
    color: "#9a3412",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
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
