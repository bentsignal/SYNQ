import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getPlaybackPlayerViewState } from "../services/playback-player-state-service";

type PlaybackAdBreakPanelState = ReturnType<
  typeof getPlaybackPlayerViewState
>["adBreakPanel"];

type PlaybackAdBreakPanelProps = {
  panelState: PlaybackAdBreakPanelState;
  progressPercent: number;
};

export function PlaybackAdBreakPanel({
  panelState,
  progressPercent,
}: PlaybackAdBreakPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2.5 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-4">
      <Text className="text-xs font-extrabold uppercase">
        {panelState.kicker}
      </Text>
      <Text className="text-xl font-extrabold leading-[26px] text-[#9a3412]">
        {panelState.title}
      </Text>
      <Text className="text-sm leading-5" style={{ color: theme.secondaryText }}>
        {panelState.body}
      </Text>
      <Text className="text-sm leading-5" style={{ color: theme.secondaryText }}>
        {panelState.progressLabel}
      </Text>
      <View
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: theme.border }}
      >
        <View
          className="h-full rounded-full"
          style={{ backgroundColor: theme.accent, width: `${progressPercent}%` }}
        />
      </View>
      <View className="flex-row flex-wrap gap-3">
        <Link asChild href={panelState.action.href}>
          <Pressable
            accessibilityRole="button"
            className="min-h-[46px] min-w-24 flex-grow items-center justify-center rounded-lg border px-3.5"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <Text
              className="text-[13px] font-extrabold uppercase"
              style={{ color: theme.primaryText }}
            >
              {panelState.action.label}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
