import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeAction } from "../services/home-action-service";
import type { HomeNowPlayingState } from "../services/home-now-playing-service";

type HomeNowPlayingPanelProps = {
  actions: HomeAction[];
  nowPlaying: HomeNowPlayingState;
};

export function HomeNowPlayingPanel({
  actions,
  nowPlaying,
}: HomeNowPlayingPanelProps) {
  const theme = useCustomizationTheme();
  const [playerAction, queueAction] = actions;

  return (
    <View
      className="gap-4 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View className="gap-1.5">
        <Text
          className="text-xs font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {nowPlaying.playbackLabel}
        </Text>
        <Text
          className="text-[22px] font-extrabold leading-7"
          style={{ color: theme.primaryText }}
        >
          {nowPlaying.title}
        </Text>
        <Text
          className="text-sm leading-5"
          style={{ color: theme.secondaryText }}
        >
          {nowPlaying.detailLabel}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2.5">
        {playerAction ? (
          <Link asChild href={playerAction.href}>
            <Pressable
              className="min-h-11 min-w-28 items-center justify-center rounded-lg px-[18px]"
              style={{ backgroundColor: theme.accent }}
            >
              <Text
                className="text-sm font-extrabold"
                style={{ color: theme.onAccent }}
              >
                {playerAction.label}
              </Text>
            </Pressable>
          </Link>
        ) : null}
        {queueAction ? (
          <Link asChild href={queueAction.href}>
            <Pressable
              className="min-h-11 min-w-28 items-center justify-center rounded-lg border px-[18px]"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
              }}
            >
              <Text
                className="text-sm font-extrabold"
                style={{ color: theme.accent }}
              >
                {queueAction.label}
              </Text>
            </Pressable>
          </Link>
        ) : null}
      </View>
    </View>
  );
}
