import { Link, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  usePlaybackActiveTrack,
  usePlaybackState,
  usePlaybackToggleActions,
} from "../hooks/use-playback-session-selectors";
import {
  getPlaybackMiniPlayerState,
  getPlaybackPlayerHref,
} from "../services/playback-screen-state-service";

export function PlaybackMiniPlayer() {
  const theme = useCustomizationTheme();
  const pathname = usePathname();
  const activeTrack = usePlaybackActiveTrack();
  const { pause, resume } = usePlaybackToggleActions();
  const state = usePlaybackState();
  const miniPlayer = getPlaybackMiniPlayerState({
    activeTrack,
    pathname,
    state,
  });
  const playerHref = getPlaybackPlayerHref();

  if (!miniPlayer.isVisible) {
    return null;
  }

  return (
    <View
      className="absolute bottom-[82px] left-3 right-3 z-20 min-h-16 flex-row items-center gap-3 rounded-lg border px-3.5 py-2.5"
      style={{
        backgroundColor: theme.surface,
        borderColor: miniPlayer.blockedByAd ? theme.danger : theme.border,
      }}
    >
      <Link asChild href={playerHref}>
        <Pressable className="min-w-0 flex-1 gap-[3px]">
          <Text
            className="text-[15px] font-extrabold leading-5"
            numberOfLines={1}
            style={{ color: theme.primaryText }}
          >
            {miniPlayer.title}
          </Text>
          <Text
            className="text-xs leading-[17px]"
            numberOfLines={1}
            style={{ color: theme.secondaryText }}
          >
            {miniPlayer.metaLabel}
          </Text>
        </Pressable>
      </Link>
      <Pressable
        disabled={!miniPlayer.canTogglePlayback}
        onPress={state.isPlaying ? pause : resume}
        className="min-h-10 min-w-[74px] items-center justify-center rounded-lg px-3.5"
        style={{
          backgroundColor: miniPlayer.blockedByAd
            ? theme.borderSubtle
            : theme.accent,
        }}
      >
        <Text
          className="text-[13px] font-extrabold"
          style={{
            color: miniPlayer.blockedByAd ? theme.mutedText : theme.onAccent,
          }}
        >
          {miniPlayer.playLabel}
        </Text>
      </Pressable>
    </View>
  );
}
