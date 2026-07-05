import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";
import {
  LibraryActionButton,
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
      <Link
        className="min-h-11 flex-grow overflow-hidden rounded-lg border px-3.5 text-center text-[13px] font-extrabold uppercase leading-[42px]"
        href={actionLinks.addToPlaylistHref}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.accent,
          minWidth: 164,
        }}
      >
        Add to playlist
      </Link>
      <Link
        className="min-h-11 flex-grow overflow-hidden rounded-lg border px-3.5 text-center text-[13px] font-extrabold uppercase leading-[42px]"
        href={actionLinks.editHref}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.accent,
          minWidth: 132,
        }}
      >
        Edit
      </Link>
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
