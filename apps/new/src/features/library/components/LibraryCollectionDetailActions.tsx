import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { CollectionDetailActionState } from "../services/library-collection-action-state-service";
import type { getCollectionDetailViewState } from "../services/library-collection-detail-view-state-service";
import {
  LibraryActionButton,
  LibraryActionRow,
} from "./LibraryActionParts";

type LibraryCollectionDetailActionsProps = {
  actionLinks: ReturnType<typeof getCollectionDetailViewState>["actionLinks"];
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  onDelete: () => void;
  onExport: () => void;
  onPlay: () => void;
  onQueue: () => void;
};

export function LibraryCollectionDetailActions({
  actionLinks,
  actionState,
  detail,
  onDelete,
  onExport,
  onPlay,
  onQueue,
}: LibraryCollectionDetailActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <LibraryActionRow alignItems="center">
      <LibraryActionButton
        disabled={!actionState.canPlay}
        label="Play"
        minWidth={112}
        onPress={onPlay}
        theme={theme}
        variant="primary"
      />
      <LibraryActionButton
        disabled={!actionState.canQueue}
        label="Add to queue"
        onPress={onQueue}
        theme={theme}
        variant="secondary"
      />
      {actionState.canEdit ? (
        <Link
          className="text-sm font-extrabold uppercase"
          href={actionLinks.editHref}
          style={{ color: theme.accent }}
        >
          Edit {detail.eyebrow.toLowerCase()}
        </Link>
      ) : null}
      {actionState.canMutateSongs ? (
        <Link
          className="text-sm font-extrabold uppercase"
          href={actionLinks.addHref}
          style={{ color: theme.accent }}
        >
          Add songs
        </Link>
      ) : null}
      <LibraryActionButton
        disabled={!actionState.canExport}
        label={actionState.exportLabel}
        onPress={onExport}
        theme={theme}
        variant="secondary"
      />
      <LibraryActionButton
        disabled={!actionState.canDelete}
        label={actionState.deleteLabel}
        onPress={onDelete}
        theme={theme}
        variant="danger"
      />
    </LibraryActionRow>
  );
}
