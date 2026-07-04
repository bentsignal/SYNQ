import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import {
  getLibrarySongDetailHref,
  getLibrarySongEditHref,
} from "@/src/features/library/services/library-song-interaction-service";
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

      {activeTrack && actionState.canOpenActiveTrackDetails ? (
        <Link
          className="text-[15px] font-extrabold"
          href={getLibrarySongDetailHref({ songId: activeTrack.id })}
          style={{ color: theme.accent }}
        >
          Song details
        </Link>
      ) : null}

      {activeTrack && actionState.canEditActiveTrack ? (
        <Link
          className="text-[15px] font-extrabold"
          href={getLibrarySongEditHref({ songId: activeTrack.id })}
          style={{ color: theme.accent }}
        >
          Edit song
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
