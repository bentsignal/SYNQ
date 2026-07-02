import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { usePlaybackSession } from "../hooks/use-playback-session";
import { getPlaybackMiniPlayerState } from "../services/playback-player-state-service";

export function PlaybackMiniPlayer() {
  const theme = useCustomizationTheme();
  const pathname = usePathname();
  const { activeTrack, pause, resume, state } = usePlaybackSession();
  const miniPlayer = getPlaybackMiniPlayerState({
    activeTrack,
    pathname,
    state,
  });

  if (!miniPlayer.isVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: miniPlayer.blockedByAd ? theme.danger : theme.border,
        },
      ]}
    >
      <Link asChild href="/player">
        <Pressable style={styles.trackLink}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.primaryText }]}
          >
            {miniPlayer.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.meta, { color: theme.secondaryText }]}
          >
            {miniPlayer.metaLabel}
          </Text>
        </Pressable>
      </Link>
      <Pressable
        disabled={!miniPlayer.canTogglePlayback}
        onPress={state.isPlaying ? pause : resume}
        style={[
          styles.command,
          {
            backgroundColor: miniPlayer.blockedByAd
              ? theme.borderSubtle
              : theme.accent,
          },
        ]}
      >
        <Text
          style={[
            styles.commandText,
            {
              color: miniPlayer.blockedByAd ? theme.mutedText : theme.onAccent,
            },
          ]}
        >
          {miniPlayer.playLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    bottom: 82,
    flexDirection: "row",
    gap: 12,
    left: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
    right: 12,
    zIndex: 20,
  },
  trackLink: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
  },
  command: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 74,
    paddingHorizontal: 14,
  },
  commandText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
