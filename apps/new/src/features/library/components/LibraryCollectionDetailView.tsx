import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useLibraryCollectionDetailController } from "../hooks/use-library-collection-detail-controller";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getCollectionDetailViewState,
  getCollectionDetailStatusState,
} from "../services/library-collection-interaction-service";
import { LibraryCollectionDetailActions } from "./LibraryCollectionDetailActions";
import { LibraryCollectionDetailHeader } from "./LibraryCollectionDetailHeader";
import { LibraryCollectionDetailStatus } from "./LibraryCollectionDetailStatus";
import { LibraryCollectionSongList } from "./LibraryCollectionSongList";
import { LibrarySectionHeader } from "./LibrarySectionHeader";

type LibraryCollectionDetailResult = {
  detail: LibraryCollectionDetail;
  errors: unknown[];
};

type LibraryCollectionDetailViewProps = {
  collection: LibraryCollectionDetailResult;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function LibraryCollectionDetailView({
  collection,
  id,
  kind,
}: LibraryCollectionDetailViewProps) {
  const { detail, errors } = collection;
  const theme = useCustomizationTheme();
  const viewState = getCollectionDetailViewState({
    id,
    kind,
    songs: detail.songs,
  });
  const {
    actionState,
    deleteCurrentCollection,
    exportCollection,
    moveSong,
    movingSongId,
    mutationError,
    playCollection,
    queueCollection,
    removeSong,
    removingSongId,
  } = useLibraryCollectionDetailController({
    detail,
    id,
    kind,
  });
  const statusState = getCollectionDetailStatusState({
    errors,
    mutationError,
    updatedAt: detail.updatedAt,
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <LibraryCollectionDetailHeader
        detail={detail}
        updatedLabel={statusState.updatedLabel}
      />

      <LibraryCollectionDetailActions
        actionLinks={viewState.actionLinks}
        actionState={actionState}
        detail={detail}
        onDelete={deleteCurrentCollection}
        onExport={exportCollection}
        onPlay={playCollection}
        onQueue={queueCollection}
      />

      <LibrarySectionHeader
        meta={viewState.songSection.meta}
        title={viewState.songSection.title}
      />

      <LibraryCollectionSongList
        canMutateSongs={actionState.canMutateSongs}
        movingSongId={movingSongId}
        onMoveSong={moveSong}
        onRemoveSong={removeSong}
        removingSongId={removingSongId}
        songs={detail.songs}
      />

      <LibraryCollectionDetailStatus statusState={statusState} />

      <Link
        className="text-[15px] font-extrabold"
        href={viewState.backLink.href}
        style={{ color: theme.accent }}
      >
        {viewState.backLink.label}
      </Link>
    </ScrollView>
  );
}
