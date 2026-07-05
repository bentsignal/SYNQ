import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueController } from "../hooks/use-playback-queue-controller";
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
  screenState,
  state,
}: PlaybackQueueScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {screenState.header.kicker}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          {screenState.header.title}
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          {screenState.header.subtitle}
        </Text>
      </View>

      {adBreakActive ? (
        <PlaybackQueueAdBreakPanel panelState={screenState.adBreakPanel} />
      ) : null}

      <PlaybackQueueList
        activeTrackId={activeTrack?.id ?? null}
        adBreakActive={adBreakActive}
        emptyState={screenState.emptyState}
        onMoveSong={moveQueuedSong}
        onPlaySong={playQueuedSong}
        onRemoveSong={removeQueuedSong}
        songs={state.queue}
      />

      <View className="flex-row flex-wrap items-center gap-3">
        <Pressable
          accessibilityRole="button"
          className={`min-h-9 items-center justify-center self-start rounded-lg border px-3 ${
            !actionState.canClearQueue ? "opacity-[0.45]" : ""
          }`}
          disabled={!actionState.canClearQueue}
          onPress={clearQueuedSongs}
          style={{ borderColor: theme.border }}
        >
          <Text
            className="text-[11px] font-extrabold uppercase"
            style={{ color: theme.danger }}
          >
            {screenState.clearQueueLabel}
          </Text>
        </Pressable>
      </View>

      <Link
        className="text-[15px] font-extrabold"
        href={screenState.backLink.href}
        style={{ color: theme.accent }}
      >
        {screenState.backLink.label}
      </Link>
    </ScrollView>
  );
}
