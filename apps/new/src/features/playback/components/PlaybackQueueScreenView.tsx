import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueController } from "../hooks/use-playback-queue-controller";
import { PlaybackQueueAdBreakPanel } from "./PlaybackQueueAdBreakPanel";
import { PlaybackQueueBackLink } from "./PlaybackQueueBackLink";
import { PlaybackQueueClearAction } from "./PlaybackQueueClearAction";
import { PlaybackQueueHeader } from "./PlaybackQueueHeader";
import { PlaybackQueueList } from "./PlaybackQueueList";

type PlaybackQueueScreenViewProps = PlaybackQueueController;

export function PlaybackQueueScreenView({
  actionState,
  adBreakActive,
  clearQueuedSongs,
  moveQueuedSong,
  playQueuedSong,
  removeQueuedSong,
  rows,
  screenState,
}: PlaybackQueueScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <PlaybackQueueHeader
        accentColor={theme.accent}
        header={screenState.header}
        primaryTextColor={theme.primaryText}
        secondaryTextColor={theme.secondaryText}
      />

      {adBreakActive ? (
        <PlaybackQueueAdBreakPanel panelState={screenState.adBreakPanel} />
      ) : null}

      <PlaybackQueueList
        emptyState={screenState.emptyState}
        onMoveSong={moveQueuedSong}
        onPlaySong={playQueuedSong}
        onRemoveSong={removeQueuedSong}
        rows={rows}
      />

      <PlaybackQueueClearAction
        actionState={actionState}
        borderColor={theme.border}
        dangerColor={theme.danger}
        label={screenState.clearQueueLabel}
        onClearQueue={clearQueuedSongs}
      />

      <PlaybackQueueBackLink
        accentColor={theme.accent}
        backLink={screenState.backLink}
      />
    </ScrollView>
  );
}
