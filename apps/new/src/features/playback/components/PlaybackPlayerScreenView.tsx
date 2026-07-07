import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackPlayerController } from "../hooks/use-playback-player-controller";
import { PlaybackAdBreakPanel } from "./PlaybackAdBreakPanel";
import { PlaybackNowPlayingPanel } from "./PlaybackNowPlayingPanel";
import { PlaybackPlayerControls } from "./PlaybackPlayerControls";
import { PlaybackPlayerHeader } from "./PlaybackPlayerHeader";
import { PlaybackPlayerLinks } from "./PlaybackPlayerLinks";
import { PlaybackErrorPanel, PlaybackSessionPanel } from "./PlaybackSessionPanel";

type PlaybackPlayerScreenViewProps = PlaybackPlayerController;

export function PlaybackPlayerScreenView({
  actionState,
  activeArtworkUri,
  activeTrack,
  activeTrackDetailLink,
  activeTrackEditLink,
  adBreakPanel,
  adProgressPercent,
  fastForward,
  freeListeningRemainingMs,
  progressPercent,
  rewind,
  screenState,
  seekToPosition,
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
      <PlaybackPlayerHeader header={screenState.header} />

      {actionState.adBreakActive ? (
        <PlaybackAdBreakPanel
          panelState={adBreakPanel}
          progressPercent={adProgressPercent}
        />
      ) : null}

      <PlaybackNowPlayingPanel
        activeArtworkUri={activeArtworkUri}
        activeTrack={activeTrack}
        onSeekToPosition={seekToPosition}
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

      <PlaybackPlayerLinks
        detailLink={activeTrackDetailLink}
        editLink={activeTrackEditLink}
        queueLink={screenState.queueLink}
      />
    </ScrollView>
  );
}
