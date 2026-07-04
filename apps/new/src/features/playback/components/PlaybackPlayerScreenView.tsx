import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackPlayerController } from "../hooks/use-playback-player-controller";
import { PlaybackAdBreakPanel } from "./PlaybackAdBreakPanel";
import { PlaybackNowPlayingPanel } from "./PlaybackNowPlayingPanel";
import { PlaybackPlayerControls } from "./PlaybackPlayerControls";
import { PlaybackErrorPanel, PlaybackSessionPanel } from "./PlaybackSessionPanel";

type PlaybackPlayerScreenViewProps = PlaybackPlayerController;

export function PlaybackPlayerScreenView({
  actionState,
  activeTrack,
  activeTrackDetailLink,
  activeTrackEditLink,
  adProgressPercent,
  fastForward,
  freeListeningRemainingMs,
  progressPercent,
  rewind,
  screenState,
  skipBack,
  skipForward,
  state,
  toggleLoopMode,
  togglePlayPause,
  toggleShuffleMode,
}: PlaybackPlayerScreenViewProps) {
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

      {activeTrackDetailLink ? (
        <Link
          className="text-[15px] font-extrabold"
          href={activeTrackDetailLink.href}
          style={{ color: theme.accent }}
        >
          {activeTrackDetailLink.label}
        </Link>
      ) : null}

      {activeTrackEditLink ? (
        <Link
          className="text-[15px] font-extrabold"
          href={activeTrackEditLink.href}
          style={{ color: theme.accent }}
        >
          {activeTrackEditLink.label}
        </Link>
      ) : null}

      <Link
        className="text-[15px] font-extrabold"
        href={screenState.queueLink.href}
        style={{ color: theme.accent }}
      >
        {screenState.queueLink.label}
      </Link>
    </ScrollView>
  );
}
