import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackHref } from "../services/playback-screen-state-service";

type PlaybackQueueAdBreakPanelState = {
  action: {
    href: PlaybackHref;
    label: string;
  };
  body: string;
  kicker: string;
  title: string;
};

type PlaybackQueueAdBreakPanelProps = {
  panelState: PlaybackQueueAdBreakPanelState;
};

export function PlaybackQueueAdBreakPanel({
  panelState,
}: PlaybackQueueAdBreakPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2.5 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-4">
      <Text className="text-xs font-extrabold uppercase">
        {panelState.kicker}
      </Text>
      <Text className="text-lg font-extrabold leading-6 text-[#9a3412]">
        {panelState.title}
      </Text>
      <Text className="text-sm leading-5" style={{ color: theme.secondaryText }}>
        {panelState.body}
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        <Link asChild href={panelState.action.href}>
          <Pressable
            accessibilityRole="button"
            className="min-h-[38px] items-center justify-center rounded-lg border border-[#fed7aa] px-3"
            style={{ backgroundColor: theme.surface }}
          >
            <Text className="text-[11px] font-extrabold uppercase text-[#9a3412]">
              {panelState.action.label}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
