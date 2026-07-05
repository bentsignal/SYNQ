import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";
import {
  LibraryActionButton,
  LibraryActionLink,
  LibraryActionRow,
} from "./library-action";

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
      <LibraryActionButton
        disabled={!actionState.canPlay}
        flexGrow={1}
        label="Play"
        minWidth={112}
        onPress={onPlay}
        theme={theme}
        variant="primary"
      />
      <LibraryActionButton
        disabled={!actionState.canPlay}
        flexGrow={1}
        label="Add to queue"
        onPress={onQueue}
        theme={theme}
        variant="secondary"
      />
      <LibraryActionButton
        disabled={!actionState.canToggleLiked}
        flexGrow={1}
        label={actionState.likedLabel}
        onPress={onToggleLiked}
        theme={theme}
        variant="secondary"
      />
      <LibraryActionLink
        href={actionLinks.addToPlaylistHref}
        label="Add to playlist"
        minWidth={164}
        theme={theme}
      />
      <LibraryActionLink
        href={actionLinks.editHref}
        label="Edit"
        minWidth={132}
        theme={theme}
      />
      <LibraryActionButton
        disabled={!actionState.canExport}
        flexGrow={1}
        label={actionState.exportLabel}
        onPress={onExport}
        theme={theme}
        variant="secondary"
      />
      <LibraryActionButton
        disabled={!actionState.canDelete}
        flexGrow={1}
        label={actionState.deleteLabel}
        minWidth={112}
        onPress={onDelete}
        theme={theme}
        variant="danger"
      />
    </LibraryActionRow>
  );
}
