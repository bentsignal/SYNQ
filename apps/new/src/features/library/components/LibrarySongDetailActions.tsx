import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";
import { LibraryActionRow } from "./library-action";
import { LibrarySongDetailMutationActions } from "./LibrarySongDetailMutationActions";
import { LibrarySongDetailNavigationActions } from "./LibrarySongDetailNavigationActions";
import { LibrarySongDetailPlaybackActions } from "./LibrarySongDetailPlaybackActions";

type LibrarySongDetailActionsProps = {
  actionLinks: ReturnType<typeof getLibrarySongDetailViewState>["actionLinks"];
  actionState: LibrarySongDetailActionState;
  onDelete: () => void;
  onExport: () => void;
  onPlay: () => void;
  onQueue: () => void;
  onToggleLiked: () => void;
};

export function LibrarySongDetailActions({
  actionLinks,
  actionState,
  onDelete,
  onExport,
  onPlay,
  onQueue,
  onToggleLiked,
}: LibrarySongDetailActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <LibraryActionRow>
      <LibrarySongDetailPlaybackActions
        actionState={actionState}
        onPlay={onPlay}
        onQueue={onQueue}
        onToggleLiked={onToggleLiked}
        theme={theme}
      />
      <LibrarySongDetailNavigationActions
        actionLinks={actionLinks}
        theme={theme}
      />
      <LibrarySongDetailMutationActions
        actionState={actionState}
        onDelete={onDelete}
        onExport={onExport}
        theme={theme}
      />
    </LibraryActionRow>
  );
}
