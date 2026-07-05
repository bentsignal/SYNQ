import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { useLibraryCollectionDetailController } from "../hooks/use-library-collection-detail-controller";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { CollectionDetailScreenViewState } from "../services/library-collection-detail-screen-view-state-service";
import { LibraryCollectionDetailActions } from "./LibraryCollectionDetailActions";
import { LibraryCollectionDetailHeader } from "./LibraryCollectionDetailHeader";
import { LibraryCollectionDetailStatus } from "./LibraryCollectionDetailStatus";
import { LibraryCollectionSongList } from "./LibraryCollectionSongList";
import { LibraryBackLink } from "./LibraryBackLink";
import { LibrarySectionHeader } from "./LibrarySectionHeader";

type LibraryCollectionDetailResult = {
  detail: LibraryCollectionDetail;
  errors: unknown[];
};

type LibraryCollectionDetailViewProps = {
  collection: LibraryCollectionDetailResult;
  controller: ReturnType<typeof useLibraryCollectionDetailController>;
  screenViewState: CollectionDetailScreenViewState;
};

export function LibraryCollectionDetailView({
  collection,
  controller,
  screenViewState,
}: LibraryCollectionDetailViewProps) {
  const { detail } = collection;
  const theme = useCustomizationTheme();
  const {
    actionState,
    deleteCurrentCollection,
    exportCollection,
    moveSong,
    playCollection,
    queueCollection,
    removeSong,
  } = controller;
  const { songRows, statusState, viewState } = screenViewState;

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
        emptyState={viewState.songSection.emptyState}
        onMoveSong={moveSong}
        onRemoveSong={removeSong}
        rows={songRows}
      />

      <LibraryCollectionDetailStatus statusState={statusState} />

      <LibraryBackLink backLink={viewState.backLink} theme={theme} />
    </ScrollView>
  );
}
