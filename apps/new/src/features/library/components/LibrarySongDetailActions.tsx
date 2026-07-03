import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import { getLibrarySongEditHref } from "../services/library-song-interaction-service";
import {
  LibraryActionButton,
  LibraryActionRow,
  libraryActionPartStyles,
} from "./LibraryActionParts";

type LibrarySongDetailActionsProps = {
  actionState: LibrarySongDetailActionState;
  onDelete: () => void;
  onExport: () => void;
  onPlay: () => void;
  onQueue: () => void;
  onToggleLiked: () => void;
  songId: number;
};

export function LibrarySongDetailActions({
  actionState,
  onDelete,
  onExport,
  onPlay,
  onQueue,
  onToggleLiked,
  songId,
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
        href={getLibrarySongEditHref({ songId })}
        style={[
          libraryActionPartStyles.linkButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.accent,
            flexGrow: 1,
            lineHeight: 42,
            minWidth: 132,
          },
        ]}
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
