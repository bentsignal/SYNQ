import type { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import { LibrarySongDetailActionButton } from "./LibrarySongDetailActionButton";

type LibraryTheme = ReturnType<typeof useCustomizationTheme>;

type LibrarySongDetailPlaybackActionsProps = {
  actionState: LibrarySongDetailActionState;
  onPlay: () => void;
  onQueue: () => void;
  onToggleLiked: () => void;
  theme: LibraryTheme;
};

export function LibrarySongDetailPlaybackActions({
  actionState,
  onPlay,
  onQueue,
  onToggleLiked,
  theme,
}: LibrarySongDetailPlaybackActionsProps) {
  return (
    <>
      <LibrarySongDetailActionButton
        disabled={!actionState.canPlay}
        flexGrow={1}
        label="Play"
        minWidth={112}
        onPress={onPlay}
        theme={theme}
        variant="primary"
      />
      <LibrarySongDetailActionButton
        disabled={!actionState.canPlay}
        flexGrow={1}
        label="Add to queue"
        onPress={onQueue}
        theme={theme}
        variant="secondary"
      />
      <LibrarySongDetailActionButton
        disabled={!actionState.canToggleLiked}
        flexGrow={1}
        label={actionState.likedLabel}
        onPress={onToggleLiked}
        theme={theme}
        variant="secondary"
      />
    </>
  );
}
