import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailController } from "../hooks/use-library-song-detail-controller";
import type { LibrarySongDetail } from "../services/library-song-detail-types-service";
import type { LibrarySongDetailScreenViewState } from "../services/library-song-detail-screen-view-state-service";
import { LibrarySongDetailActions } from "./LibrarySongDetailActions";
import { LibrarySongDetailBackLink } from "./LibrarySongDetailBackLink";
import { LibrarySongDetailHeader } from "./LibrarySongDetailHeader";
import {
  LibrarySongSourcePanel,
  LibrarySongStatusPanel,
} from "./LibrarySongDetailPanels";
import { LibrarySongRelationshipSections } from "./LibrarySongRelationshipSections";

type LibrarySongDetailViewProps = LibrarySongDetailController & {
  detail: LibrarySongDetail;
  screenViewState: LibrarySongDetailScreenViewState;
};

export function LibrarySongDetailView({
  actionState,
  deleteCurrentSong,
  detail,
  exportCurrentSong,
  playCurrentSong,
  queueCurrentSong,
  screenViewState,
  toggleLiked,
}: LibrarySongDetailViewProps) {
  const theme = useCustomizationTheme();
  const { statusState, viewState } = screenViewState;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <LibrarySongDetailHeader detail={detail} />

      <LibrarySongDetailActions
        actionLinks={viewState.actionLinks}
        actionState={actionState}
        onDelete={deleteCurrentSong}
        onExport={exportCurrentSong}
        onPlay={playCurrentSong}
        onQueue={queueCurrentSong}
        onToggleLiked={toggleLiked}
      />

      <LibrarySongRelationshipSections
        sections={viewState.relationshipSections}
      />

      <LibrarySongSourcePanel detail={detail} />

      <LibrarySongStatusPanel statusState={statusState} />

      <LibrarySongDetailBackLink backLink={viewState.backLink} />
    </ScrollView>
  );
}
