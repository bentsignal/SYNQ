import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import type { CollectionDetailActionState } from "../services/library-collection-action-state-service";
import {
  getCollectionAddSongsHref,
  getCollectionEditHref,
} from "../services/library-collection-navigation-service";
import {
  LibraryActionButton,
  LibraryActionRow,
} from "./LibraryActionParts";

type LibraryCollectionDetailActionsProps = {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  id: number;
  kind: LibraryCollectionDetailKind;
  onDelete: () => void;
  onExport: () => void;
  onPlay: () => void;
  onQueue: () => void;
};

export function LibraryCollectionDetailActions({
  actionState,
  detail,
  id,
  kind,
  onDelete,
  onExport,
  onPlay,
  onQueue,
}: LibraryCollectionDetailActionsProps) {
  const theme = useCustomizationTheme();
  const editHref = getCollectionEditHref({ id, kind });
  const addHref = getCollectionAddSongsHref({ id, kind });

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
          href={editHref}
          style={{ color: theme.accent }}
        >
          Edit {detail.eyebrow.toLowerCase()}
        </Link>
      ) : null}
      {actionState.canMutateSongs ? (
        <Link
          className="text-sm font-extrabold uppercase"
          href={addHref}
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
